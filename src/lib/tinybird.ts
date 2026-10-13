/**
 * Tinybird REST API client.
 * All span analytics queries go through here — never Convex.
 */

const TINYBIRD_HOST = process.env.TINYBIRD_HOST ?? "https://api.tinybird.co";
const TINYBIRD_TOKEN = process.env.TINYBIRD_TOKEN;

// Self-hosted ClickHouse (same SQL dialect) replaces Tinybird when CLICKHOUSE_URL is set.
const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL?.replace(/\/$/, "");
const CLICKHOUSE_DATABASE = process.env.CLICKHOUSE_DATABASE ?? "tracify";

export function analyticsBackend() {
  return CLICKHOUSE_URL ? "clickhouse" : "tinybird";
}

function clickhouseHeaders() {
  const user = process.env.CLICKHOUSE_USER;
  const password = process.env.CLICKHOUSE_PASSWORD;
  if (!user || !password) throw new Error("CLICKHOUSE_USER and CLICKHOUSE_PASSWORD must be set");
  return { Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}` };
}

/** Runs one read query and returns the raw response; the body is `{ data: [...] }` on both backends. */
function analyticsSql(sql: string, init: { signal?: AbortSignal } = {}) {
  if (CLICKHOUSE_URL) {
    const params = new URLSearchParams({ database: CLICKHOUSE_DATABASE, output_format_json_quote_64bit_integers: "1" });
    return fetch(`${CLICKHOUSE_URL}/?${params}`, {
      method: "POST", headers: clickhouseHeaders(), body: `${sql.trimEnd()}\nFORMAT JSON`, cache: "no-store", ...init,
    });
  }
  return fetch(sqlUrl(sql), { headers: getHeaders(), cache: "no-store", ...init });
}

/** Tinybird answers an insert with JSON; ClickHouse answers with an empty body. */
async function insertResult(res: Response) {
  const text = await res.text();
  return text ? (JSON.parse(text) as unknown) : { ok: true };
}

/** Appends newline-delimited JSON rows to a table (Tinybird Events API or ClickHouse INSERT). */
function analyticsInsert(table: "spans" | "evaluation_scores", ndjson: string) {
  if (CLICKHOUSE_URL) {
    const params = new URLSearchParams({
      database: CLICKHOUSE_DATABASE, query: `INSERT INTO ${table} FORMAT JSONEachRow`,
      date_time_input_format: "best_effort", input_format_skip_unknown_fields: "1",
    });
    return fetch(`${CLICKHOUSE_URL}/?${params}`, { method: "POST", headers: clickhouseHeaders(), body: ndjson });
  }
  return fetch(`${TINYBIRD_HOST}/v0/events?name=${table}`, { method: "POST", headers: getHeaders(), body: ndjson });
}

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

export async function checkTinybirdHealth() {
  const response = await analyticsSql("SELECT 1 AS healthy", { signal: AbortSignal.timeout(4_000) });
  if (!response.ok) throw new Error(`Tinybird returned ${response.status}`);
}

function sqlString(value: string) {
  // ClickHouse string literals treat backslash as an escape character, so escape it before quotes.
  return value.replace(/\\/g, "\\\\").replace(/'/g, "''");
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
  const res = await analyticsInsert("spans", ndjson);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Span ingest failed (${analyticsBackend()}): ${res.status} ${body}`);
  }
  return insertResult(res);
}

export async function ingestEvaluationScore(score: {
  scoreId: string;
  projectId: string;
  traceId?: string;
  evaluatorId: string;
  scoreName: string;
  dataType: "boolean" | "numeric" | "categorical" | "text";
  valueNumeric: number;
  valueBoolean: boolean;
  valueCategorical: string;
  status: string;
  modelId?: string;
  environment?: string;
  createdAt: string;
}) {
  const res = await analyticsInsert("evaluation_scores", `${JSON.stringify(score)}\n`);
  if (!res.ok) throw new Error(`Evaluation score ingest failed (${analyticsBackend()}): ${res.status} ${await res.text()}`);
  return insertResult(res);
}

export async function getEvaluationScoreTimeseries(projectId: string, scoreName: string, days = 7) {
  const sql = `SELECT toStartOfHour(createdAt) AS bucket, count() AS sampleCount, avgIf(valueNumeric, dataType = 'numeric') AS averageScore, countIf(status IN ('failed', 'error')) / count() AS failureRate, countIf(dataType = 'boolean' AND valueBoolean = 1) / greatest(countIf(dataType = 'boolean'), 1) AS booleanPassRate FROM evaluation_scores WHERE projectId = '${sqlString(projectId)}' AND scoreName = '${sqlString(scoreName)}' AND createdAt >= now() - INTERVAL ${Math.min(Math.max(days, 1), 90)} DAY GROUP BY bucket ORDER BY bucket ASC`;
  const res = await analyticsSql(sql);
  if (!res.ok) throw new Error(`Tinybird evaluation score query failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data as Array<{ bucket: string; sampleCount: number; averageScore: number; failureRate: number; booleanPassRate: number }>;
}

/**
 * Query spans for a specific run from Tinybird.
 */
export async function getSpansForRun(runId: string, projectId: string) {
  const sql =
    `SELECT * FROM spans WHERE runId = '${sqlString(runId)}' AND projectId = '${sqlString(projectId)}' ORDER BY createdAt ASC`
  const res = await analyticsSql(sql);
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
  const res = await analyticsSql(sql);
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
      avg(latencyMs) AS avgLatencyMs,
      quantile(0.50)(latencyMs) AS p50LatencyMs,
      quantile(0.75)(latencyMs) AS p75LatencyMs,
      quantile(0.90)(latencyMs) AS p90LatencyMs,
      quantile(0.95)(latencyMs) AS p95LatencyMs,
      quantile(0.99)(latencyMs) AS p99LatencyMs
    FROM spans
    WHERE projectId = '${projectId}'
      AND spanType = 'llm_call'
      AND createdAt >= now() - INTERVAL ${days} DAY
    GROUP BY modelId
    ORDER BY totalCostUsd DESC
  `;
  const res = await analyticsSql(sql);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tinybird query failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.data as { modelId: string; totalCostUsd: number; spanCount: number; avgLatencyMs: number; p50LatencyMs: number; p75LatencyMs: number; p90LatencyMs: number; p95LatencyMs: number; p99LatencyMs: number }[];
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
  const res = await analyticsSql(sql);
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
  const res = await analyticsSql(sql);
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
  const res = await analyticsSql(sql);
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

export type TraceListFilters = {
  query?: string;
  fromMs: number;
  toMs: number;
  status?: "all" | "error" | "healthy";
  traceName?: string;
  modelId?: string;
  environment?: string;
  release?: string;
  endUserId?: string;
  sessionId?: string;
  tag?: string;
  minLatencyMs?: number;
  maxLatencyMs?: number;
  minCostUsd?: number;
  maxCostUsd?: number;
  /** Traces containing an error from this group (id from traceErrorGroups). */
  errorGroup?: string;
  /** Traces containing this agent-map step ("tool:<name>" or "model:<id>"). */
  node?: string;
  /** Traces where step `to` ran directly after step `from` (agent-map arrow). */
  edge?: { from: string; to: string };
  sort?: "startedAt" | "latency" | "cost";
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type TraceListRow = {
  runId: string; traceName: string; startedAt: string; lastSeenAt: string; durationMs: number;
  spanCount: number; errorCount: number; totalCostUsd: number; inputTokens: number; outputTokens: number;
  modelId: string; endUserId: string; sessionId: string; environment: string; release: string;
  tags: string[]; inputPreview: string; outputPreview: string;
};

/** A step that failed; the same rule as a trace's errorCount. */
const IS_ERROR = `(spanType = 'error' OR errorType != '')`;
const ERROR_TOOL = `if(toolName != '', toolName, modelId)`;
// The first 120 characters of the error message with ids, paths and numbers replaced, so the same failure with
// different ids groups together. Regexes avoid backslashes so they read the same in JS and ClickHouse literals.
const ERROR_MESSAGE_KEY = `leftUTF8(trimBoth(replaceRegexpAll(replaceRegexpAll(replaceRegexpAll(replaceRegexpAll(replaceRegexpAll(
  substring(errorMessage, 1, 600),
  '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', '<id>'),
  '(~|[.]{1,2})?(/[^/[:space:]"(),:;<>]+){2,}/?', '<path>'),
  '[0-9a-fA-F]{8,}', '<id>'),
  '[0-9]+([.][0-9]+)?', '<n>'),
  '[[:space:]]+', ' ')), 120)`;
const ERROR_GROUP_ID = `lower(hex(cityHash64(${ERROR_TOOL}, errorType, ${ERROR_MESSAGE_KEY})))`;
/** Agent-map node for a step: a model call or a tool. Agent wrappers and fleet events are not nodes. */
const NODE_KEY = `multiIf(spanType IN ('llm', 'generation') AND modelId != '', concat('model:', modelId), toolName != '' AND spanType NOT IN ('agent', 'event'), concat('tool:', toolName), '')`;

function rangeScope(projectId: string, filters: Pick<TraceListFilters, "fromMs" | "toMs">) {
  return `projectId = '${sqlString(projectId)}' AND createdAt >= toDateTime(${Math.floor(filters.fromMs / 1000)}) AND createdAt <= toDateTime(${Math.ceil(filters.toMs / 1000)})`;
}

/** Map steps in time order with the step that ran directly before each one in the same trace. */
function transitionsSql(scope: string) {
  return `SELECT runId, lagInFrame(node, 1, '') OVER (PARTITION BY runId ORDER BY createdAt, spanId ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS source,
      node AS target, latencyMs, failed
    FROM (SELECT runId, spanId, createdAt, latencyMs, ${NODE_KEY} AS node, ${IS_ERROR} AS failed FROM spans WHERE ${scope} AND ${NODE_KEY} != '')`;
}

function traceListClauses(projectId: string, filters: TraceListFilters) {
  const where = [
    `projectId = '${sqlString(projectId)}'`,
    `createdAt >= toDateTime(${Math.floor(filters.fromMs / 1000)})`,
    `createdAt <= toDateTime(${Math.ceil(filters.toMs / 1000)})`,
  ];
  const equals: Array<[keyof TraceListFilters, string]> = [
    ["environment", "environment"], ["release", "release"], ["endUserId", "endUserId"], ["sessionId", "sessionId"],
  ];
  for (const [key, column] of equals) {
    const value = filters[key];
    if (typeof value === "string" && value) where.push(`runId IN (SELECT runId FROM spans WHERE projectId = '${sqlString(projectId)}' AND ${column} = '${sqlString(value)}')`);
  }
  if (filters.traceName) where.push(`runId IN (SELECT runId FROM spans WHERE projectId = '${sqlString(projectId)}' AND traceName = '${sqlString(filters.traceName)}')`);
  if (filters.modelId) where.push(`runId IN (SELECT runId FROM spans WHERE projectId = '${sqlString(projectId)}' AND modelId = '${sqlString(filters.modelId)}')`);
  if (filters.tag) where.push(`runId IN (SELECT runId FROM spans WHERE projectId = '${sqlString(projectId)}' AND has(tags, '${sqlString(filters.tag)}'))`);
  if (filters.query) {
    const value = sqlString(filters.query);
    where.push(`runId IN (SELECT runId FROM spans WHERE projectId = '${sqlString(projectId)}' AND (positionCaseInsensitive(runId, '${value}') > 0 OR positionCaseInsensitive(traceName, '${value}') > 0 OR positionCaseInsensitive(input, '${value}') > 0 OR positionCaseInsensitive(output, '${value}') > 0))`);
  }
  // Error groups and the agent map are computed from steps inside the range, so their filters use the same range.
  const scope = rangeScope(projectId, filters);
  if (filters.errorGroup) where.push(`runId IN (SELECT runId FROM spans WHERE ${scope} AND ${IS_ERROR} AND ${ERROR_GROUP_ID} = '${sqlString(filters.errorGroup)}')`);
  if (filters.node) where.push(`runId IN (SELECT runId FROM spans WHERE ${scope} AND ${NODE_KEY} = '${sqlString(filters.node)}')`);
  if (filters.edge) where.push(`runId IN (SELECT runId FROM (${transitionsSql(scope)}) WHERE source = '${sqlString(filters.edge.from)}' AND target = '${sqlString(filters.edge.to)}')`);
  const having: string[] = [];
  if (filters.status === "error") having.push("errorCount > 0");
  if (filters.status === "healthy") having.push("errorCount = 0");
  if (filters.minLatencyMs !== undefined) having.push(`durationMs >= ${Number(filters.minLatencyMs)}`);
  if (filters.maxLatencyMs !== undefined) having.push(`durationMs <= ${Number(filters.maxLatencyMs)}`);
  if (filters.minCostUsd !== undefined) having.push(`totalCostUsd >= ${Number(filters.minCostUsd)}`);
  if (filters.maxCostUsd !== undefined) having.push(`totalCostUsd <= ${Number(filters.maxCostUsd)}`);
  return { where: where.join(" AND "), having: having.length ? `HAVING ${having.join(" AND ")}` : "" };
}

// Shared by the full trace row and the lighter run-id filter so HAVING clauses mean the same thing in both.
const DURATION_EXPR = `if(countIf(parentSpanId = '') > 0, maxIf(latencyMs, parentSpanId = ''), greatest(dateDiff('millisecond', min(createdAt), max(createdAt)), max(latencyMs)))`;
const ERROR_COUNT_EXPR = `countIf(${IS_ERROR})`;

/** Run ids of every trace matching the filters, for queries that aggregate steps instead of traces. */
function matchingRunIds(where: string, having: string) {
  return `SELECT runId FROM (SELECT runId, ${DURATION_EXPR} AS durationMs, ${ERROR_COUNT_EXPR} AS errorCount, sum(costUsd) AS totalCostUsd FROM spans WHERE ${where} GROUP BY runId ${having})`;
}

const TRACE_AGGREGATE = `
  runId,
  argMinIf(traceName, createdAt, traceName != '') AS traceName,
  min(createdAt) AS startedAt,
  max(createdAt) AS lastSeenAt,
  ${DURATION_EXPR} AS durationMs,
  count() AS spanCount,
  ${ERROR_COUNT_EXPR} AS errorCount,
  sum(costUsd) AS totalCostUsd,
  sum(inputTokens) AS inputTokens,
  sum(outputTokens) AS outputTokens,
  argMaxIf(modelId, costUsd, modelId != '') AS modelId,
  anyIf(endUserId, endUserId != '') AS endUserId,
  anyIf(sessionId, sessionId != '') AS sessionId,
  anyIf(environment, environment != '') AS environment,
  anyIf(release, release != '') AS release,
  groupUniqArrayArray(tags) AS tags,
  substring(if(countIf(parentSpanId = '' AND input != '') > 0, argMinIf(input, createdAt, parentSpanId = '' AND input != ''), argMinIf(input, createdAt, input != '')), 1, 280) AS inputPreview,
  substring(if(countIf(parentSpanId = '' AND output != '') > 0, argMaxIf(output, createdAt, parentSpanId = '' AND output != ''), argMaxIf(output, createdAt, output != '' AND spanType NOT IN ('tool', 'retrieval'))), 1, 280) AS outputPreview`;

async function tinybirdRows<T>(sql: string): Promise<T[]> {
  const res = await analyticsSql(sql);
  if (!res.ok) throw new Error(`Tinybird query failed: ${res.status} ${await res.text()}`);
  return (await res.json()).data as T[];
}

/** One page of traces (one row per run) plus the total matching count. */
export async function listTraces(projectId: string, filters: TraceListFilters) {
  const { where, having } = traceListClauses(projectId, filters);
  const pageSize = Math.min(Math.max(Math.floor(filters.pageSize ?? 50), 10), 200);
  const page = Math.max(Math.floor(filters.page ?? 0), 0);
  const sortColumn = filters.sort === "latency" ? "durationMs" : filters.sort === "cost" ? "totalCostUsd" : "startedAt";
  const direction = filters.direction === "asc" ? "ASC" : "DESC";
  const grouped = `SELECT ${TRACE_AGGREGATE} FROM spans WHERE ${where} GROUP BY runId ${having}`;
  const [rows, totals] = await Promise.all([
    tinybirdRows<TraceListRow>(`${grouped} ORDER BY ${sortColumn} ${direction}, runId LIMIT ${pageSize} OFFSET ${page * pageSize}`),
    tinybirdRows<{ total: number }>(`SELECT count() AS total FROM (${grouped})`),
  ]);
  return { rows, total: Number(totals[0]?.total ?? 0), page, pageSize };
}

/** Trace counts per time bucket for the list chart; the bucket size follows the selected range. */
export async function traceHistogram(projectId: string, filters: TraceListFilters) {
  const { where, having } = traceListClauses(projectId, filters);
  const spanSeconds = Math.max(60, Math.floor((filters.toMs - filters.fromMs) / 1000));
  const bucketSeconds = [60, 300, 900, 1800, 3600, 10800, 21600, 43200, 86400].find((size) => spanSeconds / size <= 60) ?? 86400;
  const rows = await tinybirdRows<{ bucket: string; traces: number; errors: number }>(`
    SELECT toStartOfInterval(startedAt, INTERVAL ${bucketSeconds} SECOND) AS bucket, count() AS traces, countIf(errorCount > 0) AS errors
    FROM (SELECT ${TRACE_AGGREGATE} FROM spans WHERE ${where} GROUP BY runId ${having})
    GROUP BY bucket ORDER BY bucket`);
  return { bucketSeconds, buckets: rows.map((row) => ({ ...row, traces: Number(row.traces), errors: Number(row.errors) })) };
}

export type TraceStats = {
  traces: number; errors: number; p50DurationMs: number; p95DurationMs: number;
  totalCostUsd: number; inputTokens: number; outputTokens: number;
};

/** Totals for every trace matching the filters (not just the visible page) for the summary strip. */
export async function traceStats(projectId: string, filters: TraceListFilters): Promise<TraceStats> {
  const { where, having } = traceListClauses(projectId, filters);
  const rows = await tinybirdRows<Record<keyof TraceStats, number | string>>(`
    SELECT count() AS traces, countIf(errorCount > 0) AS errors,
      quantile(0.5)(durationMs) AS p50DurationMs, quantile(0.95)(durationMs) AS p95DurationMs,
      sum(totalCostUsd) AS totalCostUsd, sum(inputTokens) AS inputTokens, sum(outputTokens) AS outputTokens
    FROM (SELECT ${TRACE_AGGREGATE} FROM spans WHERE ${where} GROUP BY runId ${having})`);
  const row = rows[0] ?? {};
  const value = (key: keyof TraceStats) => {
    const parsed = Number(row[key] ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  return {
    traces: value("traces"), errors: value("errors"), p50DurationMs: value("p50DurationMs"), p95DurationMs: value("p95DurationMs"),
    totalCostUsd: value("totalCostUsd"), inputTokens: value("inputTokens"), outputTokens: value("outputTokens"),
  };
}

export type ErrorGroup = {
  id: string; tool: string; errorType: string; message: string; sample: string;
  count: number; traces: number; firstSeen: string; lastSeen: string;
};

/** The 20 most frequent error groups among the steps of every trace matching the filters. */
export async function traceErrorGroups(projectId: string, filters: TraceListFilters) {
  const { where, having } = traceListClauses(projectId, filters);
  const rows = await tinybirdRows<ErrorGroup & { totalGroups: number }>(`
    SELECT ${ERROR_GROUP_ID} AS id, ${ERROR_TOOL} AS tool, errorType, ${ERROR_MESSAGE_KEY} AS message,
      substring(any(errorMessage), 1, 300) AS sample, count() AS count, uniqExact(runId) AS traces,
      min(createdAt) AS firstSeen, max(createdAt) AS lastSeen, count() OVER () AS totalGroups
    FROM spans
    WHERE ${where} AND ${IS_ERROR} AND runId IN (${matchingRunIds(where, having)})
    GROUP BY id, tool, errorType, message
    ORDER BY count DESC, traces DESC, id
    LIMIT 20`);
  return {
    total: Number(rows[0]?.totalGroups ?? 0),
    groups: rows.map((row): ErrorGroup => ({
      id: row.id, tool: row.tool, errorType: row.errorType, message: row.message, sample: row.sample,
      count: Number(row.count), traces: Number(row.traces), firstSeen: row.firstSeen, lastSeen: row.lastSeen,
    })),
  };
}

export type MapNode = { id: string; kind: "tool" | "model"; name: string; count: number; traces: number; errors: number; p50LatencyMs: number };
export type MapEdge = { source: string; target: string; count: number; traces: number; errorRate: number; p50LatencyMs: number };
export const MAP_NODE_LIMIT = 40;
export const MAP_EDGE_LIMIT = 100;

/**
 * Aggregate agent map for the traces matching the filters: tools and models as nodes, and an arrow A -> B for
 * every time B ran directly after A in the same trace. Capped at the busiest 40 nodes and 100 arrows.
 */
export async function traceAgentMap(projectId: string, filters: TraceListFilters) {
  const { where, having } = traceListClauses(projectId, filters);
  const scope = `${where} AND runId IN (${matchingRunIds(where, having)})`;
  const nodeRows = await tinybirdRows<{ id: string; count: number; traces: number; errors: number; p50LatencyMs: number; totalNodes: number }>(`
    SELECT ${NODE_KEY} AS id, count() AS count, uniqExact(runId) AS traces, countIf(${IS_ERROR}) AS errors,
      quantile(0.5)(latencyMs) AS p50LatencyMs, count() OVER () AS totalNodes
    FROM spans WHERE ${scope} AND ${NODE_KEY} != ''
    GROUP BY id ORDER BY count DESC, id LIMIT ${MAP_NODE_LIMIT}`);
  const nodes: MapNode[] = nodeRows.map((row) => {
    const kind = row.id.startsWith("model:") ? "model" : "tool";
    return { id: row.id, kind, name: row.id.slice(kind.length + 1), count: Number(row.count), traces: Number(row.traces), errors: Number(row.errors), p50LatencyMs: Number(row.p50LatencyMs) };
  });
  if (!nodes.length) return { nodes, edges: [] as MapEdge[], totalNodes: 0, totalEdges: 0 };
  const ids = `[${nodes.map((node) => `'${sqlString(node.id)}'`).join(", ")}]`;
  const edgeRows = await tinybirdRows<MapEdge & { totalEdges: number }>(`
    SELECT source, target, count() AS count, uniqExact(runId) AS traces, avg(failed) AS errorRate,
      quantile(0.5)(latencyMs) AS p50LatencyMs, count() OVER () AS totalEdges
    FROM (${transitionsSql(scope)})
    WHERE source != '' AND has(${ids}, source) AND has(${ids}, target)
    GROUP BY source, target ORDER BY count DESC, source, target LIMIT ${MAP_EDGE_LIMIT}`);
  return {
    nodes,
    edges: edgeRows.map((row): MapEdge => ({
      source: row.source, target: row.target, count: Number(row.count), traces: Number(row.traces),
      errorRate: Number(row.errorRate), p50LatencyMs: Number(row.p50LatencyMs),
    })),
    totalNodes: Number(nodeRows[0]?.totalNodes ?? 0),
    totalEdges: Number(edgeRows[0]?.totalEdges ?? 0),
  };
}

/** Distinct values per filterable field for the filter sidebar. */
export async function traceFilterOptions(projectId: string, fromMs: number, toMs: number) {
  const scope = `projectId = '${sqlString(projectId)}' AND createdAt >= toDateTime(${Math.floor(fromMs / 1000)}) AND createdAt <= toDateTime(${Math.ceil(toMs / 1000)})`;
  const rows = await tinybirdRows<Record<string, string[]>>(`
    SELECT
      arraySlice(groupUniqArrayIf(traceName, traceName != ''), 1, 200) AS traceName,
      arraySlice(groupUniqArrayIf(modelId, modelId != ''), 1, 200) AS modelId,
      arraySlice(groupUniqArrayIf(environment, environment != ''), 1, 50) AS environment,
      arraySlice(groupUniqArrayIf(release, release != ''), 1, 100) AS release,
      arraySlice(groupUniqArrayIf(endUserId, endUserId != ''), 1, 200) AS endUserId,
      arraySlice(groupUniqArrayIf(sessionId, sessionId != ''), 1, 200) AS sessionId,
      arraySlice(groupUniqArrayArray(tags), 1, 200) AS tag
    FROM spans WHERE ${scope}`);
  const first = rows[0] ?? {};
  return Object.fromEntries(Object.entries(first).map(([key, values]) => [key, [...(values ?? [])].sort()])) as Record<string, string[]>;
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
      AND JSONHas(metadata, 'orchestrationAttempt')
  `;
  const res = await analyticsSql(sql);
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
  const safeDays = Math.min(Math.max(Math.floor(days), 1), 365);
  const res = CLICKHOUSE_URL
    ? await analyticsSql(`SELECT projectId, countIf(JSONExtractBool(metadata, 'orchestrationFailOpen') = 1) AS failOpenCount, count() AS totalOrchestrations
        FROM spans WHERE projectId = '${sqlString(projectId)}' AND createdAt >= now() - INTERVAL ${safeDays} DAY
          AND metadata != '' AND JSONHas(metadata, 'orchestrationFailOpen') GROUP BY projectId`)
    : await fetch(`${TINYBIRD_HOST}/v0/pipes/fail_open_rate.json?${new URLSearchParams({ projectId, days: String(safeDays), token: TINYBIRD_TOKEN ?? "" })}`);
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
