import { expect, test } from "@playwright/test";

test.describe("account access contract", () => {
  // The managed Next server can take ~30s to compile the first public route
  // on a cold Windows run; keep assertions unchanged while allowing the
  // contract enough time to exercise the complete auth sequence.
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test("public entry points expose the complete unauthenticated path", async ({ page }) => {
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your region." })).toBeVisible();
    await expect(page.getByText("Europe", { exact: true })).toBeVisible();

    await page.goto("/cloud/mode", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your path." })).toBeVisible();
    await expect(page.getByText("Sandbox", { exact: true })).toBeVisible();
    await expect(page.getByText("Build", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: /Open playground/i }).click();
    await expect(page).toHaveURL(/\/demo\/project$/);
  });

  test("auth and recovery routes preserve usable forms", async ({ page }) => {
    for (const route of ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();
    }
    await page.goto("/sign-in?redirect_url=%2Fpricing%2Fcheckout%3Fplan%3Dpro&intent=build", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create one" })).toHaveAttribute("href", /redirect_url=/);
    await page.goto("/sign-in?redirect=%2Flegacy&redirect_url=%2Fcanonical%3Ftab%3Dmembers", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: "Create one" })).toHaveAttribute("href", /redirect_url=%2Fcanonical%3Ftab%3Dmembers/);
  });

  test("missing invitations explain the recoverable state", async ({ page }) => {
    await page.goto("/accept-invitation", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("This invitation link is incomplete.")).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "Choose your region." })).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
