/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  const projectId = await t.run((ctx) => ctx.db.insert("projects", { name: "Test", clerkOrgId: "org", clerkUserId: "owner", apiKeyHash: "hash", apiKeyStatus: "active" }));
  return { projectId, owner: t.withIdentity({ subject: "owner", orgId: "org" }), outsider: t.withIdentity({ subject: "outsider", orgId: "other" }) };
}
const base = { name: "Page me", eventSource: "run.failed", actionType: "webhook", destination: "https://example.com/hook" };

test("create validates the destination for each action", async () => {
  const { owner, projectId } = await setup();
  await expect(owner.mutation(api.automations.create, { projectId, ...base, destination: "http://example.com" })).rejects.toThrow(/https/);
  await expect(owner.mutation(api.automations.create, { projectId, ...base, destination: "nope" })).rejects.toThrow(/web address/);
  await expect(owner.mutation(api.automations.create, { projectId, ...base, eventSource: "x" })).rejects.toThrow(/trigger/);
  await expect(owner.mutation(api.automations.create, { projectId, ...base, actionType: "github_dispatch", destination: "bad repo" })).rejects.toThrow(/owner\/repository/);
  await owner.mutation(api.automations.create, { projectId, ...base, actionType: "github_dispatch", destination: "acme/api" });
  await expect(owner.mutation(api.automations.create, { projectId, ...base, actionType: "github_dispatch", destination: "acme/api" })).rejects.toThrow(/already exists/);
});

test("update, pause and delete stay inside the project", async () => {
  const { owner, outsider, projectId } = await setup();
  const id = await owner.mutation(api.automations.create, { projectId, ...base });
  await owner.mutation(api.automations.setActive, { projectId, automationId: id, active: false });
  await owner.mutation(api.automations.update, { projectId, automationId: id, ...base, name: "Renamed", eventSource: "alert.created" });
  const [row] = await owner.query(api.automations.list, { projectId });
  expect(row).toMatchObject({ name: "Renamed", eventSource: "alert.created", active: false });
  await expect(outsider.mutation(api.automations.remove, { projectId, automationId: id })).rejects.toThrow();
  await owner.mutation(api.automations.remove, { projectId, automationId: id });
  expect(await owner.query(api.automations.list, { projectId })).toEqual([]);
});
