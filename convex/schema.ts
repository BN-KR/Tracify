import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    slug: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    clerkOrgId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    planTier: v.optional(v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("team"),
      v.literal("enterprise"),
    )),
    apiKeyPrefix: v.optional(v.string()),
    apiKeyLast4: v.optional(v.string()),
    apiKeyHash: v.optional(v.string()),
    apiKeyStatus: v.optional(v.union(v.literal("active"), v.literal("revoked"))),
    apiKeyCreatedAt: v.optional(v.number()),
    apiKeyLastUsedAt: v.optional(v.number()),
    costThresholdUsd: v.optional(v.number()),
    maxDurationSeconds: v.optional(v.number()),
    maxStallMinutes: v.optional(v.number()),
    apiKey: v.optional(v.string()),
    slackWebhookUrl: v.optional(v.string()),
  })
    .index("by_clerkOrgId", ["clerkOrgId"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_slug", ["slug"])
    .index("by_apiKeyHash", ["apiKeyHash"]),

  agentRuns: defineTable({
    runId: v.string(),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    spanCount: v.number(),
    totalCostUsd: v.number(),
    startedAt: v.string(),
    finishedAt: v.optional(v.string()),
    lastSpanAt: v.optional(v.string()),
    primaryModel: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    projectId: v.id("projects"),
  })
    .index("by_projectId", ["projectId"])
    .index("by_runId", ["runId"])
    .index("by_projectId_and_runId", ["projectId", "runId"])
    .index("by_projectId_startedAt", ["projectId", "startedAt"])
    .index("by_projectId_createdAt", ["projectId", "createdAt"])
    .index("by_projectId_status", ["projectId", "status"]),

  alerts: defineTable({
    runId: v.string(),
    type: v.string(), // 'run_failed' | 'cost_exceeded' | 'duration_exceeded'
    message: v.string(),
    triggeredAt: v.string(), // ISO 8601 UTC
    projectId: v.id("projects"),
  })
    .index("by_projectId", ["projectId"])
    .index("by_runId", ["runId"]),

  comments: defineTable({
    spanId: v.string(), // Tinybird spanId
    projectId: v.id("projects"),
    runId: v.string(),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_spanId", ["spanId"])
    .index("by_runId", ["runId"])
    .index("by_projectId", ["projectId"]),
});
