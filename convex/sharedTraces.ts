import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

function orgField(identity: unknown, camel: "orgId" | "orgRole", snake: "org_id" | "org_role") {
  const value = (identity as Record<string, unknown>)[camel] ?? (identity as Record<string, unknown>)[snake];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function canAccessProject(project: Doc<"projects">, identity: { subject: string }) {
  const orgId = orgField(identity, "orgId", "org_id");
  if (orgId && project.clerkOrgId === orgId) return true;
  return project.clerkUserId === identity.subject;
}

// Viewers can read traces but must not publish them outside the team.
function canShare(project: Doc<"projects">, identity: { subject: string }) {
  if (project.clerkUserId === identity.subject) return true;
  const role = orgField(identity, "orgRole", "org_role");
  return role !== "viewer" && role !== "org:viewer";
}

function newToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 40);
}

export const getForRun = query({
  args: { projectId: v.id("projects"), runId: v.string() },
  handler: async (ctx, { projectId, runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return null;
    const links = await ctx.db
      .query("sharedTraces")
      .withIndex("by_projectId_and_runId", (q) => q.eq("projectId", projectId).eq("runId", runId))
      .order("desc")
      .take(20);
    const active = links.find((link) => link.revokedAt === undefined);
    return active ? { token: active.token, createdAt: active.createdAt } : null;
  },
});

export const create = mutation({
  args: { projectId: v.id("projects"), runId: v.string() },
  handler: async (ctx, { projectId, runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) throw new Error("Project not found or access denied");
    if (!canShare(project, identity)) throw new Error("Developer access required");
    const run = await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_and_runId", (q) => q.eq("projectId", projectId).eq("runId", runId))
      .unique();
    if (!run) throw new Error("Run not found");

    const existing = await ctx.db
      .query("sharedTraces")
      .withIndex("by_projectId_and_runId", (q) => q.eq("projectId", projectId).eq("runId", runId))
      .order("desc")
      .take(20);
    const active = existing.find((link) => link.revokedAt === undefined);
    if (active) return { token: active.token };

    const token = newToken();
    await ctx.db.insert("sharedTraces", { projectId, runId, token, createdBy: identity.subject, createdAt: Date.now() });
    await ctx.db.insert("auditLogs", {
      projectId,
      actorId: identity.subject,
      actorEmail: identity.email,
      action: "created",
      resource: "shared_trace",
      summary: `Created a public share link for run ${runId}`,
      createdAt: Date.now(),
    });
    return { token };
  },
});

export const revoke = mutation({
  args: { projectId: v.id("projects"), runId: v.string() },
  handler: async (ctx, { projectId, runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) throw new Error("Project not found or access denied");
    if (!canShare(project, identity)) throw new Error("Developer access required");
    const links = await ctx.db
      .query("sharedTraces")
      .withIndex("by_projectId_and_runId", (q) => q.eq("projectId", projectId).eq("runId", runId))
      .take(50);
    const now = Date.now();
    for (const link of links) if (link.revokedAt === undefined) await ctx.db.patch(link._id, { revokedAt: now });
    return null;
  },
});

// Public: no sign-in. Knowing the token is the permission, and revoking it ends access immediately.
export const resolve = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (token.length < 20 || token.length > 80) return null;
    const link = await ctx.db.query("sharedTraces").withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (!link || link.revokedAt !== undefined) return null;
    const run = await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_and_runId", (q) => q.eq("projectId", link.projectId).eq("runId", link.runId))
      .unique();
    if (!run) return null;
    return {
      projectId: link.projectId,
      runId: run.runId,
      status: run.status,
      spanCount: run.spanCount,
      totalCostUsd: run.totalCostUsd,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      primaryModel: run.primaryModel,
      sharedAt: link.createdAt,
    };
  },
});
