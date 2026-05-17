import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadLocalEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    process.env[key] ??= value.replace(/^"|"$/g, "");
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function send(client, span) {
  await client.ingest({
    createdAt: new Date().toISOString(),
    latencyMs: 1,
    costUsd: 0,
    ...span,
  });
  await wait(250);
}

loadLocalEnv();

const { FiveToOneClient } = await import("5to1r");

const apiKey = process.env.FIVETOONE_API_KEY;
const host = (process.env.FIVETOONE_HOST || "http://localhost:3000").replace(
  /\/$/,
  "",
);

if (!apiKey) {
  console.error("Missing FIVETOONE_API_KEY.");
  process.exit(1);
}

const client = new FiveToOneClient({ apiKey, host });
const runId = `agentic-workflow-${Date.now()}`;
const query =
  "Design a production incident response plan for a complex AI agent outage.";

await send(client, {
  runId,
  spanId: `${runId}-plan`,
  spanType: "decision",
  input: { query },
  output: {
    plan: [
      "Triage incident signals",
      "Gather prior traces and customer impact",
      "Ask a senior reasoning model for root-cause hypotheses",
      "Run policy and rollback analysis",
      "Compare mitigation options",
      "Write executive summary and operator checklist",
    ],
  },
  modelId: "claude-3-5-sonnet-latest",
  latencyMs: 680,
  costUsd: 0.018,
  metadata: { phase: "planning", agent: "incident-commander-agent" },
});

await send(client, {
  runId,
  spanId: `${runId}-tool-fetch-traces`,
  spanType: "tool_call",
  toolName: "trace_search",
  input: {
    project: "checkout-agent",
    filter: "errors in last 45 minutes",
  },
  output: {
    matches: 18,
    topSymptoms: [
      "tool timeout after retrieval",
      "retry loop in payment validation",
      "token usage spike on fallback path",
    ],
  },
  latencyMs: 340,
  costUsd: 0,
  metadata: { phase: "triage" },
});

await send(client, {
  runId,
  spanId: `${runId}-opus-root-cause`,
  spanType: "llm_call",
  input: {
    task: "Analyze traces and produce root-cause hypotheses.",
    symptoms: [
      "retrieval timeout",
      "validation retry loop",
      "fallback prompt expansion",
    ],
  },
  output: {
    hypotheses: [
      "Vector store latency caused tool timeout.",
      "Retry policy treated validation timeout as user-correctable.",
      "Fallback prompt included full conversation state repeatedly.",
    ],
    confidence: 0.82,
  },
  modelId: "claude-3-opus-latest",
  latencyMs: 11840,
  costUsd: 0.42,
  metadata: { phase: "deep_reasoning", vendor: "anthropic" },
});

await send(client, {
  runId,
  spanId: `${runId}-gpt55-policy-review`,
  spanType: "llm_call",
  input: {
    task: "Check mitigation plan against reliability and customer-impact policy.",
    candidatePlan:
      "Disable retry loop, cap fallback context, route high-value requests to manual review.",
  },
  output: {
    allowed: true,
    requiredChanges: [
      "Add rollback owner",
      "Add customer-facing status page update",
      "Keep audit log for manual review routing",
    ],
  },
  modelId: "gpt-5.5",
  latencyMs: 9300,
  costUsd: 0.31,
  metadata: { phase: "policy_review", vendor: "openai" },
});

await send(client, {
  runId,
  spanId: `${runId}-tool-cost-impact`,
  spanType: "tool_call",
  toolName: "cost_forecast",
  input: {
    currentTokensPerMinute: 820000,
    retryMultiplier: 3.8,
    fallbackModel: "claude-3-opus-latest",
  },
  output: {
    projectedHourlyWasteUsd: 284.5,
    savingsIfMitigatedUsd: 241.9,
    confidence: 0.76,
  },
  latencyMs: 220,
  costUsd: 0,
  metadata: { phase: "cost_analysis" },
});

await send(client, {
  runId,
  spanId: `${runId}-sonnet-runbook`,
  spanType: "llm_call",
  input: {
    task: "Draft operator runbook from approved mitigation plan.",
    audience: "on-call engineer",
  },
  output: {
    runbook: [
      "Disable payment-validation retries above one attempt.",
      "Set fallback max context window to last 8 messages.",
      "Enable degraded checkout banner.",
      "Watch error rate, p95 latency, and hourly model cost for 30 minutes.",
    ],
  },
  modelId: "claude-3-5-sonnet-latest",
  latencyMs: 5600,
  costUsd: 0.12,
  metadata: { phase: "runbook_generation", vendor: "anthropic" },
});

await send(client, {
  runId,
  spanId: `${runId}-tool-rollback-sim`,
  spanType: "tool_call",
  toolName: "rollback_simulator",
  input: {
    changes: ["retry_limit", "fallback_context_cap", "manual_review_route"],
  },
  output: {
    expectedRecoveryMinutes: 14,
    rollbackRisk: "low",
    residualRisk: "medium",
  },
  latencyMs: 410,
  costUsd: 0,
  metadata: { phase: "simulation" },
});

await send(client, {
  runId,
  spanId: `${runId}-gpt55-exec-summary`,
  spanType: "llm_call",
  input: {
    task: "Write concise executive incident summary.",
    constraints: ["no blame", "include cost impact", "include ETA"],
  },
  output: {
    summary:
      "Checkout agent degradation is likely caused by retrieval timeouts amplified by retry and fallback-context behavior. Mitigation is underway with a 15-minute recovery target and projected waste reduction of roughly $240/hour.",
  },
  modelId: "gpt-5.5",
  latencyMs: 7600,
  costUsd: 0.27,
  metadata: { phase: "communication", vendor: "openai" },
});

await send(client, {
  runId,
  spanId: `${runId}-decision-final`,
  spanType: "decision",
  input: {
    candidates: [
      "rollback full checkout agent",
      "disable retries and cap fallback context",
      "route all requests to manual review",
    ],
  },
  output: {
    recommendation: "disable retries and cap fallback context",
    reason:
      "Fastest recovery with lowest customer disruption and strong cost reduction.",
  },
  modelId: "claude-3-opus-latest",
  latencyMs: 3900,
  costUsd: 0.075,
  metadata: { phase: "final_decision", agent: "incident-commander-agent" },
});

await send(client, {
  runId,
  spanId: `${runId}-run-end`,
  spanType: "run_end",
  input: query,
  output:
    "Recommendation: disable retry amplification, cap fallback context, publish degraded-mode status, and monitor recovery for 30 minutes.",
  modelId: "claude-3-5-sonnet-latest",
  latencyMs: 38290,
  costUsd: 1.213,
  metadata: { agent: "incident-commander-agent", result: "completed" },
});

await wait(1500);

console.log("Agentic workflow completed");
console.log(`Run ID: ${runId}`);
