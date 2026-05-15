import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const runStatusValidator = v.union(
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
);

function canAccessProject(
  project: { clerkOrgId?: string; clerkUserId?: string },
  identity: { subject: string; tokenIdentifier: string },
) {
  const orgId = (identity as { orgId?: unknown }).orgId;
  if (typeof orgId === "string" && project.clerkOrgId === orgId) return true;
  return typeof project.clerkUserId === "string" && project.clerkUserId === identity.subject;
}

async function upsertRunSummary(
  ctx: MutationCtx,
  args: {
    runId: string;
    projectId: Id<"projects">;
    costUsd: number;
    spanType: string;
    createdAt: string;
    modelId?: string;
  },
) {
  const isFailed = args.spanType === "error";
  const isCompleted = args.spanType === "run_end";
  const status = isFailed ? "failed" : isCompleted ? "completed" : "running";
  const finishedAt = isFailed || isCompleted ? args.createdAt : undefined;

  const existing = await ctx.db
    .query("agentRuns")
    .withIndex("by_projectId_and_runId", (q) =>
      q.eq("projectId", args.projectId).eq("runId", args.runId),
    )
    .unique();

  if (!existing) {
    return await ctx.db.insert("agentRuns", {
      runId: args.runId,
      projectId: args.projectId,
      status,
      spanCount: 1,
      totalCostUsd: args.costUsd,
      startedAt: args.createdAt,
      finishedAt,
      lastSpanAt: args.createdAt,
      primaryModel: args.modelId || undefined,
      createdAt: args.createdAt,
      updatedAt: args.createdAt,
    });
  }

  const nextStatus =
    existing.status === "failed" || existing.status === "completed"
      ? existing.status
      : status;

  await ctx.db.patch(existing._id, {
    status: nextStatus,
    spanCount: existing.spanCount + 1,
    totalCostUsd: existing.totalCostUsd + args.costUsd,
    lastSpanAt: args.createdAt,
    finishedAt: finishedAt ?? existing.finishedAt,
    primaryModel: existing.primaryModel ?? args.modelId ?? undefined,
    updatedAt: args.createdAt,
  });

  return existing._id;
}

export const upsertRunFromSpan = mutation({
  args: {
    runId: v.string(),
    projectId: v.id("projects"),
    costUsd: v.number(),
    spanType: v.string(),
    createdAt: v.string(),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertRunSummary(ctx, args);
  },
});

export const upsertRun = mutation({
  args: {
    runId: v.string(),
    projectId: v.id("projects"),
    costUsd: v.number(),
    startedAt: v.string(),
    lastSpanAt: v.string(),
    status: runStatusValidator,
    finishedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertRunSummary(ctx, {
      runId: args.runId,
      projectId: args.projectId,
      costUsd: args.costUsd,
      spanType:
        args.status === "failed"
          ? "error"
          : args.status === "completed"
            ? "run_end"
            : "custom",
      createdAt: args.lastSpanAt,
    });
  },
});

export const upsert = mutation({
  args: {
    runId: v.string(),
    projectId: v.id("projects"),
    costUsd: v.number(),
    startedAt: v.string(),
    lastSpanAt: v.optional(v.string()),
    status: v.optional(v.string()),
    finishedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertRunSummary(ctx, {
      runId: args.runId,
      projectId: args.projectId,
      costUsd: args.costUsd,
      spanType:
        args.status === "failed"
          ? "error"
          : args.status === "completed"
            ? "run_end"
            : "custom",
      createdAt: args.lastSpanAt ?? args.startedAt,
    });
  },
});

export const getFirstRunForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return null;

    return await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", projectId))
      .order("asc")
      .first();
  },
});

export const getRecentRunsByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return [];

    return await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", projectId))
      .order("desc")
      .take(25);
  },
});

export const getProjectOnboardingState = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return null;

    const firstRun = await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", projectId))
      .order("asc")
      .first();

    return {
      projectId: project._id,
      projectName: project.name,
      apiKeyPrefix: project.apiKeyPrefix,
      apiKeyLast4: project.apiKeyLast4,
      hasReceivedFirstSpan: firstRun !== null,
      firstRunId: firstRun?.runId ?? null,
      firstSpanAt: firstRun?.createdAt ?? firstRun?.startedAt ?? null,
    };
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", projectId))
      .order("desc")
      .take(50);
  },
});

export const getByRunId = query({
  args: { runId: v.string(), projectId: v.id("projects") },
  handler: async (ctx, { runId, projectId }) => {
    return await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_and_runId", (q) =>
        q.eq("projectId", projectId).eq("runId", runId),
      )
      .unique();
  },
});
