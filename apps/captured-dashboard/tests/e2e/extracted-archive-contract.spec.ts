import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const projectId = "clkpwwm0m000gmm094odg11gi";
function archivedPages() {
  const html = fs.readFileSync(path.join(process.cwd(), "public/output/langfuse-capture/index.html"), "utf8");
  return [...new Set([...html.matchAll(/<a href="(pages\/[^"#]+\.html)"/g)].map((match) => `/output/langfuse-capture/${match[1]}`))];
}
test("root opens the interactive workspace and preserves the reference archive", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/playground$/);
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  const archive = await page.goto("/output/langfuse-capture/pages/023.html", { waitUntil: "domcontentloaded" });
  expect(archive?.status()).toBe(200);
  await expect(page).toHaveTitle("Home | Langfuse");
});
for (const [route, surface] of [
  ["traces", "tracing"], ["sessions", "sessions"], ["settings", "settings"],
  ["sessions/chat_e3649383-4371-439f-9b79-1b8da230fb3f", "sessions/chat_e3649383-4371-439f-9b79-1b8da230fb3f"],
  ["users/u-hqLy_X6u77lTTd8j8XzlK", "users/u-hqLy_X6u77lTTd8j8XzlK"], ["settings/api-keys", "settings"],
] as const) {
  test(`${route} opens the interactive ${surface} surface`, async ({ page }) => {
    const response = await page.goto(`/project/${projectId}/${route}`, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(`/playground/${surface}`);
    await expect(page.locator(".captured-workspace")).toBeVisible();
  });
}
test("every indexed reference archive page remains accessible directly", async ({ request }) => {
  const pages = archivedPages();
  expect(pages.length).toBeGreaterThan(100);
  for (const url of pages) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    expect(await response.text(), url).toContain("<html");
  }
});
