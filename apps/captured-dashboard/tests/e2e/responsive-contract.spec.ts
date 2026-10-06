import { expect, test } from "@playwright/test";

const viewports = [
  ["desktop-wide", 1440, 900],
  ["desktop-compact", 1280, 800],
  ["tablet-landscape", 1024, 768],
  ["tablet-portrait", 768, 1024],
  ["mobile-standard", 390, 844],
  ["mobile-narrow", 375, 812],
] as const;

test.describe("standalone captured Sandbox responsive contract", () => {
  for (const [name, width, height] of viewports) {
    test(`${name} keeps the shell and workspace usable`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      const requests: string[] = [];
      page.on("request", (request) => {
        if (request.method() !== "GET" && !request.url().startsWith("data:")) requests.push(request.url());
      });

      const response = await page.goto("/playground/sessions", { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.locator(".captured-workspace")).toBeVisible();
      await expect(page.locator(".captured-workspace-header")).toBeVisible();
      await expect(page.locator(".captured-sessions-surface")).toBeVisible();

      const viewport = await page.locator("body").evaluate((element) => ({
        width: element.clientWidth,
        height: element.clientHeight,
      }));
      const shell = await page.locator(".captured-workspace").evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height, scrollWidth: element.scrollWidth };
      });
      expect(viewport.width).toBe(width);
      expect(viewport.height).toBe(height);
      expect(shell.width).toBeGreaterThan(0);
      expect(shell.width).toBeLessThanOrEqual(width);
      expect(shell.height).toBeGreaterThanOrEqual(height);
      expect(shell.scrollWidth).toBeGreaterThanOrEqual(shell.width);
      expect(requests, "responsive Sandbox must not issue write requests").toEqual([]);

      if (width <= 700) {
        await expect(page.locator(".captured-app-sidebar")).not.toHaveClass(/is-open/);
        await page.getByRole("button", { name: "Toggle sidebar" }).click();
        await expect(page.locator(".captured-app-sidebar")).toHaveClass(/is-open/);
        await expect(page.locator(".captured-app-backdrop")).toBeVisible();
      }
    });
  }
});
