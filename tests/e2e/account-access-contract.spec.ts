import { expect, test } from "@playwright/test";

test.describe("account access contract", () => {
  test("public entry points expose the complete unauthenticated path", async ({ page }) => {
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your path." })).toBeVisible();
    await expect(page.getByText("Explore", { exact: true })).toBeVisible();
    await expect(page.getByText("Build", { exact: true })).toBeVisible();

    const explore = page.getByRole("link", { name: /Choose region/i }).first();
    await expect(explore).toHaveAttribute("href", /intent=explore/);
    await expect(page.locator('a[href*="intent=build"]').first()).toBeVisible();
    await explore.click();
    await expect(page.getByRole("heading", { name: "Choose your region." })).toBeVisible();
    await expect(page.getByText("Europe", { exact: true })).toBeVisible();
  });

  test("auth and recovery routes preserve usable forms", async ({ page }) => {
    for (const route of ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();
    }
    await page.goto("/sign-in?redirect_url=%2Fpricing%2Fcheckout%3Fplan%3Dpro&intent=build", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create one" })).toHaveAttribute("href", /redirect_url=/);
  });

  test("missing invitations explain the recoverable state", async ({ page }) => {
    await page.goto("/accept-invitation", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("This invitation link is incomplete.")).toBeVisible();
  });

  test("cloud entry remains usable on mobile and by keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your path." })).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
