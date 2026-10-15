import { COLUMN_DEFS } from "./trace-columns";
const builtins = new Set(COLUMN_DEFS.map((column) => column.id));
export function validTraceSort(value: string | null | undefined): string {
  return value && (builtins.has(value) || value.startsWith("meta:") && /^[\w.\- :/]{1,60}$/.test(value.slice(5))) ? value : "startedAt";
}
/** Identifiers/expressions are fixed allow-listed SQL; URL text is never interpolated as SQL. */
export const TRACE_SORT_FIELDS: Record<string, string> = {
  startedAt: "startedAt", lastSeen: "lastSeenAt", status: "toUInt8(errorCount > 0)", name: "lowerUTF8(traceName)", traceId: "runId",
  input: "lowerUTF8(inputPreview)", output: "lowerUTF8(outputPreview)", latency: "durationMs", steps: "spanCount", cost: "totalCostUsd",
  tokens: "inputTokens + outputTokens", inputTokens: "inputTokens", outputTokens: "outputTokens", model: "lowerUTF8(modelId)",
  user: "lowerUTF8(endUserId)", session: "lowerUTF8(sessionId)", environment: "lowerUTF8(environment)", release: "lowerUTF8(release)",
  tags: "lowerUTF8(arrayStringConcat(arraySort(tags), ', '))", errors: "errorCount",
};
