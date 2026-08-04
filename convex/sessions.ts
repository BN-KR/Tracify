import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const sessionStatus = v.union(
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

function canAccessProject(
  project: { clerkOrgId?: string; clerkUserId?: string },
  identity: { subject: string; tokenIdentifier: string },
) {
  const orgId = (identity as { orgId?: unknown; org_id?: unknown }).orgId ??
    (identity as { org_id?: unknown }).org_id;
  return (typeof orgId === "string" && project.clerkOrgId === orgId) ||
    project.clerkUserId === identity.subject;
}

export const upsertFromSpan = mutation({
  args: {
    projectId: v.id("projects"),
    sessionId: v.string(),
    endUserId: v.optional(v.string()),
    environment: v.optional(v.string()),
    release: v.optional(v.string()),
    traceName: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.string(),
    costUsd: v.number(),
    status: sessionStatus,
    isNewTrace: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_projectId_and_sessionId", (q) =>
        q.eq("projectId", args.projectId).eq("sessionId", args.sessionId),
      )
      .unique();

    if (!existing) {
      return await ctx.db.insert("sessions", {
        projectId: args.projectId,
        sessionId: args.sessionId,
        endUserId: args.endUserId,
        environment: args.environment,
        release: args.release,
        traceName: args.traceName,
        tags: [...new Set(args.tags)].slice(0, 50),
        firstSeenAt: args.createdAt,
        lastSeenAt: args.createdAt,
        traceCount: args.isNewTrace ? 1 : 0,
        spanCount: 1,
        totalCostUsd: args.costUsd,
        latestStatus: args.status,
      });
    }

    const terminal = ["completed", "failed", "cancelled"] as const;
    const nextStatus = terminal.includes(existing.latestStatus as typeof terminal[number])
      ? existing.latestStatus
      : args.status;
    await ctx.db.patch(existing._id, {
      endUserId: existing.endUserId ?? args.endUserId,
      environment: existing.environment ?? args.environment,
      release: existing.release ?? args.release,
      traceName: existing.traceName ?? args.traceName,
      tags: [...new Set([...existing.tags, ...args.tags])].slice(0, 50),
      lastSeenAt: args.createdAt,
      traceCount: existing.traceCount + (args.isNewTrace ? 1 : 0),
      spanCount: existing.spanCount + 1,
      totalCostUsd: existing.totalCostUsd + args.costUsd,
      latestStatus: nextStatus,
    });
    return existing._id;
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return [];
    return await ctx.db
      .query("sessions")
      .withIndex("by_projectId_and_lastSeenAt", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(Math.min(Math.max(args.limit ?? 50, 1), 100));
  },
});

export const getBySessionId = query({
  args: { projectId: v.id("projects"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return null;
    return await ctx.db
      .query("sessions")
      .withIndex("by_projectId_and_sessionId", (q) =>
        q.eq("projectId", args.projectId).eq("sessionId", args.sessionId),
      )
      .unique();
  },
});

export const getRecentRuns = query({
  args: { projectId: v.id("projects"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return [];
    return await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_and_sessionId", (q) =>
        q.eq("projectId", args.projectId).eq("sessionId", args.sessionId),
      )
      .order("desc")
      .take(50);
  },
});
