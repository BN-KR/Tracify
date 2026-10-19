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
    const { name, destination } = checkFields(args);
    const duplicate = await ctx.db.query("automations").withIndex("by_projectId_and_name", (q) => q.eq("projectId", args.projectId).eq("name", name)).first();
    if (duplicate) throw new Error("An automation with this name already exists");
    const now = Date.now();
    return ctx.db.insert("automations", { projectId: args.projectId, name, eventSource: args.eventSource, actionType: args.actionType, destination, active: true, createdBy: identity.subject, createdAt: now, updatedAt: now });
  },
});

export const EVENT_SOURCES = ["alert.created", "run.failed", "cost.threshold"] as const;
export const ACTION_TYPES = ["webhook", "slack", "github_dispatch"] as const;

function checkFields(args: { name: string; eventSource: string; actionType: string; destination: string }) {
  const name = args.name.trim();
  const destination = args.destination.trim();
  if (!name) throw new Error("Give the automation a name");
  if (name.length > 100) throw new Error("A name can be at most 100 characters");
  if (!(EVENT_SOURCES as readonly string[]).includes(args.eventSource)) throw new Error("Unknown trigger");
  if (!(ACTION_TYPES as readonly string[]).includes(args.actionType)) throw new Error("Unknown action");
  if (args.actionType === "github_dispatch") {
    if (!/^[\w.-]+\/[\w.-]+$/.test(destination)) throw new Error("Use the form owner/repository");
  } else {
    let url: URL;
    try { url = new URL(destination); } catch { throw new Error("The destination must be a full web address"); }
    if (url.protocol !== "https:") throw new Error("The destination must start with https://");
  }
  return { name, destination };
}

async function loadOwned(ctx: MutationCtx, projectId: Id<"projects">, automationId: Id<"automations">) {
  await requireProject(ctx, projectId);
  const automation = await ctx.db.get(automationId);
  if (!automation || automation.projectId !== projectId) throw new Error("Automation not found");
  return automation;
}

export const update = mutation({
  args: { projectId: v.id("projects"), automationId: v.id("automations"), name: v.string(), eventSource: v.string(), actionType: v.string(), destination: v.string() },
  handler: async (ctx, args) => {
    const automation = await loadOwned(ctx, args.projectId, args.automationId);
    const { name, destination } = checkFields(args);
    if (name !== automation.name) {
      const duplicate = await ctx.db.query("automations").withIndex("by_projectId_and_name", (q) => q.eq("projectId", args.projectId).eq("name", name)).first();
      if (duplicate) throw new Error("An automation with this name already exists");
    }
    await ctx.db.patch(args.automationId, { name, eventSource: args.eventSource, actionType: args.actionType, destination, updatedAt: Date.now() });
  },
});

export const setActive = mutation({
  args: { projectId: v.id("projects"), automationId: v.id("automations"), active: v.boolean() },
  handler: async (ctx, args) => {
    await loadOwned(ctx, args.projectId, args.automationId);
    await ctx.db.patch(args.automationId, { active: args.active, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects"), automationId: v.id("automations") },
  handler: async (ctx, args) => {
    await loadOwned(ctx, args.projectId, args.automationId);
    await ctx.db.delete(args.automationId);
  },
});
