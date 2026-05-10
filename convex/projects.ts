import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Look up a project by its SDK API key.
 * Used in the ingest route to authenticate SDK calls.
 */
export const getByApiKey = query({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    return ctx.db
      .query("projects")
      .withIndex("by_apiKey", (q) => q.eq("apiKey", apiKey))
      .unique();
  },
});

/**
 * Return all projects for a given Clerk org.
 */
export const listByOrg = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, { clerkOrgId }) => {
    return ctx.db
      .query("projects")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
      .collect();
  },
});

/**
 * Create a new project with a generated API key.
 */
export const create = mutation({
  args: {
    name: v.string(),
    clerkOrgId: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("projects", args);
  },
});
