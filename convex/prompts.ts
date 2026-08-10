import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

function getOrgId(identity: unknown) {
  const value = (identity as { orgId?: unknown; org_id?: unknown }).orgId ??
    (identity as { org_id?: unknown }).org_id;
  return typeof value === "string" && value ? value : undefined;
}

function canAccessProject(project: Doc<"projects">, identity: { subject: string; tokenIdentifier: string }) {
  const orgId = getOrgId(identity);
  return (Boolean(orgId && project.clerkOrgId === orgId) || project.clerkUserId === identity.subject);
}

// Convex's generated context types are shared with the legacy prompt functions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireProject(ctx: any, projectId: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const project = await ctx.db.get(projectId);
  if (!project || !canAccessProject(project, identity)) throw new Error("Project not found or access denied");
  return { identity, project };
}

function variablesFromContent(content: string) {
  return [...new Set(Array.from(content.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g), (match) => match[1]))];
}

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return [];
    const prompts = await ctx.db.query("prompts").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).order("desc").collect();
    return Promise.all(prompts.map(async (prompt) => ({
      ...prompt,
      versions: await ctx.db.query("promptVersions").withIndex("by_promptId", (q) => q.eq("promptId", prompt._id)).order("desc").take(20),
    })));
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("text"), v.literal("chat")),
    content: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireProject(ctx, args.projectId);
    const name = args.name.trim();
    const content = args.content.trim();
    if (!name || !content) throw new Error("Prompt name and content are required");
    const duplicate = await ctx.db.query("prompts").withIndex("by_projectId_and_name", (q) => q.eq("projectId", args.projectId).eq("name", name)).first();
    if (duplicate) throw new Error("A prompt with this name already exists");
    const now = Date.now();
    const promptId = await ctx.db.insert("prompts", { projectId: args.projectId, name, description: args.description?.trim() || undefined, type: args.type, createdBy: identity.subject, createdAt: now, updatedAt: now });
    await ctx.db.insert("promptVersions", { promptId, projectId: args.projectId, version: 1, content, variables: variablesFromContent(content), labels: ["latest"], model: args.model?.trim() || undefined, createdBy: identity.subject, createdAt: now });
    return promptId;
  },
});

export const createVersion = mutation({
  args: { projectId: v.id("projects"), promptId: v.id("prompts"), content: v.string(), model: v.optional(v.string()), labels: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const { identity } = await requireProject(ctx, args.projectId);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.projectId !== args.projectId) throw new Error("Prompt not found");
    const latest = await ctx.db.query("promptVersions").withIndex("by_promptId", (q) => q.eq("promptId", args.promptId)).order("desc").first();
    const version = (latest?.version ?? 0) + 1;
    const content = args.content.trim();
    if (!content) throw new Error("Prompt content is required");
    if ((args.labels ?? []).some((label) => label.trim() === "production")) {
      throw new Error("Production promotion requires a passed evaluation release gate");
    }
    const now = Date.now();
    await ctx.db.insert("promptVersions", { promptId: args.promptId, projectId: args.projectId, version, content, variables: variablesFromContent(content), labels: args.labels ?? ["latest"], model: args.model?.trim() || undefined, createdBy: identity.subject, createdAt: now });
    await ctx.db.patch(args.promptId, { updatedAt: now });
    return version;
  },
});

export const update = mutation({
  args: { projectId: v.id("projects"), promptId: v.id("prompts"), name: v.optional(v.string()), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireProject(ctx, args.projectId);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.projectId !== args.projectId) throw new Error("Prompt not found");
    const name = args.name?.trim();
    if (name && name !== prompt.name) {
      const duplicate = await ctx.db.query("prompts").withIndex("by_projectId_and_name", (q) => q.eq("projectId", args.projectId).eq("name", name)).first();
      if (duplicate) throw new Error("A prompt with this name already exists");
    }
    await ctx.db.patch(args.promptId, { name: name || prompt.name, description: args.description?.trim() || prompt.description, updatedAt: Date.now() });
  },
});

export const updateLabels = mutation({
  args: { projectId: v.id("projects"), versionId: v.id("promptVersions"), labels: v.array(v.string()) },
  handler: async (ctx, args) => {
    await requireProject(ctx, args.projectId);
    const version = await ctx.db.get(args.versionId);
    if (!version || version.projectId !== args.projectId) throw new Error("Prompt version not found");
    const labels = [...new Set(args.labels.map((label) => label.trim()).filter(Boolean))];
    if (labels.includes("production")) throw new Error("Production promotion requires a passed evaluation release gate");
    await ctx.db.patch(args.versionId, { labels });
  },
});

export const linkTrace = mutation({
  args: { projectId: v.id("projects"), promptVersionId: v.id("promptVersions"), traceId: v.string(), spanId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireProject(ctx, args.projectId);
    const version = await ctx.db.get(args.promptVersionId);
    if (!version || version.projectId !== args.projectId) throw new Error("Prompt version not found");
    const existing = await ctx.db.query("promptTraceLinks").withIndex("by_traceId", (q) => q.eq("projectId", args.projectId).eq("traceId", args.traceId)).filter((q) => q.eq(q.field("promptVersionId"), args.promptVersionId)).first();
    if (existing) return existing._id;
    return ctx.db.insert("promptTraceLinks", { projectId: args.projectId, promptId: version.promptId, promptVersionId: args.promptVersionId, traceId: args.traceId, spanId: args.spanId, createdAt: Date.now() });
  },
});

export const linkTraceFromApiKey = mutation({
  args: { projectId: v.id("projects"), apiKeyHash: v.string(), promptVersionId: v.id("promptVersions"), traceId: v.string(), spanId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.apiKeyHash !== args.apiKeyHash) throw new Error("Invalid API key");
    const version = await ctx.db.get(args.promptVersionId);
    if (!version || version.projectId !== args.projectId) throw new Error("Prompt version not found");
    return ctx.db.insert("promptTraceLinks", { projectId: args.projectId, promptId: version.promptId, promptVersionId: args.promptVersionId, traceId: args.traceId, spanId: args.spanId, createdAt: Date.now() });
  },
});

export const listTraceLinks = query({
  args: { projectId: v.id("projects"), promptVersionId: v.optional(v.id("promptVersions")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return [];
    const links = await ctx.db.query("promptTraceLinks").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).order("desc").take(200);
    return args.promptVersionId ? links.filter((link) => link.promptVersionId === args.promptVersionId) : links;
  },
});

export const resolveByApiKey = query({
  args: { apiKeyHash: v.string(), name: v.string(), environment: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db.query("projects").withIndex("by_apiKeyHash", (q) => q.eq("apiKeyHash", args.apiKeyHash)).first();
    if (!project || project.apiKeyStatus === "revoked") return null;
    const prompt = await ctx.db.query("prompts").withIndex("by_projectId_and_name", (q) => q.eq("projectId", project._id).eq("name", args.name.trim())).first();
    if (!prompt) return null;
    const versions = await ctx.db.query("promptVersions").withIndex("by_promptId", (q) => q.eq("promptId", prompt._id)).order("desc").collect();
    const version = versions.find((candidate) => candidate.labels.includes(args.environment.trim())) ?? null;
    if (!version) return null;
    return { prompt: { id: prompt._id, name: prompt.name, description: prompt.description, type: prompt.type }, version: { id: version._id, version: version.version ?? 1, content: version.content, variables: version.variables, labels: version.labels, model: version.model, createdAt: version.createdAt } };
  },
});
