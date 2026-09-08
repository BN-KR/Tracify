import { expect, test } from "@playwright/test";

test.describe("account access contract", () => {
  test("public entry points expose the complete unauthenticated path", async ({ page }) => {
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your path." })).toBeVisible();
    await expect(page.getByText("Explore", { exact: true })).toBeVisible();
    await expect(page.getByText("Build", { exact: true })).toBeVisible();

    const explore = page.getByRole("link", { name: /Open playground/i });
    await expect(explore).toHaveAttribute("href", /playground\?view=home/);
    await expect(explore).toHaveAttribute("href", /userId=usr_demo_7f3a9c21/);
    await expect(page.locator('a[href*="intent=build"]').first()).toBeVisible();
    await explore.click();
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Demo Project (view only)" })).toBeVisible();
    await expect(page).toHaveURL(/\/playground\?view=home&userId=usr_demo_7f3a9c21/);
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

  test("Explore is public, populated, and isolated from account-scoped projects", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    await page.goto("/playground?view=home&userId=usr_demo_7f3a9c21", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByText("Performance over time")).toBeVisible();
    await expect(page.getByRole("link", { name: "Tracify dashboard" })).toHaveAttribute("href", "/dashboard");
    await expect(page.locator("body")).not.toContainText("Dashboard unavailable");
    await expect(page.locator("body")).not.toContainText("Langfuse");
    expect(pageErrors, "the public synthetic playground must not surface a Convex query error").toEqual([]);
  });

  test("Explore navigation and controls stay inside the synthetic workspace", async ({ page }) => {
    await page.goto("/playground?view=home", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Tracing", exact: true }).click();
    await expect(page).toHaveURL(/\/playground\?view=tracing/);
    await expect(page.getByRole("heading", { name: "Recent traces" })).toBeVisible();
    await page.getByRole("button", { name: "Failures" }).click();
    await expect(page.getByText("run_support_19de")).toBeVisible();
    await expect(page.getByText("run_support_8f2c")).not.toBeVisible();
    await page.getByRole("button", { name: "Open trace" }).click();
    await expect(page.getByText("Trace detail / simulated")).toBeVisible();
    await page.getByRole("button", { name: "Close trace detail" }).click();
    await expect(page.getByText("Trace detail / simulated")).not.toBeVisible();
    await page.getByRole("link", { name: "Costs" }).click();
    await expect(page).toHaveURL(/\/playground\?view=costs/);
    await expect(page.getByText("Costs is ready to explore")).toBeVisible();
  });

  test("Build keeps region selection and shows a handoff state", async ({ page }) => {
    await page.goto("/cloud/region?next=%2Fsign-up&intent=build", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your region." })).toBeVisible();
    await expect(page.getByRole("button", { name: /Europe/ })).toBeVisible();
    await page.goto("/cloud/connecting?region=eu&next=%2Fsign-up&intent=build", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("status")).toContainText("Connecting to Europe cloud");
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
