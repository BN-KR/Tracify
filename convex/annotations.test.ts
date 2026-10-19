/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  const projectId = await t.run((ctx) => ctx.db.insert("projects", { name: "Test", clerkOrgId: "org", clerkUserId: "owner", apiKeyHash: "hash", apiKeyStatus: "active" }));
  return { t, projectId, owner: t.withIdentity({ subject: "owner", orgId: "org" }), other: t.withIdentity({ subject: "other", orgId: "org" }) };
}

test("a submitted review stores its label on the item so agreement can be computed", async () => {
  const { t, owner, projectId } = await setup();
  const a = await owner.mutation(api.annotations.create, { projectId, traceId: "t1" });
  const b = await owner.mutation(api.annotations.create, { projectId, traceId: "t1" });
  for (const id of [a, b]) {
    await owner.mutation(api.annotations.claim, { projectId, annotationId: id });
    await owner.mutation(api.annotations.submitReview, { projectId, annotationId: id, label: "good", score: 0.9, notes: " fine " });
  }
  const done = await t.run((ctx) => ctx.db.get(a));
  expect(done).toMatchObject({ status: "completed", label: "good", notes: "fine", confidence: 0.9 });
  expect((await owner.query(api.annotations.agreement, { projectId }))?.agreement).toBe(1);
});

test("releasing puts an item back in line and only its reviewer may do it", async () => {
  const { t, owner, other, projectId } = await setup();
  const id = await owner.mutation(api.annotations.create, { projectId, traceId: "t1" });
  await expect(owner.mutation(api.annotations.release, { projectId, annotationId: id })).rejects.toThrow("in review");
  await owner.mutation(api.annotations.claim, { projectId, annotationId: id });
  await expect(other.mutation(api.annotations.release, { projectId, annotationId: id })).rejects.toThrow("someone else");
  await owner.mutation(api.annotations.release, { projectId, annotationId: id });
  const doc = await t.run((ctx) => ctx.db.get(id));
  expect(doc?.status).toBe("queued");
  expect(doc?.assignee).toBeUndefined();
});
