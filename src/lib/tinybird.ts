/**
 * Tinybird REST API client.
 * All span analytics queries go through here — never Convex.
 */

const TINYBIRD_HOST = process.env.TINYBIRD_HOST ?? "https://api.tinybird.co";
const TINYBIRD_TOKEN = process.env.TINYBIRD_TOKEN;

function sqlUrl(sql: string) {
  const params = new URLSearchParams({
    q: `${sql.trimEnd()}\nFORMAT JSON`,
  });
  return `${TINYBIRD_HOST}/v0/sql?${params.toString()}`;
}

function getHeaders() {
  if (!TINYBIRD_TOKEN) throw new Error("TINYBIRD_TOKEN is not set");
  return {
    Authorization: `Bearer ${TINYBIRD_TOKEN}`,
    "Content-Type": "application/json",
  };
}

/**
 * Ingest a single span row into the Tinybird `spans` datasource.
 */
export async function ingestSpan(span: {
  spanId: string;
  runId: string;
  projectId: string;
  spanType: string;
  input: string;
  output: string;
  latencyMs: number;
  costUsd: number;
  modelId: string;
  toolName: string;
  parentSpanId: string;
  metadata: Record<string, unknown>;
  createdAt: string; // ISO 8601 UTC
}) {
  const ndjson = JSON.stringify(span) + "\n";
  const res = await fetch(`${TINYBIRD_HOST}/v0/events?name=spans`, {
    method: "POST",
    headers: getHeaders(),
    body: ndjson,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird ingest failed: ${res.status} ${body}`);
  }
  return res.json();
}

/**
 * Query spans for a specific run from Tinybird.
 */
export async function getSpansForRun(runId: string, projectId: string) {
  const sql =
    `SELECT * FROM spans WHERE runId = '${runId}' AND projectId = '${projectId}' ORDER BY createdAt ASC`
  const res = await fetch(sqlUrl(sql), {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird query failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.data as SpanRow[];
}

/**
 * Aggregate cost per day for a project.
 */
export async function getDailyCosts(projectId: string, days = 30) {
  const sql = `
    SELECT
      toDate(createdAt) AS day,
      sum(costUsd)      AS totalCostUsd,
      count()           AS spanCount
    FROM spans
    WHERE projectId = '${projectId}'
      AND createdAt >= now() - INTERVAL ${days} DAY
    GROUP BY day
    ORDER BY day ASC
  `;
  const res = await fetch(sqlUrl(sql), {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird query failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.data as { day: string; totalCostUsd: number; spanCount: number }[];
}

/**
 * Get per-model cost breakdown for a project.
 */
export async function getCostByModel(projectId: string, days = 30) {
  const sql = `
    SELECT
      modelId,
      sum(costUsd)   AS totalCostUsd,
      count()        AS spanCount,
      avg(latencyMs) AS avgLatencyMs
    FROM spans
    WHERE projectId = '${projectId}'
      AND spanType = 'llm_call'
      AND createdAt >= now() - INTERVAL ${days} DAY
    GROUP BY modelId
    ORDER BY totalCostUsd DESC
  `;
  const res = await fetch(sqlUrl(sql), {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird query failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.data as { modelId: string; totalCostUsd: number; spanCount: number; avgLatencyMs: number }[];
}

/**
 * Get per-tool cost and latency breakdown for a project.
 */
export async function getCostByTool(projectId: string, days = 30) {
  const sql = `
    SELECT
      toolName,
      sum(costUsd)   AS totalCostUsd,
      count()        AS spanCount,
      avg(latencyMs) AS avgLatencyMs
    FROM spans
    WHERE projectId = '${projectId}'
      AND toolName != ''
      AND createdAt >= now() - INTERVAL ${days} DAY
    GROUP BY toolName
    ORDER BY totalCostUsd DESC
    LIMIT 10
  `;
  const res = await fetch(sqlUrl(sql), {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird query failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.data as { toolName: string; totalCostUsd: number; spanCount: number; avgLatencyMs: number }[];
}

export interface SpanRow {
  spanId: string;
  runId: string;
  projectId: string;
  spanType: string;
  input: string;
  output: string;
  latencyMs: number;
  costUsd: number;
  modelId: string;
  toolName: string;
  parentSpanId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
