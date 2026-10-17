import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  const projectId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("projects", { name: "Acme", clerkOrgId: "org", clerkUserId: "owner", apiKeyHash: "secret", slackWebhookUrl: "https://hooks.slack.com/services/x" });
    for (let i = 0; i < 3; i++) await ctx.db.insert("comments", { spanId: `s${i}`, projectId: id, runId: `r${i}`, userId: "owner", userName: "O", content: "hi", createdAt: i });
    return id;
  });
  return { t, projectId, owner: t.withIdentity({ subject: "owner", orgId: "org" }), outsider: t.withIdentity({ subject: "x", orgId: "other" }) };
}

test("export leaves secrets out and only admins can export", async () => {
  const { owner, outsider, projectId } = await setup();
  const project = await owner.query(api.projectData.exportProject, { projectId });
  expect(project.name).toBe("Acme");
  expect(project).not.toHaveProperty("apiKeyHash");
  expect(project).not.toHaveProperty("slackWebhookUrl");
  const page = await owner.query(api.projectData.exportPage, { projectId, table: "comments", cursor: null });
  expect(page.rows).toHaveLength(3);
  await expect(outsider.query(api.projectData.exportProject, { projectId })).rejects.toThrow();
  await expect(owner.query(api.projectData.exportPage, { projectId, table: "projects", cursor: null })).rejects.toThrow("Unknown table");
});

test("delete needs the exact name and word, then clears everything", async () => {
  const { t, owner, outsider, projectId } = await setup();
  await expect(owner.mutation(api.projects.deleteProject, { projectId, confirmationName: "acme", confirmationWord: "DELETE" })).rejects.toThrow();
  await expect(outsider.mutation(api.projects.deleteProject, { projectId, confirmationName: "Acme", confirmationWord: "DELETE" })).rejects.toThrow();
  expect(await t.run((ctx) => ctx.db.get(projectId))).not.toBeNull();
  await owner.mutation(api.projects.deleteProject, { projectId, confirmationName: "Acme", confirmationWord: "DELETE" });
  await t.finishAllScheduledFunctions(() => {});
  expect(await t.run((ctx) => ctx.db.get(projectId))).toBeNull();
  expect(await t.run((ctx) => ctx.db.query("comments").collect())).toHaveLength(0);
});
