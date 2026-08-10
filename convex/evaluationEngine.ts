import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

type Identity = { subject: string; tokenIdentifier: string };

function organizationId(identity: Identity) {
  const value = identity as Identity & { orgId?: unknown; org_id?: unknown };
  return typeof value.orgId === "string" ? value.orgId : typeof value.org_id === "string" ? value.org_id : undefined;
}

function canAccess(project: Doc<"projects">, identity: Identity) {
  const orgId = organizationId(identity);
  return Boolean((orgId && project.clerkOrgId === orgId) || project.clerkUserId === identity.subject);
}
function canAccessDataset(dataset: Doc<"datasets">, identity: Identity) {
  return dataset.access !== "restricted" || dataset.createdBy === identity.subject || Boolean(dataset.allowedUserIds?.includes(identity.subject));
}

// Convex's generated context is intentionally generic here because this helper is shared by a query and mutation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readSuiteGate(ctx: any, projectId: Id<"projects">, suiteId: Id<"evaluationSuites">, jobId: Id<"evaluationJobs">) {
  const suite = await ctx.db.get(suiteId);
  const job = await ctx.db.get(jobId);
  if (!suite || suite.projectId !== projectId || !job || job.projectId !== projectId || job.suiteId !== suiteId) throw new Error("Regression suite or job not found");
  const results = await ctx.db.query("evaluationResults").withIndex("by_jobId", (q: unknown) => (q as { eq: (field: string, value: unknown) => unknown }).eq("jobId", jobId)).collect();
  const completed = results.filter((result: { status: string }) => result.status !== "skipped");
  const passed = completed.filter((result: { status: string }) => result.status === "passed").length;
  const numeric = completed.map((result: { value: unknown }) => typeof result.value === "number" ? result.value : null).filter((value: number | null): value is number => value !== null);
  const passRate = completed.length ? passed / completed.length : 0;
  const averageScore = numeric.length ? numeric.reduce((sum: number, value: number) => sum + value, 0) / numeric.length : null;
  const regressionRate = completed.length ? (completed.length - passed) / completed.length : 1;
  const failures: string[] = [];
  if (suite.minScore !== undefined && (averageScore === null || averageScore < suite.minScore)) failures.push(`average score ${averageScore === null ? "unavailable" : averageScore.toFixed(3)} is below ${suite.minScore}`);
  if (suite.maxRegressionRate !== undefined && regressionRate > suite.maxRegressionRate) failures.push(`regression rate ${regressionRate.toFixed(3)} exceeds ${suite.maxRegressionRate}`);
  return { suiteId, jobId, sampleCount: completed.length, passRate, averageScore, regressionRate, passed: failures.length === 0 && completed.length > 0, failures };
}

async function getProject(ctx: { auth: { getUserIdentity: () => Promise<Identity | null> }; db: { get: (table: "projects", id: Id<"projects">) => Promise<Doc<"projects"> | null> } }, projectId: Id<"projects">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const project = await ctx.db.get("projects", projectId);
  if (!project || !canAccess(project, identity)) throw new Error("Project not found or access denied");
  return { identity, project };
}

export const overview = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return null;
    const evaluators = await ctx.db.query("evaluators").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).take(100);
    const suites = await ctx.db.query("evaluationSuites").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).take(100);
    const jobs = await ctx.db.query("evaluationJobs").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).order("desc").take(50);
    const monitors = await ctx.db.query("evaluationMonitors").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).take(100);
    const annotations = await ctx.db.query("annotations").withIndex("by_projectId_and_status", (q) => q.eq("projectId", args.projectId).eq("status", "queued")).take(200);
    const results = await ctx.db.query("evaluationResults").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).order("desc").take(200);
    const passed = results.filter((result) => result.status === "passed").length;
    return {
      evaluatorCount: evaluators.length,
      activeEvaluatorCount: evaluators.filter((evaluator) => evaluator.active).length,
      suiteCount: suites.length,
      jobCount: jobs.length,
      monitorCount: monitors.filter((monitor) => monitor.active).length,
      reviewCount: annotations.length,
      resultCount: results.length,
      passRate: results.length ? passed / results.length : null,
      recentJobs: jobs.slice(0, 8),
      recentResults: results.slice(0, 20),
      recentMonitors: monitors.slice(0, 20),
      recentSuites: suites.slice(0, 20),
    };
  },
});

export const traceQuality = query({
  args: { projectId: v.id("projects"), traceId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return null;
    const scores = await ctx.db.query("scores").withIndex("by_projectId_and_traceId", (q) => q.eq("projectId", args.projectId).eq("traceId", args.traceId)).order("desc").take(100);
    const results = await ctx.db.query("evaluationResults").withIndex("by_projectId_and_traceId", (q) => q.eq("projectId", args.projectId).eq("traceId", args.traceId)).order("desc").take(100);
    const feedback = await ctx.db.query("evaluationFeedback").withIndex("by_projectId_and_traceId", (q) => q.eq("projectId", args.projectId).eq("traceId", args.traceId)).order("desc").take(20);
    return { scores, results, feedback };
  },
});

export const results = query({
  args: { projectId: v.id("projects"), jobId: v.optional(v.id("evaluationJobs")), traceId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return [];
    const rows = await ctx.db.query("evaluationResults").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).order("desc").take(500);
    return rows.filter((row) => (!args.jobId || row.jobId === args.jobId) && (!args.traceId || row.traceId === args.traceId));
  },
});

export const queueTraceForReview = mutation({
  args: { projectId: v.id("projects"), traceId: v.string(), spanId: v.optional(v.string()), label: v.optional(v.string()), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { identity } = await getProject(ctx, args.projectId);
    if (!args.traceId.trim()) throw new Error("Trace ID is required");
    const existing = await ctx.db.query("annotations").withIndex("by_projectId_and_traceId", (q) => q.eq("projectId", args.projectId).eq("traceId", args.traceId.trim())).first();
    if (existing) return existing._id;
    return ctx.db.insert("annotations", { projectId: args.projectId, traceId: args.traceId.trim(), spanId: args.spanId?.trim() || undefined, status: "queued", label: args.label?.trim() || "manual_review", notes: args.notes?.trim(), createdBy: identity.subject, createdAt: Date.now() });
  },
});

export const createEvaluator = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    type: v.union(v.literal("code"), v.literal("llm_judge")),
    criteria: v.string(),
    target: v.union(v.literal("trace"), v.literal("span"), v.literal("dataset_item")),
    scoreType: v.union(v.literal("boolean"), v.literal("numeric"), v.literal("categorical"), v.literal("text")),
    prompt: v.optional(v.string()),
    model: v.optional(v.string()),
    rule: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    minScore: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    sampleRate: v.number(),
    enabledOnline: v.boolean(),
    template: v.optional(v.union(v.literal("groundedness"), v.literal("toxicity"), v.literal("pii"), v.literal("jailbreak"), v.literal("prompt_injection"), v.literal("policy"))),
  },
  handler: async (ctx, args) => {
    const { identity } = await getProject(ctx, args.projectId);
    const name = args.name.trim();
    const criteria = args.criteria.trim();
    if (!name || !criteria) throw new Error("Evaluator name and criteria are required");
    if (!Number.isFinite(args.sampleRate) || args.sampleRate < 0 || args.sampleRate > 1) throw new Error("Sample rate must be between 0 and 1");
    const duplicate = await ctx.db.query("evaluators").withIndex("by_projectId_and_name", (q) => q.eq("projectId", args.projectId).eq("name", name)).first();
    if (duplicate) throw new Error("An evaluator with this name already exists");
    const now = Date.now();
    const evaluatorId = await ctx.db.insert("evaluators", { projectId: args.projectId, name, type: args.type, criteria, active: true, createdBy: identity.subject, createdAt: now, updatedAt: now });
    await ctx.db.insert("evaluatorVersions", {
      projectId: args.projectId,
      evaluatorId,
      version: 1,
      config: { target: args.target, scoreType: args.scoreType, prompt: args.prompt?.trim() || undefined, model: args.model?.trim() || undefined, rule: args.rule?.trim() || undefined, categories: args.categories, minScore: args.minScore, maxScore: args.maxScore, sampleRate: args.sampleRate, enabledOnline: args.enabledOnline, template: args.template },
      createdBy: identity.subject,
      createdAt: now,
    });
    return evaluatorId;
  },
});

export const createSuite = mutation({
  args: { projectId: v.id("projects"), name: v.string(), description: v.optional(v.string()), datasetId: v.id("datasets"), evaluatorIds: v.array(v.id("evaluators")), minScore: v.optional(v.number()), maxRegressionRate: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { identity } = await getProject(ctx, args.projectId);
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.projectId !== args.projectId || !canAccessDataset(dataset, identity)) throw new Error("Dataset not found or access denied");
    if (!args.name.trim() || args.evaluatorIds.length === 0) throw new Error("A suite needs a name and at least one evaluator");
    const now = Date.now();
    return ctx.db.insert("evaluationSuites", { projectId: args.projectId, name: args.name.trim(), description: args.description?.trim() || undefined, datasetId: args.datasetId, evaluatorIds: args.evaluatorIds, minScore: args.minScore, maxRegressionRate: args.maxRegressionRate, active: true, createdBy: identity.subject, createdAt: now, updatedAt: now });
  },
});

export const createJob = mutation({
  args: { projectId: v.id("projects"), suiteId: v.optional(v.id("evaluationSuites")), mode: v.union(v.literal("online"), v.literal("offline"), v.literal("preview")), traceId: v.optional(v.string()), prompt: v.optional(v.string()), model: v.optional(v.string()), promptVersionId: v.optional(v.id("promptVersions")), itemCount: v.number() },
  handler: async (ctx, args) => {
    const { identity } = await getProject(ctx, args.projectId);
    if (args.itemCount < 0) throw new Error("Item count cannot be negative");
    if (args.suiteId) {
      const suite = await ctx.db.get(args.suiteId);
      if (!suite || suite.projectId !== args.projectId) throw new Error("Evaluation suite not found");
    }
    if (args.promptVersionId) {
      const version = await ctx.db.get(args.promptVersionId);
      if (!version || version.projectId !== args.projectId) throw new Error("Prompt version not found");
    }
    return ctx.db.insert("evaluationJobs", { projectId: args.projectId, suiteId: args.suiteId, mode: args.mode, status: "queued", traceId: args.traceId?.trim() || undefined, prompt: args.prompt?.trim() || undefined, model: args.model?.trim() || undefined, promptVersionId: args.promptVersionId, itemCount: Math.floor(args.itemCount), completedCount: 0, failedCount: 0, createdBy: identity.subject, createdAt: Date.now() });
  },
});

export const suiteGate = query({
  args: { projectId: v.id("projects"), suiteId: v.id("evaluationSuites"), jobId: v.id("evaluationJobs") },
  handler: async (ctx, args) => {
    const access = await getProject(ctx, args.projectId);
    if (!access) return null;
    return readSuiteGate(ctx, args.projectId, args.suiteId, args.jobId);
  },
});

export const promotePromptVersionIfGatePassed = mutation({
  args: { projectId: v.id("projects"), suiteId: v.id("evaluationSuites"), jobId: v.id("evaluationJobs"), promptVersionId: v.id("promptVersions"), environment: v.union(v.literal("development"), v.literal("staging"), v.literal("production")) },
  handler: async (ctx, args) => {
    await getProject(ctx, args.projectId);
    const gate = await readSuiteGate(ctx, args.projectId, args.suiteId, args.jobId);
    if (!gate.passed) throw new Error(`Release gate failed: ${gate.failures.join("; ") || "no completed results"}`);
    const version = await ctx.db.get(args.promptVersionId);
    if (!version || version.projectId !== args.projectId) throw new Error("Prompt version not found");
    const labels = version.labels.filter((label: string) => !["development", "staging", "production"].includes(label));
    await ctx.db.patch(args.promptVersionId, { labels: [...labels, args.environment] });
    return { promoted: true, gate };
  },
});

export const getOfflineBundle = query({
  args: { projectId: v.id("projects"), jobId: v.id("evaluationJobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return null;
    const job = await ctx.db.get(args.jobId);
    if (!job || job.projectId !== args.projectId || job.mode === "online" || !job.suiteId) return null;
    const suite = await ctx.db.get(job.suiteId);
    if (!suite || suite.projectId !== args.projectId) return null;
    const items = await ctx.db.query("datasetItems").withIndex("by_datasetId", (q) => q.eq("datasetId", suite.datasetId)).order("asc").take(1000);
    const evaluators = await Promise.all(suite.evaluatorIds.map(async (evaluatorId) => {
      const evaluator = await ctx.db.get(evaluatorId);
      const version = evaluator ? await ctx.db.query("evaluatorVersions").withIndex("by_evaluatorId", (q) => q.eq("evaluatorId", evaluatorId)).order("desc").first() : null;
      return evaluator && version ? { evaluator, version } : null;
    }));
    return { job, suite, items, evaluators: evaluators.filter((item): item is NonNullable<typeof item> => item !== null) };
  },
});

export const setJobStatus = mutation({
  args: { projectId: v.id("projects"), jobId: v.id("evaluationJobs"), status: v.union(v.literal("queued"), v.literal("running"), v.literal("completed"), v.literal("partial"), v.literal("failed"), v.literal("cancelled")), error: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getProject(ctx, args.projectId);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.projectId !== args.projectId) throw new Error("Evaluation job not found");
    await ctx.db.patch(args.jobId, { status: args.status, error: args.error?.slice(0, 2000), completedAt: ["completed", "partial", "failed", "cancelled"].includes(args.status) ? Date.now() : undefined });
  },
});

export const recordOfflineResult = mutation({
  args: { projectId: v.id("projects"), jobId: v.id("evaluationJobs"), evaluatorId: v.id("evaluators"), evaluatorVersion: v.number(), datasetItemId: v.id("datasetItems"), value: v.union(v.number(), v.boolean(), v.string()), dataType: v.union(v.literal("boolean"), v.literal("numeric"), v.literal("categorical"), v.literal("text")), status: v.union(v.literal("passed"), v.literal("failed"), v.literal("error"), v.literal("skipped")), explanation: v.optional(v.string()), latencyMs: v.optional(v.number()), costUsd: v.optional(v.number()), error: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getProject(ctx, args.projectId);
    const job = await ctx.db.get(args.jobId);
    const item = await ctx.db.get(args.datasetItemId);
    const evaluator = await ctx.db.get(args.evaluatorId);
    if (!job || job.projectId !== args.projectId || !item || item.projectId !== args.projectId || !evaluator || evaluator.projectId !== args.projectId) throw new Error("Offline evaluation reference not found");
    const resultId = await ctx.db.insert("evaluationResults", { projectId: args.projectId, jobId: args.jobId, evaluatorId: args.evaluatorId, evaluatorVersion: args.evaluatorVersion, datasetItemId: args.datasetItemId, value: args.value, dataType: args.dataType, status: args.status, explanation: args.explanation?.slice(0, 4000), latencyMs: args.latencyMs, costUsd: args.costUsd, error: args.error?.slice(0, 2000), createdAt: Date.now() });
    await ctx.db.insert("scores", { projectId: args.projectId, datasetItemId: args.datasetItemId, name: evaluator.name, value: args.value, dataType: args.dataType, source: evaluator.type === "llm_judge" ? "llm" : "code", comment: args.explanation?.slice(0, 4000), createdBy: "system", createdAt: Date.now() });
    await ctx.db.patch(args.jobId, { completedCount: job.completedCount + 1, failedCount: job.failedCount + (args.status === "failed" || args.status === "error" ? 1 : 0) });
    return resultId;
  },
});

export const createMonitor = mutation({
  args: { projectId: v.id("projects"), name: v.string(), evaluatorId: v.optional(v.id("evaluators")), scoreName: v.string(), aggregation: v.union(v.literal("failure_rate"), v.literal("average"), v.literal("count"), v.literal("categorical_rate")), threshold: v.number(), recoveryThreshold: v.optional(v.number()), windowMinutes: v.number(), minSamples: v.number(), severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")), groupBy: v.optional(v.union(v.literal("model"), v.literal("prompt_version"), v.literal("environment"), v.literal("tag"))) },
  handler: async (ctx, args) => {
    const { identity } = await getProject(ctx, args.projectId);
    if (!args.name.trim() || !args.scoreName.trim()) throw new Error("Monitor name and score are required");
    if (args.windowMinutes <= 0 || args.minSamples < 1) throw new Error("Monitor window and sample count must be positive");
    const now = Date.now();
    return ctx.db.insert("evaluationMonitors", { ...args, name: args.name.trim(), scoreName: args.scoreName.trim(), active: true, createdBy: identity.subject, createdAt: now, updatedAt: now });
  },
});

export const listMonitors = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return [];
    return ctx.db.query("evaluationMonitors").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).order("desc").take(100);
  },
});

export const setMonitorActive = mutation({
  args: { projectId: v.id("projects"), monitorId: v.id("evaluationMonitors"), active: v.boolean() },
  handler: async (ctx, args) => {
    await getProject(ctx, args.projectId);
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor || monitor.projectId !== args.projectId) throw new Error("Monitor not found");
    await ctx.db.patch(args.monitorId, { active: args.active, updatedAt: Date.now() });
  },
});

export const recordFeedback = mutation({
  args: { projectId: v.id("projects"), traceId: v.string(), spanId: v.optional(v.string()), kind: v.union(v.literal("thumb"), v.literal("star"), v.literal("text")), value: v.union(v.number(), v.boolean(), v.string()), scoreName: v.optional(v.string()), reason: v.optional(v.string()), comment: v.optional(v.string()), endUserId: v.optional(v.string()), dedupeKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getProject(ctx, args.projectId);
    if (!args.traceId.trim()) throw new Error("Trace ID is required");
    if (args.dedupeKey) {
      const existing = await ctx.db.query("evaluationFeedback").withIndex("by_dedupeKey", (q) => q.eq("dedupeKey", args.dedupeKey)).first();
      if (existing) return existing._id;
    }
    const feedbackId = await ctx.db.insert("evaluationFeedback", { ...args, traceId: args.traceId.trim(), spanId: args.spanId?.trim() || undefined, reason: args.reason?.trim() || undefined, comment: args.comment?.trim() || undefined, dedupeKey: args.dedupeKey?.trim() || undefined, createdAt: Date.now() });
    await ctx.db.insert("scores", { projectId: args.projectId, traceId: args.traceId.trim(), spanId: args.spanId?.trim() || undefined, name: args.scoreName?.trim() || (args.kind === "thumb" ? "user_thumbs" : args.kind === "star" ? "user_rating" : "user_feedback"), value: args.value, dataType: args.kind === "thumb" ? "boolean" : args.kind === "star" ? "numeric" : "text", source: "user", comment: args.comment?.trim() || args.reason?.trim() || undefined, createdBy: args.endUserId?.trim() || "user", createdAt: Date.now() });
    return feedbackId;
  },
});

export const recordApiFeedback = mutation({
  args: { projectId: v.id("projects"), internalSecret: v.string(), traceId: v.string(), spanId: v.optional(v.string()), kind: v.union(v.literal("thumb"), v.literal("star"), v.literal("text")), value: v.union(v.number(), v.boolean(), v.string()), dataType: v.optional(v.union(v.literal("numeric"), v.literal("boolean"), v.literal("categorical"), v.literal("text"))), scoreName: v.optional(v.string()), reason: v.optional(v.string()), comment: v.optional(v.string()), endUserId: v.optional(v.string()), dedupeKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!process.env.EVALUATION_INTERNAL_SECRET || args.internalSecret !== process.env.EVALUATION_INTERNAL_SECRET) throw new Error("Unauthorized");
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (!args.traceId.trim()) throw new Error("Trace ID is required");
    if (args.dedupeKey) {
      const existing = await ctx.db.query("evaluationFeedback").withIndex("by_dedupeKey", (q) => q.eq("dedupeKey", args.dedupeKey)).first();
      if (existing) return existing._id;
    }
    const now = Date.now();
    const feedbackId = await ctx.db.insert("evaluationFeedback", { projectId: args.projectId, traceId: args.traceId.trim(), spanId: args.spanId?.trim() || undefined, kind: args.kind, value: args.value, reason: args.reason?.trim() || undefined, comment: args.comment?.trim() || undefined, endUserId: args.endUserId?.trim() || undefined, dedupeKey: args.dedupeKey?.trim() || undefined, createdAt: now });
    const dataType = args.dataType ?? (args.kind === "thumb" ? "boolean" : args.kind === "star" ? "numeric" : "text");
    if ((dataType === "numeric" && typeof args.value !== "number") || (dataType === "boolean" && typeof args.value !== "boolean") || ((dataType === "categorical" || dataType === "text") && typeof args.value !== "string")) throw new Error("Score value does not match dataType");
    await ctx.db.insert("scores", { projectId: args.projectId, traceId: args.traceId.trim(), spanId: args.spanId?.trim() || undefined, name: args.scoreName?.trim() || (args.kind === "thumb" ? "user_thumbs" : args.kind === "star" ? "user_rating" : "user_feedback"), value: args.value, dataType, source: "user", comment: args.comment?.trim() || args.reason?.trim() || undefined, createdBy: args.endUserId?.trim() || "api", createdAt: now });
    return feedbackId;
  },
});

export const getExecutionBundle = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const evaluators = await ctx.db.query("evaluators").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).take(100);
    const active = evaluators.filter((evaluator) => evaluator.active);
    return Promise.all(active.map(async (evaluator) => {
      const version = await ctx.db.query("evaluatorVersions").withIndex("by_evaluatorId", (q) => q.eq("evaluatorId", evaluator._id)).order("desc").first();
      return version ? { evaluator, version } : null;
    })).then((items) => items.filter((item): item is NonNullable<typeof item> => item !== null));
  },
});

export const createOnlineJob = internalMutation({
  args: { projectId: v.id("projects"), traceId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("evaluationJobs").withIndex("by_traceId", (q) => q.eq("traceId", args.traceId)).first();
    if (existing && existing.projectId === args.projectId && existing.mode === "online") return existing._id;
    return ctx.db.insert("evaluationJobs", { projectId: args.projectId, mode: "online", status: "running", traceId: args.traceId, itemCount: 0, completedCount: 0, failedCount: 0, createdBy: "system", createdAt: Date.now() });
  },
});

export const persistExecutionResult = internalMutation({
  args: {
    projectId: v.id("projects"),
    jobId: v.id("evaluationJobs"),
    evaluatorId: v.id("evaluators"),
    evaluatorVersion: v.number(),
    traceId: v.string(),
    spanId: v.optional(v.string()),
    value: v.union(v.number(), v.boolean(), v.string()),
    dataType: v.union(v.literal("boolean"), v.literal("numeric"), v.literal("categorical"), v.literal("text")),
    status: v.union(v.literal("passed"), v.literal("failed"), v.literal("error"), v.literal("skipped")),
    explanation: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    costUsd: v.optional(v.number()),
    error: v.optional(v.string()),
    dedupeKey: v.string(),
  },
  handler: async (ctx, args) => {
    const duplicate = await ctx.db.query("evaluationResults").withIndex("by_dedupeKey", (q) => q.eq("dedupeKey", args.dedupeKey)).first();
    if (duplicate) return { resultId: duplicate._id, alerts: [] };
    const now = Date.now();
    const notifications: Array<{ projectId: Id<"projects">; runId: string; type: string; message: string; triggeredAt: string }> = [];
    const resultId = await ctx.db.insert("evaluationResults", { ...args, explanation: args.explanation?.slice(0, 4000), error: args.error?.slice(0, 2000), createdAt: now });
    const job = await ctx.db.get(args.jobId);
    if (job) await ctx.db.patch(args.jobId, { itemCount: Math.max(job.itemCount, job.completedCount + 1), completedCount: job.completedCount + 1, failedCount: job.failedCount + (args.status === "failed" || args.status === "error" ? 1 : 0), status: "completed", completedAt: now });
    const evaluator = await ctx.db.get(args.evaluatorId);
    await ctx.db.insert("scores", { projectId: args.projectId, traceId: args.traceId, spanId: args.spanId, name: evaluator?.name ?? "evaluation", value: args.value, dataType: args.dataType, source: evaluator?.type === "llm_judge" ? "llm" : "code", comment: args.explanation?.slice(0, 4000), createdBy: "system", createdAt: now });
    if (args.status === "failed" || args.status === "error") {
      const existingAnnotation = await ctx.db.query("annotations").withIndex("by_projectId_and_traceId", (q) => q.eq("projectId", args.projectId).eq("traceId", args.traceId)).first();
      if (!existingAnnotation) await ctx.db.insert("annotations", { projectId: args.projectId, traceId: args.traceId, spanId: args.spanId, status: "queued", label: evaluator?.name ?? "evaluation_failure", notes: args.explanation?.slice(0, 2000) || args.error?.slice(0, 2000), createdBy: "system", createdAt: now });
    }

    const monitors = await ctx.db.query("evaluationMonitors").withIndex("by_projectId_and_active", (q) => q.eq("projectId", args.projectId).eq("active", true)).take(100);
    const recentResults = await ctx.db.query("evaluationResults").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).order("desc").take(500);
    const evaluators = await ctx.db.query("evaluators").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).take(100);
    const evaluatorNames = new Map(evaluators.map((item) => [item._id, item.name]));
    for (const monitor of monitors) {
      if (monitor.evaluatorId && monitor.evaluatorId !== args.evaluatorId) continue;
      const windowStart = now - monitor.windowMinutes * 60_000;
      const matching = recentResults.filter((item) => item.createdAt >= windowStart && (!monitor.evaluatorId || item.evaluatorId === monitor.evaluatorId) && (!monitor.scoreName || evaluatorNames.get(item.evaluatorId) === monitor.scoreName));
      if (matching.length < monitor.minSamples) continue;
      const failedCount = matching.filter((item) => item.status === "failed" || item.status === "error").length;
      const numericValues = matching.map((item) => typeof item.value === "number" ? item.value : null).filter((value): value is number => value !== null);
      const measured = monitor.aggregation === "failure_rate" ? failedCount / matching.length : monitor.aggregation === "average" && numericValues.length ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length : monitor.aggregation === "count" ? failedCount : failedCount / matching.length;
      const breached = monitor.aggregation === "count" ? measured >= monitor.threshold : monitor.aggregation === "average" ? measured <= monitor.threshold : measured >= monitor.threshold;
      const prior = await ctx.db.query("evaluationMonitorState").withIndex("by_monitorId", (q) => q.eq("monitorId", monitor._id)).first();
      const stateId = prior?._id ?? await ctx.db.insert("evaluationMonitorState", { projectId: args.projectId, monitorId: monitor._id, breached, measured, sampleCount: matching.length, updatedAt: now });
      await ctx.db.replace(stateId, { projectId: args.projectId, monitorId: monitor._id, breached, measured, sampleCount: matching.length, updatedAt: now });
      const recoveryThreshold = monitor.recoveryThreshold ?? monitor.threshold;
      const recovered = monitor.aggregation === "average" ? measured >= recoveryThreshold : measured <= recoveryThreshold;
      if (!breached || recovered) {
        if (recovered && breached) await ctx.db.patch(stateId, { breached: false, measured, sampleCount: matching.length, updatedAt: now });
        if (prior?.breached && recovered) {
          const alert = { projectId: args.projectId, runId: `eval-monitor-recovery:${monitor._id}:${now}`, type: "evaluation_monitor_recovery", message: `${monitor.name} recovered at ${measured.toFixed(3)} with ${matching.length} samples.`, triggeredAt: new Date(now).toISOString() };
          await ctx.db.insert("alerts", alert);
          notifications.push(alert);
        }
        continue;
      }
      const bucket = Math.floor(now / (monitor.windowMinutes * 60_000));
      const runId = `eval-monitor:${monitor._id}:${bucket}`;
      const existingAlert = await ctx.db.query("alerts").withIndex("by_runId", (q) => q.eq("runId", runId)).first();
      if (!existingAlert) {
        const alert = { projectId: args.projectId, runId, type: "evaluation_monitor", message: `${monitor.name} crossed ${monitor.threshold} with ${matching.length} samples (${measured.toFixed(3)}).`, triggeredAt: new Date(now).toISOString() };
        await ctx.db.insert("alerts", alert);
        notifications.push(alert);
      }
    }
    return { resultId, alerts: notifications };
  },
});
