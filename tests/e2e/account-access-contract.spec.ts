import { expect, test } from "@playwright/test";

test.describe("account access contract", () => {
  test("public entry points expose the complete unauthenticated path", async ({ page }) => {
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your path." })).toBeVisible();
    await expect(page.getByText("Explore", { exact: true })).toBeVisible();
    await expect(page.getByText("Build", { exact: true })).toBeVisible();

    const explore = page.getByRole("link", { name: /Choose region/i }).first();
    await expect(explore).toHaveAttribute("href", /intent=explore/);
    await expect(explore).toHaveAttribute("href", /userId%3Dusr_demo_7f3a9c21/);
    await expect(page.locator('a[href*="intent=build"]').first()).toBeVisible();
    await explore.click();
    await expect(page.getByRole("heading", { name: "Choose your region." })).toBeVisible();
    await expect(page.getByText("Europe", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Europe/ })).toHaveAttribute("href", /userId%3Dusr_demo_7f3a9c21/);
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

  test("account-scoped playground exits cleanly when the session is absent", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    await page.goto("/playground?intent=explore", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=%2Fplayground$/, { timeout: 30_000 });
    expect(pageErrors, "the unauthenticated playground must not surface a Convex query error").toEqual([]);
  });

  test("project routes do not render invalid Convex IDs before authentication", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    await page.goto("/dashboard/demo-project/settings", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=%2Fdashboard%2Fdemo-project%2Fsettings$/, { timeout: 30_000 });
    expect(pageErrors, "an unauthenticated project route must not surface a Convex ID error").toEqual([]);
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
