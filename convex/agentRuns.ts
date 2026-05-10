import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Upsert an AgentRun summary.
 * Called by the Inngest job after each span is written to Tinybird.
 * Creates the run on first span; updates cost + spanCount on subsequent spans.
 */
export const upsert = mutation({
  args: {
    runId: v.string(),
    projectId: v.id("projects"),
    costUsd: v.number(),
    startedAt: v.string(),
    status: v.optional(v.string()),
    finishedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentRuns")
      .withIndex("by_runId", (q) => q.eq("runId", args.runId))
      .unique();

    if (!existing) {
      await ctx.db.insert("agentRuns", {
        runId: args.runId,
        projectId: args.projectId,
        status: args.status ?? "running",
        totalCostUsd: args.costUsd,
        spanCount: 1,
        startedAt: args.startedAt,
        finishedAt: args.finishedAt,
      });
    } else {
      await ctx.db.patch(existing._id, {
        totalCostUsd: existing.totalCostUsd + args.costUsd,
        spanCount: existing.spanCount + 1,
        status: args.status ?? existing.status,
        finishedAt: args.finishedAt ?? existing.finishedAt,
      });
    }
  },
});

/**
 * Get all runs for a project, newest first.
 */
export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return ctx.db
      .query("agentRuns")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

/**
 * Get a single run by runId (within a project for multi-tenant safety).
 */
export const getByRunId = query({
  args: { runId: v.string(), projectId: v.id("projects") },
  handler: async (ctx, { runId, projectId }) => {
    const run = await ctx.db
      .query("agentRuns")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .unique();
    // Ensure the run belongs to this project (multi-tenant guard)
    if (!run || run.projectId !== projectId) return null;
    return run;
  },
});
