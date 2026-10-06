import { expect, test } from "@playwright/test";

test("homepage leads with an inspectable trace and working discovery paths", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("AI Agent Tracing and Observability");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.tracify.tech");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /AI Agent Tracing and Observability/);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /Follow the model, tool, and retrieval decisions/);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", /AI Agent Tracing and Observability/);
  await expect(page.getByRole("heading", { level: 1, name: "Find the turn." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore a trace" })).toHaveAttribute("href", "/demo");
  await expect(page.getByRole("link", { name: "Start tracing" })).toHaveAttribute("href", "/cloud");

  const consentDialog = page.getByRole("dialog", { name: "Privacy preferences" });
  if (await consentDialog.isVisible().catch(() => false)) {
    await consentDialog.getByRole("button", { name: "Reject optional" }).click();
  }

  await page.getByRole("button", { name: "TOOL: orders.lookup" }).click();
  await expect(page.getByRole("heading", { name: "State not confirmed" })).toBeVisible();
  await expect(page.locator(".landing-atlas-stage[data-active-event]")).toHaveAttribute("data-active-event", "tool");

  const openGraphImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
  expect(openGraphImage).toContain("opengraph-image");
  expect(twitterImage).toContain("twitter-image");
  expect((await page.request.get(openGraphImage!)).ok()).toBeTruthy();
  expect((await page.request.get(twitterImage!)).ok()).toBeTruthy();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("main#main-content")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("trace sample is keyboard-accessible and honors reduced motion", async ({ page }) => {
  await page.goto("/");

  const modelEvent = page.getByRole("button", { name: "MODEL: support-agent · gpt-4.1" });
  await modelEvent.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Response drafted" })).toBeVisible();
  await expect(page.locator(".landing-atlas-stage[data-active-event]")).toHaveAttribute("data-active-event", "model");

  await page.getByRole("button", { name: /04 \/ groundedness/ }).click();
  await expect(page.getByRole("heading", { name: "0.42 · review" })).toBeVisible();

  const reducedMotionPage = await page.context().newPage();
  await reducedMotionPage.emulateMedia({ reducedMotion: "reduce" });
  await reducedMotionPage.goto("/");
  await expect(reducedMotionPage.locator(".landing-atlas-stage[data-trace-reduced-motion='true']")).toBeVisible();
  await expect(reducedMotionPage.locator(".landing-atlas-image").first()).toHaveCSS("animation-name", "none");
});
