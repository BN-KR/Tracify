import { isKnownColumn, isMetaColumn, orderColumns } from "./trace-columns";
const KEYS = new Set([
  "range",
  "from",
  "to",
  "q",
  "status",
  "sort",
  "dir",
  "mode",
  "groupBy",
  "pageSize",
  "traceName",
  "spanType",
  "toolName",
  "modelId",
  "errorType",
  "environment",
  "release",
  "endUserId",
  "sessionId",
  "tag",
  "minLatencyMs",
  "maxLatencyMs",
  "minCostUsd",
  "maxCostUsd",
  "node",
  "edge",
  "errorGroup",
]);
export function savedViewQuery(query: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([key, value]) => KEYS.has(key) && value && value.length <= 200)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}
export function savedViewColumns(columns: string[]) {
  return orderColumns([...new Set(columns.filter(id => isKnownColumn(id) && (!isMetaColumn(id) || /^[\w.\- :/]{1,60}$/.test(id.slice(5)))))]).filter((id, index, all) => !isMetaColumn(id) || all.slice(0,index).filter(isMetaColumn).length < 20);
}
export function savedViewState(
  query: Record<string, string>,
  columns: string[],
) {
  return JSON.stringify({
    query: savedViewQuery(query),
    columns: savedViewColumns(columns),
  });
}
export function columnsFromUrl(raw?: string) {
  if (!raw) return null;
  try {
    const values = JSON.parse(raw);
    return Array.isArray(values) && values.every((v) => typeof v === "string")
      ? savedViewColumns(values)
      : null;
  } catch {
    return null;
  }
}
