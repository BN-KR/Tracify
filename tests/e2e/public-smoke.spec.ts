import { expect, test } from "@playwright/test";

test("public product surfaces load", async ({ page }) => {
  for (const route of ["/", "/pricing", "/docs", "/integrations"]) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} should return a successful response`).toBeTruthy();
    await expect(page.locator("body")).not.toBeEmpty();
  }
});

test("sign-in route redirects safely when auth is unavailable", async ({ request }) => {
  const response = await request.get("/sign-in", { maxRedirects: 0 });
  expect([200, 301, 302, 307, 308]).toContain(response.status());
});
