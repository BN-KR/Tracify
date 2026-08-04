import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const runStatusValidator = v.union(
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);
const MAX_COUNTABLE_RUNS = 1000;

function canAccessProject(
  project: { clerkOrgId?: string; clerkUserId?: string },
  identity: { subject: string; tokenIdentifier: string },
) {
  const orgId = (identity as { orgId?: unknown; org_id?: unknown }).orgId ??
    (identity as { org_id?: unknown }).org_id;
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
    sessionId?: string;
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
    const id = await ctx.db.insert("agentRuns", {
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
      sessionId: args.sessionId,
    });
    return { id, created: true };
  }

  const nextStatus =
    existing.status === "failed" ||
    existing.status === "completed" ||
    existing.status === "cancelled"
      ? existing.status
      : status;

  await ctx.db.patch(existing._id, {
    status: nextStatus,
    spanCount: existing.spanCount + 1,
    totalCostUsd: existing.totalCostUsd + args.costUsd,
    lastSpanAt: args.createdAt,
    finishedAt: finishedAt ?? existing.finishedAt,
    primaryModel: existing.primaryModel ?? args.modelId ?? undefined,
    sessionId: existing.sessionId ?? args.sessionId,
    updatedAt: args.createdAt,
  });

  return { id: existing._id, created: false };
}

export const upsertRunFromSpan = mutation({
  args: {
    runId: v.string(),
    projectId: v.id("projects"),
    costUsd: v.number(),
    spanType: v.string(),
    createdAt: v.string(),
    modelId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
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

export const getRunsPageByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("all"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { projectId, status, paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    if (status !== "all") {
      return await ctx.db
        .query("agentRuns")
        .withIndex("by_projectId_status", (q) =>
          q.eq("projectId", projectId).eq("status", status),
        )
        .order("desc")
        .paginate(paginationOpts);
    }

    return await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", projectId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const getRunCountsByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) {
      return null;
    }

    const [all, running, completed, failed, cancelled] = await Promise.all([
      ctx.db
        .query("agentRuns")
        .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", projectId))
        .take(MAX_COUNTABLE_RUNS + 1),
      ctx.db
        .query("agentRuns")
        .withIndex("by_projectId_status", (q) =>
          q.eq("projectId", projectId).eq("status", "running"),
        )
        .take(MAX_COUNTABLE_RUNS + 1),
      ctx.db
        .query("agentRuns")
        .withIndex("by_projectId_status", (q) =>
          q.eq("projectId", projectId).eq("status", "completed"),
        )
        .take(MAX_COUNTABLE_RUNS + 1),
      ctx.db
        .query("agentRuns")
        .withIndex("by_projectId_status", (q) =>
          q.eq("projectId", projectId).eq("status", "failed"),
        )
        .take(MAX_COUNTABLE_RUNS + 1),
      ctx.db
        .query("agentRuns")
        .withIndex("by_projectId_status", (q) =>
          q.eq("projectId", projectId).eq("status", "cancelled"),
        )
        .take(MAX_COUNTABLE_RUNS + 1),
    ]);

    return {
      all: Math.min(all.length, MAX_COUNTABLE_RUNS),
      running: Math.min(running.length, MAX_COUNTABLE_RUNS),
      completed: Math.min(completed.length, MAX_COUNTABLE_RUNS),
      failed: Math.min(failed.length, MAX_COUNTABLE_RUNS),
      cancelled: Math.min(cancelled.length, MAX_COUNTABLE_RUNS),
      capped:
        all.length > MAX_COUNTABLE_RUNS ||
        running.length > MAX_COUNTABLE_RUNS ||
        completed.length > MAX_COUNTABLE_RUNS ||
        failed.length > MAX_COUNTABLE_RUNS ||
        cancelled.length > MAX_COUNTABLE_RUNS,
    };
  },
});

export const cancelRun = mutation({
  args: {
    projectId: v.id("projects"),
    runId: v.string(),
  },
  handler: async (ctx, { projectId, runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) {
      throw new Error("Project not found or access denied");
    }

    const run = await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_and_runId", (q) =>
        q.eq("projectId", projectId).eq("runId", runId),
      )
      .unique();

    if (!run) {
      throw new Error("Run not found");
    }

    if (run.status !== "running") {
      return {
        status: run.status,
        changed: false,
      };
    }

    const now = new Date().toISOString();
    await ctx.db.patch(run._id, {
      status: "cancelled",
      finishedAt: now,
      lastSpanAt: run.lastSpanAt ?? now,
      updatedAt: now,
    });

    return {
      status: "cancelled" as const,
      changed: true,
    };
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return [];

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

export const getByRunIdForViewer = query({
  args: { runId: v.string(), projectId: v.id("projects") },
  handler: async (ctx, { runId, projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return null;

    return await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_and_runId", (q) =>
        q.eq("projectId", projectId).eq("runId", runId),
      )
      .unique();
  },
});
