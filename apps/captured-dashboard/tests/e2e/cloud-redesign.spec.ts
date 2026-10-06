import { expect, test } from "@playwright/test";

const surfaces = ["", "dashboards", "costs", "playground", "tracing", "sessions", "users", "alerts", "prompts", "scores", "evaluators", "annotation-queues", "datasets", "experiments", "settings"];

for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]] as const) {
  test(`${name} covers every standalone surface without overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const surface of surfaces) {
      await page.goto(`/playground${surface ? `/${surface}` : ""}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".captured-workspace")).toBeVisible();
      const metrics = await page.locator("body").evaluate((body) => ({ client: body.clientWidth, scroll: body.scrollWidth }));
      expect(metrics.client, surface).toBe(width);
      expect(metrics.scroll, surface).toBeLessThanOrEqual(metrics.client);
    }
  });
}

test("navigation and local interactions remain functional", async ({ page }) => {
  await page.goto("/playground", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Go to..." }).click();
  await page.getByLabel("Search navigation").fill("sessions");
  await page.getByRole("dialog", { name: "Go to" }).getByRole("link", { name: "Sessions" }).click();
  await expect(page).toHaveURL(/\/playground\/sessions$/);
  await page.getByRole("button", { name: /Your Orgs/ }).click();
  await expect(page.getByRole("dialog", { name: "Project switcher" })).toBeVisible();
  await page.keyboard.press("Escape");
});

test("health boundary is explicit and read-only", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ status: "ok", writesEnabled: false });
});
