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
  const runId = `seed-${config.kind}-${config.daysAgo}d-${config.index}-${Date.now()}`;
  const baseTime = config.createdAt;
  const models = config.models;

  const spans = [
    {
      spanId: `${runId}-plan`,
      spanType: "decision",
      input: { task: config.task },
      output: { plan: ["inspect", "retrieve", "reason", "act", "summarize"] },
      modelId: models[0],
      latencyMs: 600 + config.index * 90,
      costUsd: money(config.cost * 0.04),
      metadata: { seed: true, phase: "planning", kind: config.kind },
    },
    {
      spanId: `${runId}-retrieve`,
      spanType: "tool_call",
      toolName: "knowledge_search",
      input: { q: config.task },
      output: { matches: 8 + config.index, source: "internal_docs" },
      latencyMs: 180 + config.index * 30,
      costUsd: 0,
      metadata: { seed: true, phase: "retrieval", kind: config.kind },
    },
    {
      spanId: `${runId}-reason`,
      spanType: "llm_call",
      input: { task: "reason through candidate actions", complexity: config.kind },
      output: { confidence: config.confidence, selectedPath: config.action },
      modelId: models[1],
      latencyMs: 2200 + config.index * 700,
      costUsd: money(config.cost * 0.42),
      metadata: { seed: true, phase: "reasoning", kind: config.kind },
    },
    {
      spanId: `${runId}-tool-action`,
      spanType: "tool_call",
      toolName: config.tool,
      input: { action: config.action },
      output: { ok: config.status !== "failed", changed: config.status !== "failed" },
      latencyMs: 260 + config.index * 45,
      costUsd: 0,
      metadata: { seed: true, phase: "action", kind: config.kind },
    },
    {
      spanId: `${runId}-summary`,
      spanType: "llm_call",
      input: { task: "summarize result for operator" },
      output: { summary: config.summary },
      modelId: models[2],
      latencyMs: 1500 + config.index * 320,
      costUsd: money(config.cost * 0.18),
      metadata: { seed: true, phase: "summary", kind: config.kind },
    },
    {
      spanId: `${runId}-end`,
      spanType: config.status === "failed" ? "error" : "run_end",
      input: config.task,
      output:
        config.status === "failed"
          ? "Workflow failed after tool action."
          : "Workflow completed and saved.",
      modelId: models[2],
      latencyMs: 600 + config.index * 120,
      costUsd: money(config.cost * 0.36),
      metadata: { seed: true, phase: "complete", kind: config.kind },
    },
  ];

  for (const [offset, span] of spans.entries()) {
    await ingest(host, apiKey, {
      runId,
      createdAt: new Date(new Date(baseTime).getTime() + offset * 45_000).toISOString(),
      ...span,
    });
    await wait(90);
  }

  return { runId, spanCount: spans.length, costUsd: money(config.cost) };
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

const templates = [
  {
    kind: "support-triage",
    task: "Classify support tickets and draft safe replies.",
    action: "draft_customer_reply",
    tool: "ticket_router",
    summary: "Ticket classified, routed, and response drafted.",
    models: ["claude-3-5-sonnet-latest", "gpt-5.5", "claude-3-5-sonnet-latest"],
  },
  {
    kind: "code-review",
    task: "Review a pull request for regressions and risky changes.",
    action: "open_review_comments",
    tool: "repo_diff_reader",
    summary: "Review comments produced with risk tags.",
    models: ["gpt-5.5", "claude-3-opus-latest", "gpt-5.5"],
  },
  {
    kind: "research-agent",
    task: "Research competitors and produce product positioning notes.",
    action: "save_research_brief",
    tool: "web_research",
    summary: "Research brief saved with citations and gaps.",
    models: ["claude-3-5-sonnet-latest", "claude-3-opus-latest", "gpt-5.5"],
  },
];

const created = [];

for (let daysAgo = 13; daysAgo >= 1; daysAgo -= 1) {
  const runsToday = daysAgo % 4 === 0 ? 3 : daysAgo % 3 === 0 ? 2 : 1;
  for (let index = 0; index < runsToday; index += 1) {
    const template = templates[(daysAgo + index) % templates.length];
    const trafficShape = 1 + (14 - daysAgo) * 0.11;
    const incidentSpike = daysAgo === 3 || daysAgo === 9 ? 2.7 : 1;
    const cost = money((0.42 + index * 0.38 + (daysAgo % 5) * 0.18) * trafficShape * incidentSpike);
    const status = daysAgo === 5 && index === 0 ? "failed" : "completed";

    created.push(
      await sendRun(host, apiKey, {
        ...template,
        daysAgo,
        index,
        status,
        cost,
        confidence: money(0.7 + ((daysAgo + index) % 20) / 100),
        createdAt: isoDaysAgo(daysAgo, 9 + index * 3, 15 + daysAgo),
      }),
    );
  }
}

await wait(2500);

const totalCost = created.reduce((sum, run) => sum + run.costUsd, 0);
const totalSpans = created.reduce((sum, run) => sum + run.spanCount, 0);

console.log("Historical seed completed");
console.log(`Runs: ${created.length}`);
console.log(`Spans: ${totalSpans}`);
console.log(`Approx cost: $${totalCost.toFixed(4)}`);
console.log(`First run: ${created[0]?.runId}`);
console.log(`Last run: ${created.at(-1)?.runId}`);
