import { expect, test } from "@playwright/test";

test.describe("account access contract", () => {
  test.describe.configure({ mode: "serial", timeout: 60_000 });

  test("public entry points expose the complete unauthenticated path", async ({ page }) => {
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your region." })).toBeVisible();
    await expect(page.getByText("Europe", { exact: true })).toBeVisible();

    await page.goto("/cloud/mode", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose your path." })).toBeVisible();
    await expect(page.getByText("Sandbox", { exact: true })).toBeVisible();
    await expect(page.getByText("Build", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: /Open playground/i }).click();
    await expect(page).toHaveURL(/\/playground$/);
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Demo Project (view only)" }).first()).toBeVisible();
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

  test("Sandbox is public, populated, and isolated from account projects", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    await page.goto("/playground", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("41", { exact: true })).toBeVisible();
    await expect(page.getByText("474", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Tracing" }).click();
    await expect(page).toHaveURL(/\/playground\/tracing$/);
    await expect(page.getByRole("link", { name: "Refund status investigation", exact: true })).toBeVisible();
    expect(pageErrors, "the public Sandbox must not surface an account or Convex error").toEqual([]);
  });

  test("all captured primary Sandbox surfaces have distinct functional routes", async ({ page }) => {
    const surfaces = [
      ["dashboards", "Dashboards"], ["tracing", "Tracing"], ["sessions", "Sessions"],
      ["users", "Users"], ["alerts", "Alerts"], ["prompts", "Prompts"],
      ["playground", "Playground"], ["scores", "Scores"], ["evaluators", "Evaluators"],
      ["annotation-queues", "Human Annotation"], ["datasets", "Datasets"],
      ["experiments", "Experiments"], ["settings", "Settings"],
    ] as const;
    for (const [slug, title] of surfaces) {
      await page.goto(`/playground/${slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1", { hasText: title })).toBeVisible();
      await expect(page.getByText(/ready to explore/i)).toHaveCount(0);
    }
  });

  test("captured Sandbox internal links resolve", async ({ page, request }, testInfo) => {
    testInfo.setTimeout(180_000);
    const surfaces = ["/playground", "/playground/dashboards", "/playground/tracing", "/playground/sessions", "/playground/users", "/playground/alerts", "/playground/prompts", "/playground/playground", "/playground/scores", "/playground/evaluators", "/playground/annotation-queues", "/playground/datasets", "/playground/experiments", "/playground/settings"];
    const links = new Set<string>();
    for (const surface of surfaces) {
      await page.goto(surface, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".captured-workspace")).toHaveAttribute("data-hydrated", "true");
      const hrefs = await page.locator("a[href^='/']").evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")).filter((href): href is string => Boolean(href)));
      hrefs.forEach((href) => links.add(href));
    }
    const failures: string[] = [];
    const responses = await Promise.all([...links].map(async (href) => ({ href, response: await request.get(href) })));
    for (const { href, response } of responses) if (response.status() >= 400) failures.push(`${href} (${response.status()})`);
    expect(failures, "captured Sandbox links must resolve").toEqual([]);
  });

  test("Sandbox controls filter data, open details, and enforce read-only writes", async ({ page }) => {
    await page.goto("/playground/tracing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Tracing" })).toBeVisible();
    await expect(page.locator(".captured-workspace")).toHaveAttribute("data-hydrated", "true");
    const consentButton = page.getByRole("button", { name: "Accept analytics" });
    if (await consentButton.isVisible()) await consentButton.click();
    await page.getByRole("button", { name: "Filters" }).first().click();
    await expect(page.getByRole("button", { name: "Filters" }).first()).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("textbox", { name: "Search", exact: true }).fill("refund");
    await expect(page).toHaveURL(/(?:\?|&)q=refund/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("textbox", { name: "Search", exact: true })).toHaveValue("refund");
    await page.getByRole("button", { name: "Chart", exact: true }).click();
    await expect(page).toHaveURL(/(?:\?|&)view=chart/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Chart", exact: true })).toHaveClass(/is-active/);
    await page.getByRole("button", { name: /Columns 16\/40/ }).click();
    await expect(page.getByRole("button", { name: /Columns 16\/40/ })).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: "Table", exact: true }).click();
    await expect(page.getByRole("link", { name: "Refund status investigation", exact: true })).toBeVisible();
    await page.getByRole("link", { name: /Refund status investigation/ }).click();
    await expect(page.locator("h2", { hasText: "Refund status investigation" })).toBeVisible();
    await expect(page.getByText("gpt-5.6-luna", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Create new" }).click();
    await expect(page.getByRole("dialog", { name: "This workspace is view only." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Build a real project" })).toHaveAttribute("href", "/cloud");
    await page.getByRole("button", { name: "Close" }).last().click();
    await expect(page.getByRole("dialog", { name: "This workspace is view only." })).toHaveCount(0);

    await page.getByRole("link", { name: "Playground", exact: true }).click();
    await expect(page).toHaveURL(/\/playground\/playground$/);
    await expect(page.getByRole("heading", { name: "Playground" })).toBeVisible();
    await expect(page.locator(".captured-workspace")).toHaveAttribute("data-hydrated", "true");
    await page.getByRole("button", { name: "Run prompt" }).click();
    await expect(page.getByText(/verified tool evidence/)).toBeVisible();
    if (await consentButton.isVisible()) {
      await consentButton.click();
      await expect(consentButton).toBeHidden();
    }
    await page.getByRole("button", { name: "Save version" }).click();
    await expect(page.getByRole("dialog", { name: "This workspace is view only." })).toBeVisible();
  });

  test("captured Sandbox collection controls remain interactive", async ({ page }) => {
    await page.goto("/playground/prompts", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".captured-workspace")).toHaveAttribute("data-hydrated", "true");
    await page.locator(".captured-prompt-editor-toolbar button", { hasText: "Chat" }).click();
    await expect(page.locator(".captured-prompt-editor-toolbar button", { hasText: "Chat" })).toBeVisible();
    await page.locator(".captured-prompt-list-row", { hasText: "order-resolution" }).click();
    await expect(page.getByRole("textbox", { name: "Prompt content" })).toHaveValue(/order-resolution/);

    await page.goto("/playground/datasets", { waitUntil: "domcontentloaded" });
    await page.locator(".captured-datasets-surface input[aria-label='Search datasets']").fill("does-not-exist");
    await expect(page.locator(".captured-datasets-surface input[aria-label='Search datasets']")).toHaveValue("does-not-exist");

    await page.goto("/playground/settings", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".captured-workspace")).toHaveAttribute("data-hydrated", "true");
    await page.locator(".captured-settings nav button", { hasText: "LLM Connections" }).click();
    await expect(page.locator(".captured-settings button", { hasText: "Open LLM Connections" })).toBeVisible();
    await page.locator(".captured-settings button", { hasText: "Open LLM Connections" }).click();
    await expect(page.getByRole("dialog", { name: /This workspace is view only|ready in your live project/ })).toBeVisible();
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
