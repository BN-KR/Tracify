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

function sqlString(value: string) {
  return value.replace(/'/g, "''");
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
  attachments: string;
  latencyMs: number;
  costUsd: number;
  modelId: string;
  toolName: string;
  parentSpanId: string;
  metadata: Record<string, unknown>;
  sessionId: string;
  endUserId: string;
  environment: string;
  release: string;
  tags: string[];
  traceName: string;
  inputTokens: number;
  outputTokens: number;
  ttftMs: number;
  retryCount: number;
  errorType: string;
  errorMessage: string;
  isStreamChunk: boolean;
  streamSequence: number;
  streamFinal: boolean;
  payloadFormat: string;
  stackTrace: string;
  timedOut: boolean;
  timeoutMs: number;
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

/** Get cost, token, and latency breakdown per end-user identifier. */
export async function getCostByUser(projectId: string, days = 30) {
  const sql = `
    SELECT
      endUserId,
      sum(costUsd) AS totalCostUsd,
      sum(inputTokens + outputTokens) AS totalTokens,
      count() AS spanCount,
      avg(latencyMs) AS avgLatencyMs
    FROM spans
    WHERE projectId = '${projectId}'
      AND endUserId != ''
      AND createdAt >= now() - INTERVAL ${days} DAY
    GROUP BY endUserId
    ORDER BY totalCostUsd DESC
    LIMIT 20
  `;
  const res = await fetch(sqlUrl(sql), { headers: getHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird query failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.data as { endUserId: string; totalCostUsd: number; totalTokens: number; spanCount: number; avgLatencyMs: number }[];
}

export type TraceSearchFilters = {
  query?: string;
  sessionId?: string;
  endUserId?: string;
  environment?: string;
  release?: string;
  modelId?: string;
  tag?: string;
  status?: "all" | "error" | "healthy";
  minCostUsd?: number;
  minLatencyMs?: number;
  days?: number;
  limit?: number;
};

export async function searchTraces(projectId: string, filters: TraceSearchFilters) {
  const where = [`projectId = '${sqlString(projectId)}'`];
  const days = Math.min(Math.max(filters.days ?? 30, 1), 90);
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100);
  where.push(`createdAt >= now() - INTERVAL ${days} DAY`);
  if (filters.sessionId) where.push(`sessionId = '${sqlString(filters.sessionId)}'`);
  if (filters.endUserId) where.push(`endUserId = '${sqlString(filters.endUserId)}'`);
  if (filters.environment) where.push(`environment = '${sqlString(filters.environment)}'`);
  if (filters.release) where.push(`release = '${sqlString(filters.release)}'`);
  if (filters.modelId) where.push(`modelId = '${sqlString(filters.modelId)}'`);
  if (filters.tag) where.push(`has(tags, '${sqlString(filters.tag)}')`);
  if (filters.query) {
    const value = sqlString(filters.query);
    where.push(`(positionCaseInsensitive(runId, '${value}') > 0 OR positionCaseInsensitive(traceName, '${value}') > 0 OR positionCaseInsensitive(metadata, '${value}') > 0 OR positionCaseInsensitive(input, '${value}') > 0 OR positionCaseInsensitive(output, '${value}') > 0)`);
  }

  const having = [];
  if (filters.status === "error") having.push("countIf(spanType = 'error') > 0");
  if (filters.status === "healthy") having.push("countIf(spanType = 'error') = 0");
  if (filters.minCostUsd !== undefined) having.push(`sum(costUsd) >= ${Number(filters.minCostUsd)}`);
  if (filters.minLatencyMs !== undefined) having.push(`max(latencyMs) >= ${Number(filters.minLatencyMs)}`);
  const sql = `
    SELECT
      runId,
      any(sessionId) AS sessionId,
      any(endUserId) AS endUserId,
      any(environment) AS environment,
      any(release) AS release,
      any(traceName) AS traceName,
      min(createdAt) AS startedAt,
      max(createdAt) AS lastSeenAt,
      count() AS spanCount,
      sum(costUsd) AS totalCostUsd,
      max(latencyMs) AS maxLatencyMs,
      max(ttftMs) AS ttftMs,
      sum(retryCount) AS retryCount,
      countIf(spanType = 'error') AS errorCount
    FROM spans
    WHERE ${where.join(" AND ")}
    GROUP BY runId
    ${having.length ? `HAVING ${having.join(" AND ")}` : ""}
    ORDER BY lastSeenAt DESC
    LIMIT ${limit}
  `;
  const res = await fetch(sqlUrl(sql), { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`Tinybird query failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.data as Array<{
    runId: string; sessionId: string; endUserId: string; environment: string; release: string;
    traceName: string; startedAt: string; lastSeenAt: string; spanCount: number;
    totalCostUsd: number; maxLatencyMs: number; ttftMs: number; retryCount: number; errorCount: number;
  }>;
}

/**
 * Get orchestration savings summary for a project.
 * Returns calls retried, calls fell back, calls blocked, and estimated cost savings.
 */
export async function getOrchestrationSavings(projectId: string, days = 30) {
  const sql = `
    SELECT
      countIf(
        JSONExtractBool(metadata, 'orchestrationWillRetry') = 1
      ) AS callsRetried,
      countIf(
        JSONExtractBool(metadata, 'orchestrationIsFallback') = 1
          AND JSONExtractBool(metadata, 'orchestrationFinal') = 1
      ) AS callsFellBack,
      countIf(
        JSONExtractBool(metadata, 'orchestrationBlocked') = 1
      ) AS callsBlocked,
      sumIf(
        costUsd,
        JSONExtractBool(metadata, 'orchestrationIsFallback') = 1
          AND JSONExtractBool(metadata, 'orchestrationFinal') = 1
      ) AS fallbackCostUsd,
      sumIf(
        costUsd,
        JSONExtractBool(metadata, 'orchestrationIsFallback') = 0
          AND spanType = 'llm_call'
      ) AS primaryCostUsd
    FROM spans
    WHERE projectId = '${projectId}'
      AND createdAt >= now() - INTERVAL ${days} DAY
      AND has(metadata, 'orchestrationAttempt')
  `;
  const res = await fetch(sqlUrl(sql), {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird query failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  const row = data.data?.[0] ?? {
    callsRetried: 0,
    callsFellBack: 0,
    callsBlocked: 0,
    fallbackCostUsd: 0,
    primaryCostUsd: 0,
  };

  return {
    callsRetried: Number(row.callsRetried) || 0,
    callsFellBack: Number(row.callsFellBack) || 0,
    callsBlocked: Number(row.callsBlocked) || 0,
    fallbackCostUsd: Number(row.fallbackCostUsd) || 0,
    primaryCostUsd: Number(row.primaryCostUsd) || 0,
    totalOrchestratedCalls:
      (Number(row.callsRetried) || 0) +
      (Number(row.callsFellBack) || 0) +
      (Number(row.callsBlocked) || 0),
  };
}

/**
 * Get fail-open rate for a project over the last N days.
 * Returns total orchestrations, fail-open count, and rate.
 */
export async function getFailOpenRate(projectId: string, days = 7) {
  const endpoint = `${TINYBIRD_HOST}/v0/pipes/fail_open_rate.json`;
  const params = new URLSearchParams({
    projectId,
    days: String(days),
    token: TINYBIRD_TOKEN ?? "",
  });

  const res = await fetch(`${endpoint}?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird query failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  const row = data.data?.[0] ?? {
    totalOrchestrations: 0,
    failOpenCount: 0,
  };

  const total = Number(row.totalOrchestrations) || 0;
  const failOpen = Number(row.failOpenCount) || 0;

  return {
    totalOrchestrations: total,
    failOpenCount: failOpen,
    failOpenRate: total > 0 ? failOpen / total : 0,
    elevated: total >= 10 && failOpen / total > 0.05,
  };
}

export interface SpanRow {
  spanId: string;
  runId: string;
  projectId: string;
  spanType: string;
  input: string;
  output: string;
  attachments: string;
  latencyMs: number;
  costUsd: number;
  modelId: string;
  toolName: string;
  parentSpanId: string;
  metadata: Record<string, unknown>;
  sessionId: string;
  endUserId: string;
  environment: string;
  release: string;
  tags: string[];
  traceName: string;
  inputTokens: number;
  outputTokens: number;
  ttftMs: number;
  retryCount: number;
  errorType: string;
  errorMessage: string;
  isStreamChunk: boolean;
  streamSequence: number;
  streamFinal: boolean;
  payloadFormat: string;
  stackTrace: string;
  timedOut: boolean;
  timeoutMs: number;
  createdAt: string;
}
