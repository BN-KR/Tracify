import { expect, test } from "@playwright/test";

const viewports = [
  ["desktop-wide", 1440, 900],
  ["desktop-compact", 1280, 800],
  ["tablet-landscape", 1024, 768],
  ["tablet-portrait", 768, 1024],
  ["mobile-standard", 390, 844],
  ["mobile-narrow", 375, 812],
] as const;

const surfaces = [
  ["home", "/playground"],
  ["dashboards", "/playground/dashboards"],
  ["tracing", "/playground/tracing"],
  ["sessions", "/playground/sessions"],
  ["users", "/playground/users"],
  ["alerts", "/playground/alerts"],
  ["prompts", "/playground/prompts"],
  ["playground", "/playground/playground"],
  ["scores", "/playground/scores"],
  ["evaluators", "/playground/evaluators"],
  ["annotation-queues", "/playground/annotation-queues"],
  ["datasets", "/playground/datasets"],
  ["experiments", "/playground/experiments"],
  ["settings", "/playground/settings"],
] as const;

test.describe("captured Sandbox viewport parity", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  for (const [viewportName, width, height] of viewports) {
    test(`${viewportName} renders every captured surface`, async ({ page }, testInfo) => {
      testInfo.setTimeout(300_000);
      await page.setViewportSize({ width, height });
      for (const [surfaceName, path] of surfaces) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await expect(page.locator(".captured-workspace")).toHaveAttribute("data-hydrated", "true");
        await expect(page.locator(".captured-workspace")).toBeVisible();
        await expect(page.getByRole("link", { name: "Langfuse dashboard" })).toHaveCount(1);
        await expect(page.getByText("Demo Project (view only)", { exact: true }).first()).toBeVisible();
        await expect(page.locator(".captured-workspace")).not.toContainText("Tracify");
        await page.screenshot({
          path: testInfo.outputPath(`${viewportName}-${surfaceName}.png`),
          fullPage: true,
        });
      }
    });
  }
});
