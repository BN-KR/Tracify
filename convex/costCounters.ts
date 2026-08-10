import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Atomically check and increment a cost counter.
 * Returns { allowed: true } if the increment would stay within the ceiling,
 * or { allowed: false, currentCost: number } if it would exceed it.
 *
 * This is the atomic operation the SDK calls before each LLM call in enforce mode.
 */
export const checkAndIncrementCost = mutation({
  args: {
    projectId: v.id("projects"),
    period: v.string(),
    incrementUsd: v.number(),
    maxCost: v.number(),
  },
  handler: async (ctx, { projectId, period, incrementUsd, maxCost }) => {
    const existing = await ctx.db
      .query("costCounters")
      .withIndex("by_projectId_and_period", (q) =>
        q.eq("projectId", projectId).eq("period", period)
      )
      .unique();

    const currentCost = existing?.costUsd ?? 0;
    const newCost = currentCost + incrementUsd;

    if (newCost > maxCost) {
      return { allowed: false, currentCost };
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        costUsd: newCost,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("costCounters", {
        projectId,
        period,
        costUsd: incrementUsd,
        updatedAt: Date.now(),
      });
    }

    return { allowed: true, currentCost: newCost };
  },
});

/**
 * Read current cost for a period without incrementing.
 * Used by the SDK for observe mode or pre-flight checks.
 */
export const getCostCounter = query({
  args: {
    projectId: v.id("projects"),
    period: v.string(),
  },
  handler: async (ctx, { projectId, period }) => {
    const existing = await ctx.db
      .query("costCounters")
      .withIndex("by_projectId_and_period", (q) =>
        q.eq("projectId", projectId).eq("period", period)
      )
      .unique();

    return existing?.costUsd ?? 0;
  },
});

/**
 * Reset cost counters for a project. Called at the start of a new day.
 * This is a manual reset — in production, an Inngest cron job would call this.
 */
export const resetDailyCostCounter = mutation({
  args: {
    projectId: v.id("projects"),
    day: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, { projectId, day }) => {
    const period = `day:${day}`;
    const existing = await ctx.db
      .query("costCounters")
      .withIndex("by_projectId_and_period", (q) =>
        q.eq("projectId", projectId).eq("period", period)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { costUsd: 0, updatedAt: Date.now() });
    }
  },
});
