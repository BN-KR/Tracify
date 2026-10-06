import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const cases = [
  ["home", "/output/langfuse-capture/pages/023.html", "/playground"],
  ["tracing", "/output/langfuse-capture/pages/025.html", "/playground/tracing"],
  ["sessions", "/output/langfuse-capture/pages/026.html", "/playground/sessions"],
  ["users", "/output/langfuse-capture/pages/027.html", "/playground/users"],
  ["alerts", "/output/langfuse-capture/pages/028.html", "/playground/alerts"],
  ["prompts", "/output/langfuse-capture/pages/029.html", "/playground/prompts"],
  ["playground", "/output/langfuse-capture/pages/030.html", "/playground/playground"],
  ["scores", "/output/langfuse-capture/pages/031.html", "/playground/scores"],
  ["evaluators", "/output/langfuse-capture/pages/032.html", "/playground/evaluators"],
  ["annotation", "/output/langfuse-capture/pages/033.html", "/playground/annotation-queues"],
  ["datasets", "/output/langfuse-capture/pages/034.html", "/playground/datasets"],
  ["experiments", "/output/langfuse-capture/pages/035.html", "/playground/experiments"],
  ["settings", "/output/langfuse-capture/pages/036.html", "/playground/settings"],
  ["dashboards", "/output/langfuse-capture/pages/024.html", "/playground/dashboards"],
] as const;
const viewports = [
  ["desktop-wide", 1440, 900],
  ["desktop-compact", 1280, 800],
  ["tablet-landscape", 1024, 768],
  ["tablet-portrait", 768, 1024],
  ["mobile-standard", 390, 844],
  ["mobile-narrow", 375, 812],
] as const;

// This suite produces its own stable artifacts; Playwright's per-test trace/video
// recorder adds a second failure mode while closing two long-lived pages.
test.use({ trace: "off", video: "off", screenshot: "off" });

const referenceBaseUrl = (process.env.REFERENCE_BASE_URL ?? "http://127.0.0.1:4173").replace(/\/$/, "");
const referencePathForBase = (referencePath: string) =>
  referenceBaseUrl.includes("tracify-dashboard-reference.vercel.app")
    ? referencePath.replace(/^\/output\/langfuse-capture\/pages\//, "/pages/")
    : referencePath;

test.describe("reference screenshot parity", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test.beforeAll(async ({ request }) => {
    const probe = `${referenceBaseUrl}${referencePathForBase(cases[0][1])}`;
    try {
      const response = await request.get(probe, { timeout: 5_000 });
      if (!response.ok()) throw new Error(`HTTP ${response.status()}`);
    } catch (error) {
      throw new Error(`Authoritative reference unavailable at ${probe}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  for (const [viewportName, width, height] of viewports) {
    test(`${viewportName} captures paired reference and Sandbox artifacts`, async ({ browser }, testInfo) => {
      test.setTimeout(180_000);
      const outputDir = join(process.cwd(), "artifacts", "reference-parity", viewportName);
      await mkdir(outputDir, { recursive: true });
      const reference = await browser.newPage({ viewport: { width, height } });
      const implementation = await browser.newPage({ viewport: { width, height } });
      const forbiddenReferenceRequests: string[] = [];
      implementation.on("request", (request) => {
        const url = request.url();
        if (url.includes("langfuse.com") || url.includes("langfuse.cloud") || url.includes("tracify-dashboard-reference")) {
          forbiddenReferenceRequests.push(url);
        }
      });
      for (const [surface, referencePath, implementationPath] of cases) {
        // The archived reference can keep resource connections open; DOM readiness
        // is the stable boundary for a static capture, while the implementation
        // has its own explicit hydration assertion below.
        await reference.goto(`${referenceBaseUrl}${referencePathForBase(referencePath)}`, { waitUntil: "domcontentloaded" });
        await expect(reference.locator("body")).toBeVisible();
        await implementation.goto(implementationPath, { waitUntil: "domcontentloaded" });
        await expect(implementation.locator(".captured-workspace")).toHaveAttribute("data-hydrated", "true", { timeout: 30_000 });
        await Promise.all([
          reference.evaluate(async () => {
            await document.fonts.ready;
            await new Promise<void>((resolve) => setTimeout(resolve, 100));
          }),
          implementation.evaluate(async () => {
            await document.fonts.ready;
            await new Promise<void>((resolve) => setTimeout(resolve, 100));
          }),
        ]);
        await expect(implementation.locator(".captured-workspace")).not.toContainText("Tracify");
        if (surface === "tracing") {
          await expect(implementation.getByRole("button", { name: "Create new" })).toHaveCount(0);
        }
        const referencePathname = join(outputDir, `${surface}-reference.png`);
        const implementationPathname = join(outputDir, `${surface}-implementation.png`);
        await reference.screenshot({ path: referencePathname, fullPage: true });
        await implementation.screenshot({ path: implementationPathname, fullPage: true });
        const [referenceMeta, implementationMeta] = await Promise.all([
          sharp(referencePathname).metadata(),
          sharp(implementationPathname).metadata(),
        ]);
        expect(referenceMeta.width, `${surface} reference width`).toBe(implementationMeta.width);
        expect(referenceMeta.height, `${surface} reference height`).toBe(implementationMeta.height);
        testInfo.attach(`${viewportName}-${surface}-reference`, { path: referencePathname, contentType: "image/png" });
        testInfo.attach(`${viewportName}-${surface}-implementation`, { path: implementationPathname, contentType: "image/png" });
      }
      expect(forbiddenReferenceRequests, "implementation must not load reference production resources").toEqual([]);
      await reference.close();
      await implementation.close();
    });
  }
});
