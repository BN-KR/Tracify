import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";
const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  const projectId = await t.run((ctx) => ctx.db.insert("projects", { name: "Test", clerkOrgId: "org", clerkUserId: "owner" }));
  return { t, projectId, owner: t.withIdentity({ subject: "owner", orgId: "org" }), outsider: t.withIdentity({ subject: "outsider", orgId: "other" }) };
}

async function addSpend(t: ReturnType<typeof convexTest>, projectId: never, usd: number) {
  await t.run((ctx) => ctx.db.insert("agentRuns", { runId: `r-${Math.random()}`, status: "completed", spanCount: 1, totalCostUsd: usd, startedAt: new Date(Date.now() - 60_000).toISOString(), projectId }));
}

const budget = { name: "Monthly spend", period: "month" as const, limitUsd: 100, warnAtPercent: 80, emailTo: ["me@example.com"] };

test("warns once, then once more when over, and not again in the same period", async () => {
  const { t, projectId, owner } = await setup();
  const id = await owner.mutation(api.budgets.create, { projectId, ...budget });
  await addSpend(t, projectId as never, 50);
  expect(await t.mutation(internal.budgets.evaluate, { budgetId: id })).toBeNull();
  await addSpend(t, projectId as never, 35);
  expect((await t.mutation(internal.budgets.evaluate, { budgetId: id }))?.level).toBe("warning");
  expect(await t.mutation(internal.budgets.evaluate, { budgetId: id })).toBeNull();
  await addSpend(t, projectId as never, 20);
  expect((await t.mutation(internal.budgets.evaluate, { budgetId: id }))?.level).toBe("over");
  expect(await t.mutation(internal.budgets.evaluate, { budgetId: id })).toBeNull();
  const alerts = await t.run((ctx) => ctx.db.query("alerts").collect());
  expect(alerts).toHaveLength(2);
});

test("budgets are private to the project and validated", async () => {
  const { projectId, owner, outsider } = await setup();
  await expect(outsider.mutation(api.budgets.create, { projectId, ...budget })).rejects.toThrow();
  await expect(owner.mutation(api.budgets.create, { projectId, ...budget, limitUsd: 0 })).rejects.toThrow("more than $0");
  await expect(owner.mutation(api.budgets.create, { projectId, ...budget, emailTo: [] })).rejects.toThrow("at least one");
  expect(await outsider.query(api.budgets.overview, { projectId })).toBeNull();
});

test("weekly summary: saves, sends a week only once", async () => {
  const { t, projectId, owner } = await setup();
  await expect(owner.mutation(api.weeklySummary.save, { projectId, enabled: true, emailTo: [] })).rejects.toThrow();
  await owner.mutation(api.weeklySummary.save, { projectId, enabled: true, emailTo: ["Me@Example.com"] });
  const [id] = await t.query(internal.weeklySummary.enabledIds, {});
  expect(await t.mutation(internal.weeklySummary.claimWeek, { summaryId: id, weekKey: "2026-10-19" })).toBe(true);
  expect(await t.mutation(internal.weeklySummary.claimWeek, { summaryId: id, weekKey: "2026-10-19" })).toBe(false);
  const view = await owner.query(api.weeklySummary.get, { projectId });
  expect(view?.emailTo).toEqual(["me@example.com"]);
});
