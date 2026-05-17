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

loadLocalEnv();

const apiKey = process.env.FIVETOONE_API_KEY;
const host = (process.env.FIVETOONE_HOST || "http://localhost:3000").replace(
  /\/$/,
  "",
);

if (!apiKey) {
  console.error("Missing FIVETOONE_API_KEY.");
  console.error('Run: $env:FIVETOONE_API_KEY="5t1r_sk_live_..."');
  process.exit(1);
}

const { FiveToOneClient, traceAgent } = await import("5to1r");

const client = new FiveToOneClient({ apiKey, host });
const runId = `user-test-${Date.now()}`;
process.env.FIVETOONE_CURRENT_RUN_ID = runId;

const agent = traceAgent(
  async (query) => {
    await client.ingest({
      runId,
      spanType: "decision",
      input: { query },
      output: "Use a tiny mock workflow to verify 5to1r ingestion.",
      latencyMs: 12,
      metadata: { test: true, source: "scratch/user-test-5to1r" },
    });

    await client.ingest({
      runId,
      spanType: "llm_call",
      input: query,
      output: "Mock model response from the user install test.",
      modelId: "mock-model",
      costUsd: 0.0001,
      latencyMs: 120,
      metadata: { test: true },
    });

    await client.ingest({
      runId,
      spanType: "tool_call",
      toolName: "mock_search",
      input: { q: query },
      output: { resultCount: 3 },
      latencyMs: 45,
      metadata: { test: true },
    });

    return "5to1r user test completed";
  },
  {
    apiKey,
    host,
  },
);

const result = await agent("Can 5to1r receive a test span?");
await new Promise((resolve) => setTimeout(resolve, 1500));

const response = await fetch(`${host}/api/ingest`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    runId,
    spanId: `${runId}-direct-check`,
    spanType: "decision",
    createdAt: new Date().toISOString(),
    input: "direct status check",
    output: "direct ingest request accepted",
    latencyMs: 1,
    costUsd: 0,
    metadata: { test: true, directCheck: true },
  }),
});

console.log(result);
console.log(`Ingest status: ${response.status} ${response.statusText}`);
console.log(`Ingest response: ${await response.text()}`);
console.log(`Sent test run: ${runId}`);
