// Pure, deterministic fixture generator for the "explore" demo surface.
// No network calls, no Convex, no Tinybird — safe to import from a Client
// Component and run entirely in the browser or at build time.

import type { ExploreSpan, ExploreTrace, SpanKind, TraceStatus } from "@/components/dashboard/explore/types";

// Simple seeded PRNG (mulberry32) so the demo dataset is stable across
// reloads instead of re-randomizing every render.
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260913);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(min + rand() * (max - min + 1));
}

const MODELS = ["gpt-4o", "gpt-4o-mini", "claude-sonnet-4.5", "claude-haiku-4.5", "gemini-2.5-pro"] as const;
const USERS = ["user_alpha", "user_beta", "user_gamma", "team_ops", "internal_qa", "user_delta"] as const;
const TAG_POOL = ["prod", "staging", "canary", "eval", "support-bot", "research-agent", "checkout-flow", "high-priority"] as const;
const TRACE_NAMES = [
  "customer-support-triage",
  "research-summarizer",
  "invoice-reconciliation",
  "sql-agent-query",
  "web-search-and-synthesize",
  "code-review-assistant",
  "ticket-classification",
  "multi-step-planner",
  "rag-knowledge-lookup",
  "email-draft-agent",
] as const;

const SPAN_NAME_BY_KIND: Record<SpanKind, readonly string[]> = {
  generation: ["llm.generate", "chat.completion", "summarize.step", "draft.response"],
  tool: ["tool.call:calculator", "tool.call:calendar", "tool.call:send_email", "tool.call:crm_lookup"],
  retrieval: ["retriever.vector_search", "retriever.hybrid_search", "retriever.rerank"],
  chain: ["chain.sequential", "chain.router", "chain.map_reduce"],
  agent: ["agent.plan", "agent.reflect", "agent.act"],
  error: ["tool.call:payment_api", "llm.generate", "retriever.vector_search"],
};

let spanCounter = 0;
function nextSpanId(): string {
  spanCounter += 1;
  return `span_${spanCounter.toString(36)}`;
}

/**
 * Builds a randomized but plausible span tree for one trace, similar in
 * spirit to a Langfuse trace: a root agent/chain span fanning out into
 * generations, tool calls, and retrievals, with occasional nested children
 * and an occasional error leaf.
 */
function buildSpanTree(hasError: boolean): { spans: ExploreSpan[]; totalDurationMs: number; totalCostUsd: number; inputTokens: number; outputTokens: number } {
  let cursor = 0;
  let totalCostUsd = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  const makeSpan = (kind: SpanKind, depth: number, forceError = false): ExploreSpan => {
    const duration = kind === "generation" ? randInt(300, 4000) : kind === "retrieval" ? randInt(80, 900) : randInt(40, 1500);
    const start = cursor;
    cursor += randInt(0, 120); // slight overlap/stagger between siblings
    const isError = forceError;
    const span: ExploreSpan = {
      id: nextSpanId(),
      parentId: null,
      name: pick(SPAN_NAME_BY_KIND[kind]),
      kind: isError ? "error" : kind,
      startOffsetMs: start,
      durationMs: duration,
      status: isError ? "error" : "ok",
      children: [],
    };

    if (kind === "generation") {
      const inTok = randInt(120, 3200);
      const outTok = randInt(60, 1800);
      inputTokens += inTok;
      outputTokens += outTok;
      const cost = (inTok / 1000) * 0.005 + (outTok / 1000) * 0.015;
      totalCostUsd += cost;
      span.model = pick(MODELS);
      span.inputTokens = inTok;
      span.outputTokens = outTok;
      span.costUsd = Number(cost.toFixed(6));
    }

    // Nest a couple of children for chain/agent spans to build real depth.
    if (depth < 2 && (kind === "chain" || kind === "agent") && rand() > 0.35) {
      const childCount = randInt(1, 3);
      for (let i = 0; i < childCount; i += 1) {
        const childKind = pick(["generation", "tool", "retrieval", "generation"] as const);
        const child = makeSpan(childKind, depth + 1, forceError && i === childCount - 1 && rand() > 0.5);
        child.parentId = span.id;
        span.children.push(child);
      }
    }

    return span;
  };

  const root = makeSpan("agent", 0);
  const stepCount = randInt(2, 5);
  for (let i = 0; i < stepCount; i += 1) {
    const isLast = i === stepCount - 1;
    const kind = pick(["retrieval", "generation", "tool", "chain"] as const);
    const child = makeSpan(kind, 1, hasError && isLast);
    child.parentId = root.id;
    root.children.push(child);
  }

  const total = Math.max(cursor, root.durationMs, ...root.children.map((c) => c.startOffsetMs + c.durationMs));
  return { spans: [root], totalDurationMs: total, totalCostUsd, inputTokens, outputTokens };
}

const STATUS_WEIGHTS: Array<[TraceStatus, number]> = [
  ["success", 0.78],
  ["error", 0.14],
  ["running", 0.08],
];

function weightedStatus(): TraceStatus {
  const r = rand();
  let acc = 0;
  for (const [status, weight] of STATUS_WEIGHTS) {
    acc += weight;
    if (r <= acc) return status;
  }
  return "success";
}

export function generateDemoTraces(count = 120): ExploreTrace[] {
  const now = Date.now();
  const traces: ExploreTrace[] = [];

  for (let i = 0; i < count; i += 1) {
    const status = weightedStatus();
    const { spans, totalDurationMs, totalCostUsd, inputTokens, outputTokens } = buildSpanTree(status === "error");
    const tagCount = randInt(1, 3);
    const tags = Array.from(new Set(Array.from({ length: tagCount }, () => pick(TAG_POOL))));
    const startedAt = new Date(now - randInt(0, 30) * 86_400_000 - randInt(0, 86_400_000)).toISOString();

    traces.push({
      id: `trace_${(i + 1).toString(36).padStart(4, "0")}`,
      name: `${pick(TRACE_NAMES)}-${randInt(100, 999)}`,
      status,
      startedAt,
      durationMs: status === "running" ? Math.round(totalDurationMs * 0.6) : totalDurationMs,
      costUsd: Number(totalCostUsd.toFixed(6)),
      inputTokens,
      outputTokens,
      model: pick(MODELS),
      user: pick(USERS),
      tags,
      spans,
    });
  }

  return traces.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export const DEMO_MODELS = MODELS;
export const DEMO_TAGS = TAG_POOL;
