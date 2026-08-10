import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

function orgId(identity: unknown) {
  const value = (identity as { orgId?: unknown; org_id?: unknown }).orgId ?? (identity as { org_id?: unknown }).org_id;
  return typeof value === "string" && value ? value : undefined;
}
function canAccess(project: Doc<"projects">, identity: { subject: string; tokenIdentifier: string }) {
  const id = orgId(identity);
  return Boolean(id && project.clerkOrgId === id) || project.clerkUserId === identity.subject;
}
// Convex's generated context types are shared with the legacy evaluator functions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireProject(ctx: any, projectId: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const project = await ctx.db.get(projectId);
  if (!project || !canAccess(project, identity)) throw new Error("Project not found or access denied");
  return { identity };
}

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(projectId);
    if (!project || !canAccess(project, identity)) return [];
    return ctx.db.query("evaluators").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).order("desc").take(100);
  },
});

export const create = mutation({
  args: { projectId: v.id("projects"), name: v.string(), type: v.union(v.literal("code"), v.literal("llm_judge")), criteria: v.string() },
  handler: async (ctx, args) => {
    const { identity } = await requireProject(ctx, args.projectId);
    const name = args.name.trim();
    const criteria = args.criteria.trim();
    if (!name || !criteria) throw new Error("Evaluator name and criteria are required");
    const duplicate = await ctx.db.query("evaluators").withIndex("by_projectId_and_name", (q) => q.eq("projectId", args.projectId).eq("name", name)).first();
    if (duplicate) throw new Error("An evaluator with this name already exists");
    const now = Date.now();
    return ctx.db.insert("evaluators", { projectId: args.projectId, name, type: args.type, criteria, active: true, createdBy: identity.subject, createdAt: now, updatedAt: now });
  },
});

export const setActive = mutation({
  args: { projectId: v.id("projects"), evaluatorId: v.id("evaluators"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireProject(ctx, args.projectId);
    const evaluator = await ctx.db.get(args.evaluatorId);
    if (!evaluator || evaluator.projectId !== args.projectId) throw new Error("Evaluator not found");
    await ctx.db.patch(args.evaluatorId, { active: args.active, updatedAt: Date.now() });
  },
});

export const get = query({
  args: { projectId: v.id("projects"), evaluatorId: v.id("evaluators") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return null;
    const evaluator = await ctx.db.get(args.evaluatorId);
    if (!evaluator || evaluator.projectId !== args.projectId || !evaluator.active) return null;
    return evaluator;
  },
});
