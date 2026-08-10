import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const STATS_TTL_MS = 10 * 60 * 1000;
const STATS_STALE_MS = 24 * 60 * 60 * 1000;
const RUNNING_SPANS_TTL_MS = 30 * 1000;
const TERMINAL_SPANS_TTL_MS = 24 * 60 * 60 * 1000;
const MANUAL_REFRESH_COOLDOWN_MS = 30 * 1000;
const SOFT_DAILY_READ_LIMIT = 850;
const HARD_DAILY_READ_LIMIT = 980;

const modelCostValidator = v.object({
  modelId: v.string(),
  totalCostUsd: v.number(),
  spanCount: v.number(),
  avgLatencyMs: v.optional(v.number()),
});

const toolCostValidator = v.object({
  toolName: v.string(),
  totalCostUsd: v.number(),
  spanCount: v.number(),
  avgLatencyMs: v.optional(v.number()),
});

const userCostValidator = v.object({
  endUserId: v.string(),
  totalCostUsd: v.number(),
  totalTokens: v.number(),
  spanCount: v.number(),
  avgLatencyMs: v.optional(v.number()),
});

const dailyCostValidator = v.object({
  day: v.string(),
  totalCostUsd: v.number(),
  spanCount: v.number(),
});

const runStatusValidator = v.union(
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

const spanValidator = v.object({
  spanId: v.string(),
  runId: v.string(),
  projectId: v.string(),
  spanType: v.string(),
  input: v.string(),
  output: v.string(),
  attachments: v.optional(v.string()),
  latencyMs: v.number(),
  costUsd: v.number(),
  modelId: v.string(),
  toolName: v.string(),
  parentSpanId: v.string(),
  metadata: v.any(),
  inputTokens: v.optional(v.number()),
  outputTokens: v.optional(v.number()),
  ttftMs: v.optional(v.number()),
  retryCount: v.optional(v.number()),
  errorType: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
  isStreamChunk: v.optional(v.boolean()),
  streamSequence: v.optional(v.number()),
  streamFinal: v.optional(v.boolean()),
  payloadFormat: v.optional(v.string()),
  stackTrace: v.optional(v.string()),
  timedOut: v.optional(v.boolean()),
  timeoutMs: v.optional(v.number()),
  createdAt: v.string(),
});

function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

function getOrgId(identity: unknown) {
  const orgId = (identity as { orgId?: unknown }).orgId;
  return typeof orgId === "string" && orgId.length > 0 ? orgId : undefined;
}

function canAccessProject(
  project: Doc<"projects">,
  identity: { subject: string; tokenIdentifier: string },
) {
  const clerkOrgId = getOrgId(identity);
  if (clerkOrgId && project.clerkOrgId === clerkOrgId) return true;
  return project.clerkUserId === identity.subject;
}

async function requireProjectAccess(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const project = await ctx.db.get(projectId);
  if (!project || !canAccessProject(project, identity)) {
    throw new Error("Project not found or access denied");
  }

  return { identity, project };
}

function statsPayload(cache: Doc<"analyticsStatsCache"> | null) {
  if (!cache) return null;
  const ageMs = Date.now() - cache.updatedAt;
  return {
    dailyCosts: cache.dailyCosts,
    modelCosts: cache.modelCosts,
    toolCosts: cache.toolCosts ?? [],
    userCosts: cache.userCosts ?? [],
    meta: {
      source: cache.source,
      cacheStatus: ageMs <= STATS_TTL_MS ? "fresh" : "stale",
      updatedAt: cache.updatedAt,
      ageMs,
    },
  };
}

export const getStatsCache = query({
  args: {
    projectId: v.id("projects"),
    rangeDays: v.number(),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    const cache = await ctx.db
      .query("analyticsStatsCache")
      .withIndex("by_projectId_and_rangeDays", (q) =>
        q.eq("projectId", args.projectId).eq("rangeDays", args.rangeDays),
      )
      .unique();

    return statsPayload(cache);
  },
});

export const reserveStatsRefresh = mutation({
  args: {
    projectId: v.id("projects"),
    rangeDays: v.number(),
    refresh: v.union(v.literal("normal"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    const now = Date.now();
    const cache = await ctx.db
      .query("analyticsStatsCache")
      .withIndex("by_projectId_and_rangeDays", (q) =>
        q.eq("projectId", args.projectId).eq("rangeDays", args.rangeDays),
      )
      .unique();
    const cached = statsPayload(cache);
    const ageMs = cache ? now - cache.updatedAt : Number.POSITIVE_INFINITY;

    if (args.refresh === "normal" && cache && ageMs <= STATS_TTL_MS) {
      return { allowed: false, reason: "cache_fresh", cache: cached };
    }

    if (
      args.refresh === "manual" &&
      cache?.lastManualRefreshAt &&
      now - cache.lastManualRefreshAt < MANUAL_REFRESH_COOLDOWN_MS
    ) {
      return { allowed: false, reason: "rate_limited", cache: cached };
    }

    const budget = await ctx.db
      .query("tinybirdReadBudget")
      .withIndex("by_day", (q) => q.eq("day", dayKey(now)))
      .unique();
    const readCount = budget?.readCount ?? 0;
    const nextReadCount = readCount + 3;

    if (nextReadCount >= HARD_DAILY_READ_LIMIT) {
      return { allowed: false, reason: "budget_hard_limit", cache: cached };
    }

    if (args.refresh === "manual" && nextReadCount >= SOFT_DAILY_READ_LIMIT) {
      return { allowed: false, reason: "budget_low", cache: cached };
    }

    if (budget) {
      await ctx.db.patch(budget._id, {
        readCount: nextReadCount,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("tinybirdReadBudget", {
        day: dayKey(now),
        readCount: nextReadCount,
        updatedAt: now,
      });
    }

    if (args.refresh === "manual" && cache) {
      await ctx.db.patch(cache._id, { lastManualRefreshAt: now });
    }

    return {
      allowed: true,
      reason: nextReadCount >= SOFT_DAILY_READ_LIMIT ? "budget_low" : null,
      cache: cached,
    };
  },
});

export const upsertStatsCache = mutation({
  args: {
    projectId: v.id("projects"),
    rangeDays: v.number(),
    dailyCosts: v.array(dailyCostValidator),
    modelCosts: v.array(modelCostValidator),
    toolCosts: v.optional(v.array(toolCostValidator)),
    userCosts: v.optional(v.array(userCostValidator)),
    refresh: v.union(v.literal("normal"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    const now = Date.now();
    const existing = await ctx.db
      .query("analyticsStatsCache")
      .withIndex("by_projectId_and_rangeDays", (q) =>
        q.eq("projectId", args.projectId).eq("rangeDays", args.rangeDays),
      )
      .unique();

    const patch = {
      dailyCosts: args.dailyCosts,
      modelCosts: args.modelCosts,
      toolCosts: args.toolCosts ?? [],
      userCosts: args.userCosts ?? [],
      updatedAt: now,
      source: "tinybird",
      lastManualRefreshAt:
        args.refresh === "manual" ? now : existing?.lastManualRefreshAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("analyticsStatsCache", {
        projectId: args.projectId,
        rangeDays: args.rangeDays,
        ...patch,
      });
    }

    return {
      dailyCosts: args.dailyCosts,
      modelCosts: args.modelCosts,
      toolCosts: args.toolCosts ?? [],
      userCosts: args.userCosts ?? [],
      meta: {
        source: "tinybird",
        cacheStatus: "fresh",
        updatedAt: now,
        ageMs: 0,
      },
    };
  },
});

function spansPayload(cache: Doc<"runSpanCache"> | null) {
  if (!cache) return null;
  const ageMs = Date.now() - cache.updatedAt;
  return {
    spans: cache.spans,
    meta: {
      source: cache.source,
      cacheStatus: ageMs <= RUNNING_SPANS_TTL_MS ? "fresh" : "stale",
      updatedAt: cache.updatedAt,
      ageMs,
    },
  };
}

export const getRunSpanCache = query({
  args: {
    projectId: v.id("projects"),
    runId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);
    const cache = await ctx.db
      .query("runSpanCache")
      .withIndex("by_projectId_and_runId", (q) =>
        q.eq("projectId", args.projectId).eq("runId", args.runId),
      )
      .unique();
    return spansPayload(cache);
  },
});

export const reserveRunSpanRefresh = mutation({
  args: {
    projectId: v.id("projects"),
    runId: v.string(),
    runStatus: runStatusValidator,
    refresh: v.union(v.literal("normal"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    const now = Date.now();
    const cache = await ctx.db
      .query("runSpanCache")
      .withIndex("by_projectId_and_runId", (q) =>
        q.eq("projectId", args.projectId).eq("runId", args.runId),
      )
      .unique();
    const cached = spansPayload(cache);
    const ageMs = cache ? now - cache.updatedAt : Number.POSITIVE_INFINITY;
    const ttl =
      args.runStatus === "running" ? RUNNING_SPANS_TTL_MS : TERMINAL_SPANS_TTL_MS;

    if (args.refresh === "normal" && cache && ageMs <= ttl) {
      return { allowed: false, reason: "cache_fresh", cache: cached };
    }

    if (
      args.refresh === "normal" &&
      args.runStatus === "running" &&
      cache &&
      ageMs <= STATS_STALE_MS
    ) {
      return { allowed: false, reason: "running_manual_only", cache: cached };
    }

    if (
      args.refresh === "manual" &&
      cache?.lastManualRefreshAt &&
      now - cache.lastManualRefreshAt < MANUAL_REFRESH_COOLDOWN_MS
    ) {
      return { allowed: false, reason: "rate_limited", cache: cached };
    }

    const budget = await ctx.db
      .query("tinybirdReadBudget")
      .withIndex("by_day", (q) => q.eq("day", dayKey(now)))
      .unique();
    const readCount = budget?.readCount ?? 0;
    const nextReadCount = readCount + 1;

    if (nextReadCount >= HARD_DAILY_READ_LIMIT) {
      return { allowed: false, reason: "budget_hard_limit", cache: cached };
    }

    if (args.refresh === "manual" && nextReadCount >= SOFT_DAILY_READ_LIMIT) {
      return { allowed: false, reason: "budget_low", cache: cached };
    }

    if (budget) {
      await ctx.db.patch(budget._id, {
        readCount: nextReadCount,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("tinybirdReadBudget", {
        day: dayKey(now),
        readCount: nextReadCount,
        updatedAt: now,
      });
    }

    if (args.refresh === "manual" && cache) {
      await ctx.db.patch(cache._id, { lastManualRefreshAt: now });
    }

    return { allowed: true, reason: null, cache: cached };
  },
});

export const upsertRunSpanCache = mutation({
  args: {
    projectId: v.id("projects"),
    runId: v.string(),
    runStatus: runStatusValidator,
    spans: v.array(spanValidator),
    refresh: v.union(v.literal("normal"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    const now = Date.now();
    const existing = await ctx.db
      .query("runSpanCache")
      .withIndex("by_projectId_and_runId", (q) =>
        q.eq("projectId", args.projectId).eq("runId", args.runId),
      )
      .unique();

    const patch = {
      spans: args.spans,
      runStatus: args.runStatus,
      updatedAt: now,
      source: "tinybird",
      lastManualRefreshAt:
        args.refresh === "manual" ? now : existing?.lastManualRefreshAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("runSpanCache", {
        projectId: args.projectId,
        runId: args.runId,
        ...patch,
      });
    }

    return {
      spans: args.spans,
      meta: {
        source: "tinybird",
        cacheStatus: "fresh",
        updatedAt: now,
        ageMs: 0,
      },
    };
  },
});
