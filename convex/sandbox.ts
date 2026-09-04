import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const fixtureVersion = "2026-09-04-v1";

function getUserKey(identity: { tokenIdentifier?: string; subject?: string } | null) {
  return identity?.tokenIdentifier ?? identity?.subject ?? null;
}

export const getWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userKey = getUserKey(identity);
    if (!userKey) return null;
    return await ctx.db
      .query("sandboxWorkspaces")
      .withIndex("by_userKey", (q) => q.eq("userKey", userKey))
      .unique();
  },
});

export const saveWorkspace = mutation({
  args: {
    scenarioId: v.string(),
    dismissedAlertIds: v.array(v.string()),
    expectedUpdatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userKey = getUserKey(identity);
    if (!userKey) throw new Error("Authentication required");

    const existing = await ctx.db
      .query("sandboxWorkspaces")
      .withIndex("by_userKey", (q) => q.eq("userKey", userKey))
      .unique();
    if (existing && args.expectedUpdatedAt !== undefined && existing.updatedAt !== args.expectedUpdatedAt) {
      return existing;
    }

    const next = {
      userKey,
      fixtureVersion,
      scenarioId: args.scenarioId,
      dismissedAlertIds: args.dismissedAlertIds.slice(0, 25),
      updatedAt: Date.now(),
    };
    if (existing) await ctx.db.replace(existing._id, next);
    else await ctx.db.insert("sandboxWorkspaces", next);
    return next;
  },
});
