import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

function getOrgId(identity: unknown) {
  const value = (identity as { orgId?: unknown; org_id?: unknown }).orgId ?? (identity as { org_id?: unknown }).org_id;
  return typeof value === "string" && value ? value : undefined;
}

function canAccessProject(project: Doc<"projects">, identity: { subject: string; tokenIdentifier: string }) {
  const orgId = getOrgId(identity);
  return Boolean(orgId && project.clerkOrgId === orgId) || project.clerkUserId === identity.subject;
}

async function requireProject(ctx: MutationCtx, projectId: Id<"projects">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const project = await ctx.db.get(projectId);
  if (!project || !canAccessProject(project, identity)) throw new Error("Project not found or access denied");
  return { identity };
}

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return [];
    return ctx.db.query("automations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).order("desc").take(100);
  },
});

export const create = mutation({
  args: { projectId: v.id("projects"), name: v.string(), eventSource: v.string(), actionType: v.string(), destination: v.string() },
  handler: async (ctx, args) => {
    const { identity } = await requireProject(ctx, args.projectId);
    const name = args.name.trim();
    if (!name || !args.eventSource.trim() || !args.actionType.trim() || !args.destination.trim()) throw new Error("Automation fields are required");
    const duplicate = await ctx.db.query("automations").withIndex("by_projectId_and_name", (q) => q.eq("projectId", args.projectId).eq("name", name)).first();
    if (duplicate) throw new Error("An automation with this name already exists");
    const now = Date.now();
    return ctx.db.insert("automations", { projectId: args.projectId, name, eventSource: args.eventSource.trim(), actionType: args.actionType.trim(), destination: args.destination.trim(), active: true, createdBy: identity.subject, createdAt: now, updatedAt: now });
  },
});
