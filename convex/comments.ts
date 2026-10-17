import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

function getOrgId(identity: unknown) {
  const orgId = (identity as { orgId?: unknown; org_id?: unknown }).orgId ??
    (identity as { org_id?: unknown }).org_id;
  return typeof orgId === "string" && orgId.length > 0 ? orgId : undefined;
}

function getOrgRole(identity: unknown) {
  const role = (identity as { orgRole?: unknown; org_role?: unknown }).orgRole ??
    (identity as { org_role?: unknown }).org_role;
  return typeof role === "string" ? role : undefined;
}

function canAccessProject(
  project: Doc<"projects">,
  identity: { subject: string; tokenIdentifier: string },
) {
  const clerkOrgId = getOrgId(identity);
  if (clerkOrgId && project.clerkOrgId === clerkOrgId) return true;
  return project.clerkUserId === identity.subject;
}

function canComment(
  project: Doc<"projects">,
  identity: { subject: string; tokenIdentifier: string },
) {
  if (project.clerkUserId === identity.subject) return true;
  const clerkOrgId = getOrgId(identity);
  const orgRole = getOrgRole(identity);
  return (
    Boolean(clerkOrgId && project.clerkOrgId === clerkOrgId) &&
    orgRole !== "viewer" &&
    orgRole !== "org:viewer"
  );
}

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

    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) {
      throw new Error("Project not found or access denied");
    }
    if (!canComment(project, identity)) {
      throw new Error("Developer access required");
    }

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
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return [];

    return await ctx.db
      .query("comments")
      .withIndex("by_spanId", (q) => q.eq("spanId", args.spanId))
      .order("asc")
      .take(100);
  },
});

export const listByRun = query({
  args: {
    runId: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return [];

    return await ctx.db
      .query("comments")
      .withIndex("by_runId", (q) => q.eq("runId", args.runId))
      .order("asc")
      .take(200);
  },
});

// Run notes are comments on the whole run, stored under a per-run key so the span index finds them.
const runNoteKey = (runId: string) => `run:${runId}`;

export const createRunNote = mutation({
  args: { projectId: v.id("projects"), runId: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) throw new Error("Project not found or access denied");
    if (!canComment(project, identity)) throw new Error("Developer access required");
    const content = args.content.trim();
    if (!content || content.length > 4000) throw new Error("Notes must be 1 to 4000 characters");
    return await ctx.db.insert("comments", {
      spanId: runNoteKey(args.runId),
      projectId: args.projectId,
      runId: args.runId,
      userId: identity.subject,
      userName: identity.name || "User",
      content,
      createdAt: Date.now(),
    });
  },
});

export const listRunNotes = query({
  args: { projectId: v.id("projects"), runId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return [];
    const notes = await ctx.db
      .query("comments")
      .withIndex("by_spanId", (q) => q.eq("spanId", runNoteKey(args.runId)))
      .order("asc")
      .take(200);
    return notes.filter((note) => note.projectId === args.projectId);
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const comment = await ctx.db.get(commentId);
    if (!comment) return null;
    const project = await ctx.db.get(comment.projectId);
    if (!project || !canAccessProject(project, identity)) throw new Error("Project not found or access denied");
    const role = getOrgRole(identity);
    const isAdmin = project.clerkUserId === identity.subject || role === "owner" || role === "admin" || role === "org:admin";
    if (comment.userId !== identity.subject && !isAdmin) throw new Error("You can only delete your own notes");
    await ctx.db.delete(commentId);
    return null;
  },
});
