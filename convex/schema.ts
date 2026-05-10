import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    clerkOrgId: v.string(),
    // Prefixed with '5t1r_' for easy identification
    apiKey: v.string(),
  })
    .index("by_clerkOrgId", ["clerkOrgId"])
    .index("by_apiKey", ["apiKey"]),

  agentRuns: defineTable({
    runId: v.string(),
    status: v.string(), // 'running' | 'completed' | 'failed'
    totalCostUsd: v.number(), // float with 6 decimal places
    spanCount: v.number(),
    startedAt: v.string(), // ISO 8601 UTC
    finishedAt: v.optional(v.string()), // ISO 8601 UTC
    projectId: v.id("projects"),
  })
    .index("by_projectId", ["projectId"])
    .index("by_runId", ["runId"])
    .index("by_projectId_startedAt", ["projectId", "startedAt"]),

  alerts: defineTable({
    runId: v.string(),
    type: v.string(), // 'run_failed' | 'cost_exceeded' | 'duration_exceeded'
    message: v.string(),
    triggeredAt: v.string(), // ISO 8601 UTC
    projectId: v.id("projects"),
  })
    .index("by_projectId", ["projectId"])
    .index("by_runId", ["runId"]),
});
