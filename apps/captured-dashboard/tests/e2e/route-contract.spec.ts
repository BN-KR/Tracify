import { expect, test } from "@playwright/test";

const surfaces = [
  "",
  "dashboards",
  "tracing",
  "sessions",
  "users",
  "alerts",
  "prompts",
  "playground",
  "scores",
  "evaluators",
  "annotation-queues",
  "datasets",
  "experiments",
  "settings",
  "traces",
  "runs",
  "journey",
  "evals",
  "human-annotation",
  "prompt-management",
  "prompt-playground",
  "billing",
  "reports",
  "quickstart",
  "docs",
  "manage",
  "api-keys",
  "integrations",
  "members",
  "dashboard",
  "overview",
  "custom-dashboards",
  "custom-dashboard",
  "comparison",
  "cost",
  "prompt-versions",
  "versions",
  "score",
  "evaluator",
  "dataset",
  "experiment",
  "annotation-queue",
];

test.describe("standalone captured Sandbox", () => {
  test("exposes a read-only deployment health contract", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    await expect(response).toBeOK();
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      mode: "sandbox",
      backend: "in-memory",
      writesEnabled: false,
    });
  });

  test("returns 404 for an unsupported standalone route", async ({ request }) => {
    const response = await request.get("/playground/not-a-real-surface");
    expect(response.status()).toBe(404);
  });

  test("keeps Users filters local and interactive", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "GET" && !request.url().startsWith("data:")) writes.push(request.url());
    });
    await page.goto("/playground/users", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Filters/ }).click();
    await expect(page.getByRole("dialog", { name: "User filters" })).toBeVisible();
    await page.getByLabel("Filter users").fill("alice");
    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page.getByRole("dialog", { name: "User filters" })).toHaveCount(0);
    expect(writes).toEqual([]);
  });

  test("keeps the Settings tab route-backed across reload", async ({ page }) => {
    await page.goto("/playground/settings?tab=Members", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/playground\/settings\?tab=Members$/);
    await expect(page.getByRole("button", { name: "Members", exact: true })).toHaveClass(/active/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/playground\/settings\?tab=Members$/);
    await expect(page.getByRole("button", { name: "Members", exact: true })).toHaveClass(/active/);
  });

  test("simulates Sandbox project settings save locally", async ({ page }) => {
    await page.goto("/playground/settings", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Save", exact: true }).first().click();
    await expect(page.getByRole("status")).toContainText("Sandbox simulated settings save");
  });

  test("does not call the reference product or external runtime origins", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (request.resourceType() !== "document" && !url.startsWith("http://127.0.0.1") && !url.startsWith("http://localhost") && !url.startsWith("data:")) {
        external.push(url);
      }
    });
    await page.goto("/playground", { waitUntil: "domcontentloaded" });
    expect(external, "standalone Sandbox must not call external runtime origins").toEqual([]);
  });

  for (const surface of surfaces) {
    test(`renders ${surface || "home"}`, async ({ page }) => {
      const requests: string[] = [];
      page.on("request", (request) => {
        if (request.method() !== "GET" && !request.url().startsWith("data:")) requests.push(request.url());
      });
      const response = await page.goto(`/playground${surface ? `/${surface}` : ""}`, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.locator(".captured-workspace")).toBeVisible();
      await expect(page.locator(".captured-workspace")).not.toContainText("Tracify");
      expect(requests, "standalone Sandbox must not issue write requests").toEqual([]);
    });
  }

  test("opens and dismisses the mobile navigation drawer without writes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "GET" && !request.url().startsWith("data:")) requests.push(request.url());
    });
    await page.goto("/playground/sessions", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".captured-app-sidebar")).not.toHaveClass(/is-open/);
    await page.getByRole("button", { name: "Toggle sidebar" }).click();
    await expect(page.locator(".captured-app-sidebar")).toHaveClass(/is-open/);
    await expect(page.locator(".captured-app-backdrop")).toBeVisible();
    await page.locator(".captured-app-sidebar").getByRole("button", { name: "Close sidebar" }).click();
    await expect(page.locator(".captured-app-sidebar")).not.toHaveClass(/is-open/);
    await expect(page.locator(".captured-app-backdrop")).toHaveCount(0);
    expect(requests, "mobile drawer must not issue write requests").toEqual([]);
  });

  test("keeps shell navigation controls local and dismissible", async ({ page }) => {
    await page.goto("/playground", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Go to..." }).click();
    await expect(page.getByRole("dialog", { name: "Go to" })).toBeVisible();
    await page.getByLabel("Search navigation").fill("sessions");
    await page.getByRole("dialog", { name: "Go to" }).getByRole("link", { name: "Sessions" }).click();
    await expect(page).toHaveURL(/\/playground\/sessions$/);
    await page.getByRole("button", { name: "Demo Project \(view only\)" }).click();
    await expect(page.getByRole("dialog", { name: "Project switcher" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Project switcher" })).toHaveCount(0);
    await page.getByRole("button", { name: "Kristoffer Bon account menu" }).click();
    await expect(page.getByRole("dialog", { name: "Account menu" })).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Account menu" })).toHaveCount(0);
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog", { name: "Go to" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Go to" })).toHaveCount(0);
    await page.getByRole("button", { name: /Your Orgs/ }).click();
    await expect(page.getByRole("dialog", { name: "Project switcher" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book a call" })).toHaveAttribute("href", /^mailto:/);
    await expect(page.getByRole("link", { name: "Support" })).toHaveAttribute("href", /^mailto:/);
  });

  test("simulates Sandbox mutation-shaped workflows without writes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "GET" && !request.url().startsWith("data:")) writes.push(request.url());
    });

    await page.goto("/playground/dashboards/new", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Dashboard name").fill("Sandbox dashboard");
    await page.getByRole("button", { name: "Create dashboard" }).click();
    await expect(page.getByRole("status")).toContainText("Sandbox simulated creation");
    await page.getByRole("link", { name: "Dashboards", exact: true }).first().click();
    await expect(page).toHaveURL(/\/playground\/dashboards$/);
    await expect(page.getByRole("link", { name: "Sandbox dashboard" })).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: "Sandbox dashboard" })).toHaveCount(0);

    await page.goto("/playground/alerts?view=create", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Name").fill("Sandbox latency");
    await page.getByLabel("Threshold").fill("2");
    await page.getByRole("button", { name: "Save alert" }).click();
    await expect(page.getByRole("status")).toContainText("Sandbox simulated creation");

    await page.goto("/playground/sessions/session_checkout_104", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Annotate" }).click();
    await expect(page.getByRole("status")).toContainText("Sandbox simulated");
    expect(writes).toEqual([]);
  });

  test("keeps Users search and environment state in the URL across reload", async ({ page }) => {
    await page.goto("/playground/users", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Search User ID").fill("usr_olivia");
    await expect(page).toHaveURL(/(?:\?|&)q=usr_olivia/);
    await page.getByRole("button", { name: /Env/ }).click();
    await expect(page).toHaveURL(/(?:\?|&)environment=default/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Search User ID")).toHaveValue("usr_olivia");
    await expect(page).toHaveURL(/(?:\?|&)q=usr_olivia(?:&|$)/);
    await expect(page).toHaveURL(/(?:\?|&)environment=default(?:&|$)/);
  });

  test("keeps Sessions search in the URL across reload", async ({ page }) => {
    await page.goto("/playground/sessions", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Search sessions").fill("session_checkout");
    await expect(page).toHaveURL(/(?:\?|&)q=session_checkout/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Search sessions")).toHaveValue("session_checkout");
    await expect(page).toHaveURL(/(?:\?|&)q=session_checkout/);
  });
});
