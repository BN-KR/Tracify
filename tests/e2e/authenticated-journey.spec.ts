import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("authenticated onboarding to investigation journey", async ({ page }) => {
  test.setTimeout(120_000);

  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  const identity = `playwright-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `${identity}@example.test`;
  const credential = process.env.TRACIFY_E2E_PASSWORD ?? randomUUID();
  let projectId = "";
  let runId = "";

  await test.step("create an isolated account through the existing auth flow", async () => {
    await page.goto("/sign-up");
    await page.getByLabel("Full name").fill("Playwright QA");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(credential);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/onboarding(?:\/project)?(?:\?|$)/);
  });

  await test.step("create a project and use its real onboarding key", async () => {
    await page.goto("/onboarding/project");
    await expect(page.getByRole("heading", { name: "Create your first project." })).toBeVisible();
    await page.getByLabel("Project name").fill(`Playwright QA ${identity}`);
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/onboarding\/api-key$/);
    await expect(page.getByText(/^tracify_sk_live_/)).toBeVisible();
    await page.getByRole("button", { name: "Copy key" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/onboarding\/install$/);
    await page.getByRole("button", { name: "I'm ready" }).click();
    await expect(page).toHaveURL(/\/onboarding\/waiting$/);
  });

  await test.step("ingest the first trace through the existing onboarding probe", async () => {
    await expect(page.getByRole("button", { name: "Send test span" })).toBeVisible();
    await page.getByRole("button", { name: "Send test span" }).click();
    await expect(page.getByText("Test span accepted")).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/onboarding\/success\?projectId=[^&]+&runId=.+/, { timeout: 90_000 });
    const url = new URL(page.url());
    projectId = url.searchParams.get("projectId") ?? "";
    runId = url.searchParams.get("runId") ?? "";
    expect(projectId).not.toBe("");
    expect(runId).not.toBe("");
  });

  await test.step("open the authenticated dashboard and confirm the run is listed", async () => {
    await page.goto(`/dashboard/${projectId}`);
    await expect(page.getByRole("heading", { name: /Overview/i })).toBeVisible();
    await page.goto(`/dashboard/${projectId}/runs`);
    await expect(page.getByRole("heading", { name: "Agent Runs" })).toBeVisible();
    await expect(page.getByRole("link", { name: runId, exact: true })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("link", { name: runId, exact: true }).click();
  });

  await test.step("open Trace Viewer and Investigation Mode for the selected run", async () => {
    await expect(page).toHaveURL(new RegExp(`/dashboard/${projectId}/runs/${runId}$`));
    await expect(page.getByText("Run control")).toBeVisible();
    await expect(page.getByRole("link", { name: "Investigate", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Investigate", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/dashboard/${projectId}/investigate\\?run=${runId}$`));
    await expect(page.getByRole("heading", { name: "Investigation Mode" })).toBeVisible();
    await expect(page.getByLabel("Trace to investigate")).toHaveValue(runId);
  });

  expect(pageErrors, "the authenticated journey should not produce page errors").toEqual([]);
});
