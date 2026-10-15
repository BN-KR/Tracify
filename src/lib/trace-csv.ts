import { columnLabel, isMetaColumn, isKnownColumn, type TraceRowExtras } from "./trace-columns";
import { parseTime, previewText, toCsv } from "../components/dashboard/tracing/format";
export type ExportTrace = TraceRowExtras & {
  runId: string; traceName: string; startedAt: string; durationMs: number; spanCount: number; errorCount: number;
  totalCostUsd: number; inputTokens: number; outputTokens: number; modelId: string; endUserId: string;
  sessionId: string; environment: string; release: string; tags: string[]; inputPreview: string; outputPreview: string;
};
const FIELDS: Record<string, keyof ExportTrace> = {
  traceId: "runId", name: "traceName", latency: "durationMs", cost: "totalCostUsd", steps: "spanCount", errors: "errorCount",
  model: "modelId", user: "endUserId", session: "sessionId", lastSeen: "lastSeenAt",
};
const NUMERIC = new Set(["latency", "cost", "steps", "errors", "inputTokens", "outputTokens", "llmCalls", "toolCalls", "slowestStepMs", "avgStepMs", "ttftMs", "retries", "timeouts"]);
const MILLIS = new Set(["latency", "slowestStepMs", "avgStepMs", "ttftMs"]);
export function csvColumnLabel(id: string) {
  if (isMetaColumn(id)) return `Metadata: ${id.slice(5)}`;
  return `${columnLabel(id)}${MILLIS.has(id) ? " (ms)" : id === "cost" ? " (USD)" : ["startedAt", "lastSeen"].includes(id) ? " (UTC)" : ""}`;
}
export function csvColumnValue(id: string, row: ExportTrace): string | number {
  if (isMetaColumn(id)) return row.meta?.[id.slice(5)] ?? "";
  if (id === "status") return Number(row.errorCount) > 0 ? "error" : "ok";
  if (id === "tokens") return Number(row.inputTokens) + Number(row.outputTokens);
  if (id === "tags") return JSON.stringify(row.tags ?? []);
  if (id === "input" || id === "output") return previewText(id === "input" ? row.inputPreview : row.outputPreview);
  const value = row[FIELDS[id] ?? id as keyof ExportTrace];
  if (value === undefined || value === null) return "";
  if (id === "startedAt" || id === "lastSeen") {
    const ms = parseTime(String(value)); return Number.isFinite(ms) ? new Date(ms).toISOString() : "";
  }
  if (NUMERIC.has(id)) { const number = Number(value); return Number.isFinite(number) ? number : ""; }
  return String(value);
}
/** Same columns, same order and current page rows; numeric cells retain precision and explicit units. */
export function traceCsv(columns: string[], rows: ExportTrace[]) {
  const selected = [...new Set(columns.filter(isKnownColumn))];
  return toCsv(selected.map(csvColumnLabel), rows.map((row) => selected.map((id) => csvColumnValue(id, row))));
}
