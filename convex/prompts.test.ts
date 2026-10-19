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

async function firstPrompt(owner: Awaited<ReturnType<typeof setup>>["owner"], projectId: Awaited<ReturnType<typeof setup>>["projectId"]) {
  const promptId = await owner.mutation(api.prompts.create, { projectId, name: "support", type: "text", content: "Hello {{name}}, about {{ topic }}" });
  return promptId;
}

async function versions(owner: Awaited<ReturnType<typeof setup>>["owner"], projectId: Awaited<ReturnType<typeof setup>>["projectId"]) {
  const [prompt] = await owner.query(api.prompts.list, { projectId });
  return prompt!.versions;
}

test("a new prompt is version 1, labelled latest, with its variables found", async () => {
  const { owner, projectId } = await setup();
  await firstPrompt(owner, projectId);
  const [v1] = await versions(owner, projectId);
  expect(v1).toMatchObject({ version: 1, labels: ["latest"], variables: ["name", "topic"] });
});

test("each new version moves 'latest' to itself and keeps the note", async () => {
  const { owner, projectId } = await setup();
  const promptId = await firstPrompt(owner, projectId);
  await owner.mutation(api.prompts.createVersion, { projectId, promptId, content: "Hi {{name}}", commitMessage: "  shorter greeting  " });
  await owner.mutation(api.prompts.createVersion, { projectId, promptId, content: "Hey {{name}}" });
  const list = await versions(owner, projectId);
  expect(list.map((v) => [v.version, v.labels])).toEqual([[3, ["latest"]], [2, []], [1, []]]);
  expect(list[1]!.commitMessage).toBe("shorter greeting");
});

test("a label points at one version: giving it to another version takes it away", async () => {
  const { owner, projectId } = await setup();
  const promptId = await firstPrompt(owner, projectId);
  await owner.mutation(api.prompts.createVersion, { projectId, promptId, content: "v2" });
  const [v2, v1] = await versions(owner, projectId);
  await owner.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: ["staging"] });
  await owner.mutation(api.prompts.updateLabels, { projectId, versionId: v2!._id, labels: ["staging", "latest"] });
  const after = await versions(owner, projectId);
  expect(after.map((v) => [v.version, [...v.labels].sort()])).toEqual([[2, ["latest", "staging"]], [1, []]]);
});

test("'latest' cannot be moved or removed by hand", async () => {
  const { owner, projectId } = await setup();
  const promptId = await firstPrompt(owner, projectId);
  await owner.mutation(api.prompts.createVersion, { projectId, promptId, content: "v2" });
  const [v2, v1] = await versions(owner, projectId);
  await owner.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: ["latest", "development"] });
  await owner.mutation(api.prompts.updateLabels, { projectId, versionId: v2!._id, labels: [] });
  const after = await versions(owner, projectId);
  expect(after.map((v) => [v.version, v.labels])).toEqual([[2, ["latest"]], [1, ["development"]]]);
});

test("production is refused and bad labels are explained", async () => {
  const { owner, projectId } = await setup();
  const promptId = await firstPrompt(owner, projectId);
  const [v1] = await versions(owner, projectId);
  await expect(owner.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: ["production"] })).rejects.toThrow("release gate");
  await expect(owner.mutation(api.prompts.createVersion, { projectId, promptId, content: "x", labels: ["production"] })).rejects.toThrow("release gate");
  await expect(owner.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: ["has space"] })).rejects.toThrow("not a valid label");
  await expect(owner.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: Array.from({ length: 11 }, (_, i) => `l${i}`) })).rejects.toThrow("at most 10");
});

test("names must be unique and blank content is refused", async () => {
  const { owner, projectId } = await setup();
  await firstPrompt(owner, projectId);
  await expect(owner.mutation(api.prompts.create, { projectId, name: " support ", type: "text", content: "x" })).rejects.toThrow("already exists");
  await expect(owner.mutation(api.prompts.create, { projectId, name: "other", type: "text", content: "   " })).rejects.toThrow("required");
});

test("a description can be changed, kept and cleared", async () => {
  const { owner, projectId } = await setup();
  const promptId = await firstPrompt(owner, projectId);
  await owner.mutation(api.prompts.update, { projectId, promptId, description: "  For the help desk " });
  expect((await owner.query(api.prompts.list, { projectId }))[0]!.description).toBe("For the help desk");
  await owner.mutation(api.prompts.update, { projectId, promptId, name: "support-v2" });
  expect((await owner.query(api.prompts.list, { projectId }))[0]).toMatchObject({ name: "support-v2", description: "For the help desk" });
  await owner.mutation(api.prompts.update, { projectId, promptId, description: "" });
  expect((await owner.query(api.prompts.list, { projectId }))[0]!.description).toBeUndefined();
});

test("the SDK gets the version carrying the label it asks for", async () => {
  const { t, owner, projectId } = await setup();
  const promptId = await firstPrompt(owner, projectId);
  await owner.mutation(api.prompts.createVersion, { projectId, promptId, content: "second" });
  const [, v1] = await versions(owner, projectId);
  await owner.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: ["staging"] });
  const staging = await t.query(api.prompts.resolveByApiKey, { apiKeyHash: "hash", name: "support", environment: "staging" });
  expect(staging?.version).toMatchObject({ version: 1 });
  const latest = await t.query(api.prompts.resolveByApiKey, { apiKeyHash: "hash", name: "support", environment: "latest" });
  expect(latest?.version).toMatchObject({ version: 2, content: "second" });
  expect(await t.query(api.prompts.resolveByApiKey, { apiKeyHash: "hash", name: "support", environment: "production" })).toBeNull();
});

test("usage counts linked traces per version", async () => {
  const { owner, projectId } = await setup();
  const promptId = await firstPrompt(owner, projectId);
  const [v1] = await versions(owner, projectId);
  await owner.mutation(api.prompts.linkTrace, { projectId, promptVersionId: v1!._id, traceId: "run_a" });
  await owner.mutation(api.prompts.linkTrace, { projectId, promptVersionId: v1!._id, traceId: "run_b" });
  await owner.mutation(api.prompts.linkTrace, { projectId, promptVersionId: v1!._id, traceId: "run_b" });
  const [usage] = await owner.query(api.prompts.versionUsage, { projectId, promptId });
  expect(usage).toMatchObject({ versionId: v1!._id, links: 2, more: false });
  expect(usage!.lastLinkedAt).toBeTypeOf("number");
});

test("people outside the project can neither read nor change prompts", async () => {
  const { t, owner, outsider, projectId } = await setup();
  const promptId = await firstPrompt(owner, projectId);
  const [v1] = await versions(owner, projectId);
  for (const user of [t, outsider]) {
    expect(await user.query(api.prompts.list, { projectId })).toEqual([]);
    expect(await user.query(api.prompts.versionUsage, { projectId, promptId })).toEqual([]);
    await expect(user.mutation(api.prompts.create, { projectId, name: "x", type: "text", content: "x" })).rejects.toThrow();
    await expect(user.mutation(api.prompts.createVersion, { projectId, promptId, content: "x" })).rejects.toThrow();
    await expect(user.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: ["staging"] })).rejects.toThrow();
  }
});

test("a version already in production keeps it while other labels change, and can give it up", async () => {
  const { t, owner, projectId } = await setup();
  await firstPrompt(owner, projectId);
  const [v1] = await versions(owner, projectId);
  await t.run((ctx) => ctx.db.patch(v1!._id, { labels: ["latest", "production"] }));
  await owner.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: ["production", "staging"] });
  expect((await versions(owner, projectId))[0]!.labels.sort()).toEqual(["latest", "production", "staging"]);
  await owner.mutation(api.prompts.updateLabels, { projectId, versionId: v1!._id, labels: ["staging"] });
  expect((await versions(owner, projectId))[0]!.labels.sort()).toEqual(["latest", "staging"]);
});

test("a new prompt can start with labels, but not production", async () => {
  const { owner, projectId } = await setup();
  await owner.mutation(api.prompts.create, { projectId, name: "a", type: "text", content: "x", labels: ["staging"] });
  expect((await versions(owner, projectId))[0]!.labels.sort()).toEqual(["latest", "staging"]);
  await expect(owner.mutation(api.prompts.create, { projectId, name: "b", type: "text", content: "x", labels: ["production"] })).rejects.toThrow("release gate");
});
