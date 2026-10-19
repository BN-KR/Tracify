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

const STATS_WINDOW = 50;

/** Every evaluator with its newest configuration and how its last runs went (up to 50 runs each). */
export const overview = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(projectId);
    if (!project || !canAccess(project, identity)) return [];
    const evaluators = await ctx.db.query("evaluators").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).order("desc").take(100);
    return Promise.all(evaluators.map(async (evaluator) => {
      const version = await ctx.db.query("evaluatorVersions").withIndex("by_evaluatorId", (q) => q.eq("evaluatorId", evaluator._id)).order("desc").first();
      const results = await ctx.db.query("evaluationResults").withIndex("by_evaluatorId", (q) => q.eq("evaluatorId", evaluator._id)).order("desc").take(STATS_WINDOW);
      const passed = results.filter((result) => result.status === "passed").length;
      const failed = results.filter((result) => result.status === "failed").length;
      const errored = results.filter((result) => result.status === "error").length;
      const judged = passed + failed;
      const numbers = results.flatMap((result) => (typeof result.value === "number" && result.status !== "error" && result.status !== "skipped" ? [result.value] : []));
      return {
        evaluator,
        config: version ? { version: version.version, ...version.config } : null,
        stats: { runs: results.length, windowFull: results.length === STATS_WINDOW, passed, failed, errored, passRate: judged ? passed / judged : null, average: numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null, lastRunAt: results[0]?.createdAt ?? null },
      };
    }));
  },
});

/** The most recent runs of one evaluator, newest first. */
export const recentResults = query({
  args: { projectId: v.id("projects"), evaluatorId: v.id("evaluators") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return [];
    const evaluator = await ctx.db.get(args.evaluatorId);
    if (!evaluator || evaluator.projectId !== args.projectId) return [];
    return ctx.db.query("evaluationResults").withIndex("by_evaluatorId", (q) => q.eq("evaluatorId", args.evaluatorId)).order("desc").take(30);
  },
});

/**
 * Edits an evaluator. The kind (code rule or AI judge) stays fixed; everything else can change.
 * Each save writes a new version, so earlier results keep pointing at the settings that produced them.
 */
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    evaluatorId: v.id("evaluators"),
    name: v.string(),
    criteria: v.string(),
    scoreType: v.union(v.literal("boolean"), v.literal("numeric")),
    model: v.optional(v.string()),
    sampleRate: v.number(),
    enabledOnline: v.boolean(),
    template: v.optional(v.union(v.literal("groundedness"), v.literal("toxicity"), v.literal("pii"), v.literal("jailbreak"), v.literal("prompt_injection"), v.literal("policy"))),
  },
  handler: async (ctx, args) => {
    await requireProject(ctx, args.projectId);
    const evaluator = await ctx.db.get(args.evaluatorId);
    if (!evaluator || evaluator.projectId !== args.projectId) throw new Error("Evaluator not found");
    const name = args.name.trim();
    const criteria = args.criteria.trim();
    if (!name || !criteria) throw new Error("Evaluator name and criteria are required");
    if (name.length > 100) throw new Error("A name can be at most 100 characters");
    if (criteria.length > 20_000) throw new Error("The rule or rubric is too long");
    if (!Number.isFinite(args.sampleRate) || args.sampleRate < 0 || args.sampleRate > 1) throw new Error("Sample rate must be between 0 and 1");
    if (name !== evaluator.name) {
      const duplicate = await ctx.db.query("evaluators").withIndex("by_projectId_and_name", (q) => q.eq("projectId", args.projectId).eq("name", name)).first();
      if (duplicate) throw new Error("An evaluator with this name already exists");
    }
    const isJudge = evaluator.type === "llm_judge";
    if (isJudge && !args.model?.trim()) throw new Error("Name the model that should judge");
    const latest = await ctx.db.query("evaluatorVersions").withIndex("by_evaluatorId", (q) => q.eq("evaluatorId", args.evaluatorId)).order("desc").first();
    const now = Date.now();
    const scoreType = isJudge ? args.scoreType : "boolean";
    await ctx.db.patch(args.evaluatorId, { name, criteria, updatedAt: now });
    const version = (latest?.version ?? 0) + 1;
    await ctx.db.insert("evaluatorVersions", {
      projectId: args.projectId,
      evaluatorId: args.evaluatorId,
      version,
      config: {
        target: latest?.config.target ?? "trace",
        scoreType,
        prompt: isJudge ? criteria : undefined,
        model: isJudge ? args.model?.trim() : undefined,
        rule: isJudge ? undefined : criteria,
        categories: latest?.config.categories,
        minScore: isJudge && scoreType === "numeric" ? 0 : undefined,
        maxScore: isJudge && scoreType === "numeric" ? 1 : undefined,
        sampleRate: args.enabledOnline ? args.sampleRate : 0,
        enabledOnline: args.enabledOnline,
        template: isJudge ? args.template : undefined,
      },
      createdBy: (await ctx.auth.getUserIdentity())!.subject,
      createdAt: now,
    });
    return version;
  },
});
