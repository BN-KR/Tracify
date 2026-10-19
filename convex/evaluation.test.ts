/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  const projectId = await t.run((ctx) => ctx.db.insert("projects", { name: "Test", clerkOrgId: "org", clerkUserId: "owner", apiKeyHash: "hash", apiKeyStatus: "active" }));
  return { t, projectId, owner: t.withIdentity({ subject: "owner", orgId: "org" }), outsider: t.withIdentity({ subject: "outsider", orgId: "other" }) };
}

test("scores must match their type and name a trace or span", async () => {
  const { owner, projectId } = await setup();
  const base = { projectId, traceId: "t1", name: "helpfulness", source: "user" as const };
  await owner.mutation(api.evaluation.createScore, { ...base, value: 0.8, dataType: "numeric" });
  await owner.mutation(api.evaluation.createScore, { ...base, name: "ok", value: true, dataType: "boolean" });
  await owner.mutation(api.evaluation.createScore, { ...base, name: "tone", value: "friendly", dataType: "categorical" });
  await expect(owner.mutation(api.evaluation.createScore, { ...base, value: "high", dataType: "numeric" })).rejects.toThrow("needs a number");
  await expect(owner.mutation(api.evaluation.createScore, { ...base, value: 1, dataType: "boolean" })).rejects.toThrow("true or false");
  await expect(owner.mutation(api.evaluation.createScore, { ...base, value: " ", dataType: "categorical" })).rejects.toThrow("value of up to");
  await expect(owner.mutation(api.evaluation.createScore, { ...base, traceId: " ", value: 1, dataType: "numeric" })).rejects.toThrow("trace or span");
  await expect(owner.mutation(api.evaluation.createScore, { ...base, name: "x".repeat(101), value: 1, dataType: "numeric" })).rejects.toThrow("100 characters");
});

test("listScores honours the limit, newest first, and hides other projects", async () => {
  const { owner, outsider, projectId } = await setup();
  for (let i = 0; i < 5; i++) await owner.mutation(api.evaluation.createScore, { projectId, traceId: `t${i}`, name: "n", value: i, dataType: "numeric", source: "user" });
  const two = await owner.query(api.evaluation.listScores, { projectId, limit: 2 });
  expect(two.map((score) => score.value)).toEqual([4, 3]);
  expect(await owner.query(api.evaluation.listScores, { projectId })).toHaveLength(5);
  expect(await outsider.query(api.evaluation.listScores, { projectId })).toEqual([]);
});

test("evaluator overview reports config and recent results", async () => {
  const { t, owner, outsider, projectId } = await setup();
  const evaluatorId = await owner.mutation(api.evaluationEngine.createEvaluator, { projectId, name: "has-id", type: "code", criteria: "contains:id", target: "trace", scoreType: "boolean", rule: "contains:id", sampleRate: 1, enabledOnline: true });
  const jobId = await t.run((ctx) => ctx.db.insert("evaluationJobs", { projectId, mode: "online", status: "completed", itemCount: 2, completedCount: 2, failedCount: 1, createdBy: "system", createdAt: Date.now() }));
  for (const [i, status] of (["passed", "failed"] as const).entries()) {
    await t.run((ctx) => ctx.db.insert("evaluationResults", { projectId, jobId, evaluatorId, evaluatorVersion: 1, traceId: `t${i}`, value: status === "passed" ? 1 : 0, dataType: "numeric", status, createdAt: Date.now() + i }));
  }
  const [row] = await owner.query(api.evaluators.overview, { projectId });
  expect(row!.config).toMatchObject({ version: 1, scoreType: "boolean", sampleRate: 1, enabledOnline: true });
  expect(row!.stats).toMatchObject({ runs: 2, passed: 1, failed: 1, errored: 0, passRate: 0.5, average: 0.5 });
  expect((await owner.query(api.evaluators.recentResults, { projectId, evaluatorId })).map((result) => result.status)).toEqual(["failed", "passed"]);
  expect(await outsider.query(api.evaluators.overview, { projectId })).toEqual([]);
  expect(await outsider.query(api.evaluators.recentResults, { projectId, evaluatorId })).toEqual([]);
});

test("editing an evaluator writes a new version and keeps its kind", async () => {
  const { owner, outsider, projectId } = await setup();
  const evaluatorId = await owner.mutation(api.evaluationEngine.createEvaluator, { projectId, name: "one", type: "code", criteria: "not_empty", target: "trace", scoreType: "boolean", rule: "not_empty", sampleRate: 0, enabledOnline: false });
  await owner.mutation(api.evaluationEngine.createEvaluator, { projectId, name: "two", type: "code", criteria: "json_valid", target: "trace", scoreType: "boolean", rule: "json_valid", sampleRate: 0, enabledOnline: false });
  const base = { projectId, evaluatorId, name: "one-renamed", criteria: "contains:ok", scoreType: "numeric" as const, sampleRate: 0.5, enabledOnline: true };
  expect(await owner.mutation(api.evaluators.update, base)).toBe(2);
  const [first] = (await owner.query(api.evaluators.overview, { projectId })).filter((row) => row.evaluator._id === evaluatorId);
  expect(first!.evaluator).toMatchObject({ name: "one-renamed", criteria: "contains:ok", type: "code" });
  expect(first!.config).toMatchObject({ version: 2, scoreType: "boolean", rule: "contains:ok", sampleRate: 0.5, enabledOnline: true });
  await expect(owner.mutation(api.evaluators.update, { ...base, name: "two" })).rejects.toThrow("already exists");
  await expect(owner.mutation(api.evaluators.update, { ...base, sampleRate: 2 })).rejects.toThrow("between 0 and 1");
  await expect(owner.mutation(api.evaluators.update, { ...base, criteria: " " })).rejects.toThrow("required");
  await expect(outsider.mutation(api.evaluators.update, base)).rejects.toThrow("access denied");
});
