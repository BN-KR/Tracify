import { expect, test } from "@playwright/test";

if (process.env.TRACIFY_E2E_STORAGE_STATE) {
  test.use({ storageState: process.env.TRACIFY_E2E_STORAGE_STATE });
}

const workflows = [
  ["browser research", "TRACIFY_E2E_RUN_RESEARCH"],
  ["tool and API", "TRACIFY_E2E_RUN_TOOL"],
  ["failure recovery", "TRACIFY_E2E_RUN_FAILURE"],
] as const;

test.describe("browser-agent observability wedge", () => {
  test.skip(
    process.env.TRACIFY_E2E_WEDGE !== "1",
    "Set TRACIFY_E2E_WEDGE=1 with an authenticated storage state and three real run IDs.",
  );

  for (const [workflow, runVariable] of workflows) {
    test(`${workflow} run is inspectable end to end`, async ({ page }) => {
      const projectId = process.env.TRACIFY_E2E_PROJECT_ID;
      const runId = process.env[runVariable];
      test.skip(!projectId || !runId, `Set TRACIFY_E2E_PROJECT_ID and ${runVariable}.`);

      await page.goto(`/dashboard/${projectId}/journey/${runId}`);
      await expect(page.getByRole("heading", { name: "Agent Journey" })).toBeVisible();
      await expect(page.getByText(/Observed cost/)).toBeVisible();
      await expect(page.getByText(/LLM decision|Browser \/ network|Tool \/ API|Failure \/ assertion|Evaluation/).first()).toBeVisible();

      await page.getByRole("link", { name: "Full trace", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/dashboard/${projectId}/runs/${runId}$`));
      await expect(page.getByRole("link", { name: "Investigate", exact: true })).toBeVisible();

      await page.getByRole("link", { name: "Investigate", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/dashboard/${projectId}/investigate\\?run=${runId}$`));
      await expect(page.getByRole("heading", { name: "Investigation Mode" })).toBeVisible();
    });
  }
});
