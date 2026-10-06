import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const projectId = "clkpwwm0m000gmm094odg11gi";

function capturedRoutes() {
  const index = fs.readFileSync(
    path.join(process.cwd(), "public/output/langfuse-capture/index.html"),
    "utf8",
  );
  const routes = new Set<string>();
  const links = /<a href="([^"]+)">([\s\S]*?)<\/a>/g;

  for (const match of index.matchAll(links)) {
    const file = match[1];
    const label = match[2].replace(/<[^>]+>/g, "");
    const route = label.match(/—\s(\/[^\s<]*)/u)?.[1];
    if (route && route !== "/" && file.startsWith("pages/")) {
      routes.add(route.split("?")[0]);
    }
  }

  return [...routes];
}

test.describe("extracted reference archive contract", () => {
  test("root enters the extracted Home snapshot", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("Home | Langfuse");
    expect(page.url()).toContain("/output/langfuse-capture/pages/023.html");
  });

  for (const [route, title, pageNumber] of [
    ["traces", "Tracing | Langfuse", "025"],
    ["sessions", "Sessions | Langfuse", "026"],
    ["settings", "Settings | Langfuse", "036"],
    ["sessions/chat_e3649383-4371-439f-9b79-1b8da230fb3f", "Sessions | Langfuse", "065"],
    ["users/u-hqLy_X6u77lTTd8j8XzlK", "Users | Langfuse", "066"],
    ["settings/api-keys", "Settings | Langfuse", "044"],
  ] as const) {
    test(`${route} resolves to extracted snapshot ${pageNumber}`, async ({ page }) => {
      const response = await page.goto(`/project/${projectId}/${route}`, {
        waitUntil: "domcontentloaded",
      });

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      expect(page.url()).toContain(`/output/langfuse-capture/pages/${pageNumber}.html`);
      expect(await page.locator('link[href^="../assets/"], script[src^="../assets/"]').count()).toBeGreaterThan(0);
    });
  }

  test("every route listed by the extracted index resolves", async ({ page }) => {
    test.setTimeout(120_000);
    const routes = capturedRoutes();
    expect(routes.length).toBeGreaterThan(100);

    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBe(200);
      expect(page.url(), route).toContain("/output/langfuse-capture/pages/");
    }
  });
});
