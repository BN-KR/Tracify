import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Purges cached Convex records older than the requested cutoff.
 * Tinybird retention should be configured separately at the datasource level;
 * this mutation keeps the dashboard's durable summaries aligned with it.
 */
function isJobAuthorized(jobSecret: string | undefined) {
  const configured = process.env.TRACIFY_RETENTION_SECRET;
  return Boolean(configured && jobSecret && jobSecret === configured);
}

export const listProjectsForRetention = query({
  args: { jobSecret: v.string() },
  handler: async (ctx, { jobSecret }) => {
    if (!isJobAuthorized(jobSecret)) throw new Error("Retention job unauthorized");
    const projects = await ctx.db.query("projects").take(1000);
    return projects.map((project) => ({ projectId: project._id, retentionDays: project.retentionDays ?? 365 }));
  },
});

export const purgeProjectData = mutation({
  args: { projectId: v.id("projects"), olderThan: v.number(), jobSecret: v.optional(v.string()) },
  handler: async (ctx, { projectId, olderThan, jobSecret }) => {
    const identity = await ctx.auth.getUserIdentity();
    const jobAuthorized = isJobAuthorized(jobSecret);
    if (!identity && !jobAuthorized) throw new Error("Authentication required");
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    const orgId = identity?.org_id ?? identity?.organization_id ?? null;
    const isAdmin = Boolean(identity && (project.clerkUserId === identity.subject || Boolean(orgId && project.clerkOrgId === orgId)));
    if (!jobAuthorized && !isAdmin) throw new Error("Project administrator access required");

    let deleted = 0;
    const runs = await ctx.db.query("agentRuns").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).take(500);
    for (const run of runs) {
      const timestamp = Date.parse(run.createdAt ?? run.startedAt);
      if (Number.isFinite(timestamp) && timestamp < olderThan) {
        await ctx.db.delete(run._id);
        deleted++;
      }
    }
    const sessions = await ctx.db.query("sessions").withIndex("by_projectId_and_lastSeenAt", (q) => q.eq("projectId", projectId)).take(500);
    for (const session of sessions) {
      if (Date.parse(session.lastSeenAt) < olderThan) {
        await ctx.db.delete(session._id);
        deleted++;
      }
    }
    const caches = await ctx.db.query("runSpanCache").withIndex("by_projectId_and_runId", (q) => q.eq("projectId", projectId)).take(500);
    for (const cache of caches) {
      if (cache.updatedAt < olderThan) {
        await ctx.db.delete(cache._id);
        deleted++;
      }
    }
    return { deleted, hasMore: runs.length === 500 || sessions.length === 500 || caches.length === 500 };
  },
});
