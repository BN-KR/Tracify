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

function isoDaysAgo(daysAgo, hour, minute) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function money(value) {
  return Number(value.toFixed(4));
}

async function ingest(host, apiKey, span) {
  const res = await fetch(`${host}/api/ingest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(span),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body}`);
  }
}

async function sendRun(host, apiKey, config) {
  const runId = `savings-${config.phase}-${config.daysAgo}d-${config.index}-${Date.now()}`;
  const createdAt = config.createdAt;
  const spans = [
    {
      spanId: `${runId}-plan`,
      spanType: "decision",
      input: { objective: config.objective },
      output: {
        phase: config.phase,
        expectedSavingsUsd: config.expectedSavingsUsd,
      },
      modelId: config.model,
      latencyMs: config.latencyMs * 0.12,
      costUsd: money(config.costUsd * 0.08),
      metadata: { seed: true, savingsDemo: true, phase: "plan" },
    },
    {
      spanId: `${runId}-llm-primary`,
      spanType: "llm_call",
      input: {
        task: config.objective,
        promptTokens: config.promptTokens,
      },
      output: {
        result: config.result,
        completionTokens: config.completionTokens,
      },
      modelId: config.model,
      latencyMs: config.latencyMs * 0.48,
      costUsd: money(config.costUsd * 0.52),
      metadata: { seed: true, savingsDemo: true, phase: "primary_model" },
    },
    {
      spanId: `${runId}-tool-cache`,
      spanType: "tool_call",
      toolName: config.tool,
      input: { cacheHitRate: config.cacheHitRate },
      output: { optimized: config.phase === "optimized", savedUsd: config.expectedSavingsUsd },
      latencyMs: config.latencyMs * 0.1,
      costUsd: 0,
      metadata: { seed: true, savingsDemo: true, phase: "optimization" },
    },
    {
      spanId: `${runId}-run-end`,
      spanType: "run_end",
      input: config.objective,
      output: config.result,
      modelId: config.model,
      latencyMs: config.latencyMs * 0.3,
      costUsd: money(config.costUsd * 0.4),
      metadata: { seed: true, savingsDemo: true, phase: "complete" },
    },
  ];

  for (const [offset, span] of spans.entries()) {
    await ingest(host, apiKey, {
      runId,
      createdAt: new Date(new Date(createdAt).getTime() + offset * 60_000).toISOString(),
      ...span,
    });
    await wait(80);
  }

  return { runId, costUsd: config.costUsd, spanCount: spans.length };
}

loadLocalEnv();

const apiKey = process.env.FIVETOONE_API_KEY;
const host = (process.env.FIVETOONE_HOST || "http://localhost:3000").replace(
  /\/$/,
  "",
);

if (!apiKey) {
  console.error("Missing FIVETOONE_API_KEY.");
  process.exit(1);
}

const days = [
  { daysAgo: 6, phase: "unoptimized", runCount: 5, baseCost: 8.7 },
  { daysAgo: 5, phase: "unoptimized", runCount: 6, baseCost: 9.4 },
  { daysAgo: 4, phase: "unoptimized", runCount: 5, baseCost: 7.9 },
  { daysAgo: 3, phase: "optimized", runCount: 5, baseCost: 3.2 },
  { daysAgo: 2, phase: "optimized", runCount: 4, baseCost: 2.4 },
  { daysAgo: 1, phase: "optimized", runCount: 4, baseCost: 1.8 },
  { daysAgo: 0, phase: "optimized", runCount: 3, baseCost: 1.4 },
];

const created = [];

for (const day of days) {
  for (let index = 0; index < day.runCount; index += 1) {
    const unoptimized = day.phase === "unoptimized";
    const model = unoptimized
      ? index % 2 === 0
        ? "claude-3-opus-latest"
        : "gpt-5.5"
      : index % 2 === 0
        ? "claude-3-5-sonnet-latest"
        : "gpt-5.5-mini";
    const costUsd = money(day.baseCost + index * (unoptimized ? 0.95 : 0.22));

    created.push(
      await sendRun(host, apiKey, {
        daysAgo: day.daysAgo,
        index,
        phase: day.phase,
        model,
        costUsd,
        expectedSavingsUsd: money(unoptimized ? 0 : 6.8 + index * 0.7),
        objective: unoptimized
          ? "Run customer issue analysis with full-context expensive reasoning."
          : "Run customer issue analysis with cache, routing, and prompt compression.",
        result: unoptimized
          ? "Completed with high token usage and expensive fallback reasoning."
          : "Completed with compressed context and lower model cost.",
        tool: unoptimized ? "full_context_loader" : "prompt_compressor",
        promptTokens: unoptimized ? 128000 + index * 8000 : 28000 + index * 2500,
        completionTokens: unoptimized ? 18000 + index * 1200 : 6200 + index * 500,
        latencyMs: unoptimized ? 12400 + index * 1300 : 4300 + index * 360,
        cacheHitRate: unoptimized ? 0.08 : 0.74 + index * 0.03,
        createdAt: isoDaysAgo(day.daysAgo, 8 + index * 2, 10 + day.daysAgo),
      }),
    );
  }
}

await wait(2500);

const totalCost = created.reduce((sum, run) => sum + run.costUsd, 0);
const totalSpans = created.reduce((sum, run) => sum + run.spanCount, 0);

console.log("Savings demo seed completed");
console.log(`Runs: ${created.length}`);
console.log(`Spans: ${totalSpans}`);
console.log(`Approx cost: $${totalCost.toFixed(2)}`);
console.log(`First run: ${created[0]?.runId}`);
console.log(`Last run: ${created.at(-1)?.runId}`);
