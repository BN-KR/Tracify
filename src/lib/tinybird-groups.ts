import { IS_ERROR, sqlString, tinybirdRows } from "./tinybird";
import type { GroupFilters, GroupKind } from "./group-filters";

/** Sessions group steps by sessionId, users by endUserId. `other` is the id of the opposite kind. */
const KEYS: Record<GroupKind, { key: string; other: string }> = {
  session: { key: "sessionId", other: "endUserId" },
  user: { key: "endUserId", other: "sessionId" },
};

const SORT_COLUMN: Record<string, string> = {
  lastSeenAt: "lastSeenAt", firstSeenAt: "firstSeenAt", runs: "runs", failedRuns: "failedRuns",
  totalCostUsd: "totalCostUsd", tokens: "inputTokens + outputTokens", spanSeconds: "spanSeconds", id: "id",
};

export type GroupRow = {
  id: string; runs: number; spanCount: number; failedRuns: number; totalCostUsd: number;
  inputTokens: number; outputTokens: number; firstSeenAt: string; lastSeenAt: string; spanSeconds: number;
  /** How many of the opposite kind (users in a session, sessions of a user) and the first one seen. */
  others: number; other: string; environment: string; topModel: string;
};

export type GroupStats = { groups: number; runs: number; failedRuns: number; groupsWithErrors: number; totalCostUsd: number; tokens: number };

const num = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

function scope(projectId: string, kind: GroupKind, filters: Pick<GroupFilters, "fromMs" | "toMs" | "query" | "environment">) {
  const { key, other } = KEYS[kind];
  const where = [
    `projectId = '${sqlString(projectId)}'`,
    `createdAt >= toDateTime(${Math.floor(filters.fromMs / 1000)})`,
    `createdAt <= toDateTime(${Math.ceil(filters.toMs / 1000)})`,
    `${key} != ''`,
  ];
  if (filters.environment) where.push(`environment = '${sqlString(filters.environment)}'`);
  if (filters.query) {
    const value = sqlString(filters.query);
    where.push(`(positionCaseInsensitive(${key}, '${value}') > 0 OR positionCaseInsensitive(${other}, '${value}') > 0)`);
  }
  return where.join(" AND ");
}

function having(status: GroupFilters["status"]) {
  return status === "error" ? "HAVING failedRuns > 0" : status === "healthy" ? "HAVING failedRuns = 0" : "";
}

function aggregate(kind: GroupKind) {
  const { key, other } = KEYS[kind];
  return `
    ${key} AS id,
    uniqExact(runId) AS runs,
    count() AS spanCount,
    uniqExactIf(runId, ${IS_ERROR}) AS failedRuns,
    sum(costUsd) AS totalCostUsd,
    sum(inputTokens) AS inputTokens,
    sum(outputTokens) AS outputTokens,
    min(createdAt) AS firstSeenAt,
    max(createdAt) AS lastSeenAt,
    dateDiff('second', min(createdAt), max(createdAt)) AS spanSeconds,
    uniqExactIf(${other}, ${other} != '') AS others,
    anyIf(${other}, ${other} != '') AS other,
    anyIf(environment, environment != '') AS firstEnvironment,
    argMaxIf(modelId, costUsd, modelId != '') AS topModel`;
}

function cleanRow(row: Record<string, unknown>): GroupRow {
  return {
    id: String(row.id ?? ""), runs: num(row.runs), spanCount: num(row.spanCount), failedRuns: num(row.failedRuns),
    totalCostUsd: num(row.totalCostUsd), inputTokens: num(row.inputTokens), outputTokens: num(row.outputTokens),
    firstSeenAt: String(row.firstSeenAt ?? ""), lastSeenAt: String(row.lastSeenAt ?? ""), spanSeconds: num(row.spanSeconds),
    others: num(row.others), other: String(row.other ?? ""), environment: String(row.firstEnvironment ?? ""), topModel: String(row.topModel ?? ""),
  };
}

/** One page of sessions or users, the totals over every match (not just the page), and the environments to filter by. */
export async function listGroups(projectId: string, kind: GroupKind, filters: GroupFilters) {
  const where = scope(projectId, kind, filters);
  const grouped = `SELECT ${aggregate(kind)} FROM spans WHERE ${where} GROUP BY id ${having(filters.status)}`;
  const direction = filters.direction === "asc" ? "ASC" : "DESC";
  const [rows, stats, environments] = await Promise.all([
    tinybirdRows<Record<string, unknown>>(`${grouped} ORDER BY ${SORT_COLUMN[filters.sort] ?? "lastSeenAt"} ${direction}, id LIMIT ${filters.pageSize} OFFSET ${filters.page * filters.pageSize}`),
    tinybirdRows<Record<string, unknown>>(`
      SELECT count() AS groups, sum(runs) AS sumRuns, sum(failedRuns) AS sumFailedRuns, countIf(failedRuns > 0) AS groupsWithErrors,
        sum(totalCostUsd) AS sumCostUsd, sum(inputTokens + outputTokens) AS sumTokens
      FROM (${grouped})`),
    // Environments inside the range, ignoring the environment filter itself so the choice never hides its alternatives.
    tinybirdRows<{ environment: string; groups: number }>(`
      SELECT environment, uniqExact(${KEYS[kind].key}) AS groups FROM spans
      WHERE ${scope(projectId, kind, { ...filters, environment: undefined })} AND environment != ''
      GROUP BY environment ORDER BY groups DESC LIMIT 20`),
  ]);
  const first = stats[0] ?? {};
  const totals: GroupStats = {
    groups: num(first.groups), runs: num(first.sumRuns), failedRuns: num(first.sumFailedRuns),
    groupsWithErrors: num(first.groupsWithErrors), totalCostUsd: num(first.sumCostUsd), tokens: num(first.sumTokens),
  };
  return { rows: rows.map(cleanRow), total: totals.groups, stats: totals, environments: environments.map((item) => ({ value: item.environment, groups: num(item.groups) })), page: filters.page, pageSize: filters.pageSize };
}

const DETAIL_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

/** One session or user over the last 90 days, however it was reached (list row, shared link, typed URL). */
export async function groupDetail(projectId: string, kind: GroupKind, id: string, now = Date.now()) {
  const where = scope(projectId, kind, { fromMs: now - DETAIL_WINDOW_MS, toMs: now }) + ` AND ${KEYS[kind].key} = '${sqlString(id)}'`;
  const { other } = KEYS[kind];
  const [rows, siblings] = await Promise.all([
    tinybirdRows<Record<string, unknown>>(`SELECT ${aggregate(kind)} FROM spans WHERE ${where} GROUP BY id`),
    // A user's sessions, or a session's users, newest first.
    tinybirdRows<Record<string, unknown>>(`
      SELECT ${other} AS id, uniqExact(runId) AS runs, uniqExactIf(runId, ${IS_ERROR}) AS failedRuns, sum(costUsd) AS totalCostUsd, max(createdAt) AS lastSeenAt
      FROM spans WHERE ${where} AND ${other} != '' GROUP BY id ORDER BY lastSeenAt DESC LIMIT 25`),
  ]);
  const row = rows[0];
  return {
    row: row ? cleanRow(row) : null,
    siblings: siblings.map((item) => ({ id: String(item.id ?? ""), runs: num(item.runs), failedRuns: num(item.failedRuns), totalCostUsd: num(item.totalCostUsd), lastSeenAt: String(item.lastSeenAt ?? "") })),
  };
}
