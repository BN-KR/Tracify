import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

function staticCloudRoutes(directory: string, segments: string[] = []): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && !entry.name.includes("[")) return staticCloudRoutes(path.join(directory, entry.name), [...segments, entry.name]);
    return entry.name === "page.tsx" ? [segments.join("/")] : [];
  });
}
const routes = staticCloudRoutes(path.join(process.cwd(), "src/app/(frontend)/dashboard/[projectId]"));
test.use({ storageState: process.env.TRACIFY_E2E_STORAGE_STATE });
for (const [viewport, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]] as const) {
  test(`${viewport} verifies real authenticated cloud routes`, async ({ page }, testInfo) => {
    test.setTimeout(240_000);
    const projectId = process.env.TRACIFY_E2E_PROJECT_ID;
    if (!process.env.TRACIFY_E2E_STORAGE_STATE || !projectId) {
      throw new Error("AUTHENTICATED_VERIFICATION_BLOCKED: provide normal authenticated browser storage and a real TRACIFY_E2E_PROJECT_ID");
    }
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height });
    const projectPath = `/dashboard/${encodeURIComponent(projectId)}`;
    for (const route of routes) {
      const response = await page.goto(`${projectPath}${route ? `/${route}` : ""}`, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBeLessThan(400);
      const pathname = new URL(page.url()).pathname;
      expect(pathname === projectPath || pathname.startsWith(`${projectPath}/`), route).toBe(true);
      if (!route) {
        await expect(page.locator('.captured-workspace[data-workspace-mode="live"][data-hydrated="true"]')).toBeVisible({ timeout: 30_000 });
        await page.screenshot({ path: testInfo.outputPath(`cloud-${viewport}.png`), fullPage: true });
      }
      const metrics = await page.locator("body").evaluate((body) => ({ client: body.clientWidth, scroll: body.scrollWidth }));
      expect(metrics.scroll, route).toBeLessThanOrEqual(metrics.client);
      expect(errors, route).toEqual([]);
    }
  });
}
