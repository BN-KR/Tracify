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

test("overview counts rows and hides restricted datasets from others", async () => {
  const { t, owner, projectId } = await setup();
  const open = await owner.mutation(api.evaluation.createDataset, { projectId, name: "open" });
  await owner.mutation(api.evaluation.createDataset, { projectId, name: "secret", access: "restricted" });
  await owner.mutation(api.evaluation.addDatasetItem, { projectId, datasetId: open, input: "a", expectedOutput: "b" });
  await owner.mutation(api.evaluation.addDatasetItem, { projectId, datasetId: open, input: "c" });
  const member = t.withIdentity({ subject: "member", orgId: "org" });
  const seen = await member.query(api.datasets.overview, { projectId });
  expect(seen.map((row) => row.dataset.name)).toEqual(["open"]);
  expect(seen[0]).toMatchObject({ itemCount: 2, withExpected: 1, fromTraces: 0, experimentCount: 0 });
  expect((await owner.query(api.datasets.overview, { projectId })).map((row) => row.dataset.name).sort()).toEqual(["open", "secret"]);
});

test("items are oldest first and other projects see nothing", async () => {
  const { owner, outsider, projectId } = await setup();
  const id = await owner.mutation(api.evaluation.createDataset, { projectId, name: "d" });
  for (const input of ["one", "two", "three"]) await owner.mutation(api.evaluation.addDatasetItem, { projectId, datasetId: id, input });
  expect((await owner.query(api.datasets.items, { projectId, datasetId: id }))?.rows.map((row) => row.input)).toEqual(["one", "two", "three"]);
  expect(await outsider.query(api.datasets.items, { projectId, datasetId: id })).toBeNull();
});

test("editing and deleting a row bumps the dataset version and validates", async () => {
  const { t, owner, outsider, projectId } = await setup();
  const id = await owner.mutation(api.evaluation.createDataset, { projectId, name: "d" });
  const itemId = await owner.mutation(api.evaluation.addDatasetItem, { projectId, datasetId: id, input: "old" });
  const before = (await t.run((ctx) => ctx.db.get(id)))!.version!;
  await owner.mutation(api.datasets.updateItem, { projectId, itemId, input: " new ", expectedOutput: "  " });
  const edited = await t.run((ctx) => ctx.db.get(itemId));
  expect(edited?.input).toBe("new");
  expect(edited?.expectedOutput).toBeUndefined();
  expect((await t.run((ctx) => ctx.db.get(id)))!.version).toBe(before + 1);
  await owner.mutation(api.datasets.updateItem, { projectId, itemId, input: "new" });
  expect((await t.run((ctx) => ctx.db.get(id)))!.version).toBe(before + 1);
  await expect(owner.mutation(api.datasets.updateItem, { projectId, itemId, input: "  " })).rejects.toThrow("needs an input");
  await expect(outsider.mutation(api.datasets.updateItem, { projectId, itemId, input: "x" })).rejects.toThrow();
  await owner.mutation(api.datasets.deleteItem, { projectId, itemId });
  expect(await t.run((ctx) => ctx.db.get(itemId))).toBeNull();
  expect((await t.run((ctx) => ctx.db.get(id)))!.version).toBe(before + 2);
});
