import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function canAccessProject(project: { clerkUserId?: string; clerkOrgId?: string }, identity: { subject: string; orgId?: string; org_id?: string }) {
  const orgId = identity.orgId ?? identity.org_id;
  return project.clerkUserId === identity.subject || Boolean(orgId && project.clerkOrgId === orgId);
}

export const listByProject = query({
  args: { projectId: v.id("projects"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return [];
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_projectId_and_createdAt", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(Math.min(Math.max(args.limit ?? 100, 1), 250));
  },
});

export const record = mutation({
  args: {
    projectId: v.id("projects"),
    action: v.string(),
    resource: v.string(),
    summary: v.string(),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) throw new Error("Project not found or access denied");
    await ctx.db.insert("auditLogs", {
      projectId: args.projectId,
      actorId: identity.subject,
      actorEmail: identity.email,
      action: args.action,
      resource: args.resource,
      summary: args.summary,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});
