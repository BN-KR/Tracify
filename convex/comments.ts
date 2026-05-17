import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    spanId: v.string(),
    projectId: v.id("projects"),
    runId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("comments", {
      spanId: args.spanId,
      projectId: args.projectId,
      runId: args.runId,
      userId: identity.subject,
      userName: identity.name || "User",
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const listBySpan = query({
  args: {
    spanId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_spanId", (q) => q.eq("spanId", args.spanId))
      .order("asc")
      .collect();
  },
});

export const listByRun = query({
  args: {
    runId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_runId", (q) => q.eq("runId", args.runId))
      .order("asc")
      .collect();
  },
});
