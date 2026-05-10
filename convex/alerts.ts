import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    runId: v.string(),
    projectId: v.id("projects"),
    type: v.string(),
    message: v.string(),
    triggeredAt: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("alerts", args);
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return ctx.db
      .query("alerts")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const listByRun = query({
  args: { runId: v.string(), projectId: v.id("projects") },
  handler: async (ctx, { runId, projectId }) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .collect();
    return alerts.filter((a) => a.projectId === projectId);
  },
});
