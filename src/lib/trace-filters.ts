import type { TraceListFilters } from "@/lib/tinybird";

const MAX_RANGE_MS = 90 * 24 * 60 * 60 * 1000;

function optionalNumber(value: string | null) {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function text(value: string | null) {
  return value ? value.slice(0, 200) : undefined;
}

export function parseTraceFilters(searchParams: URLSearchParams, now = Date.now()): TraceListFilters {
  const toMs = Math.min(optionalNumber(searchParams.get("to")) ?? now, now);
  const fromMs = Math.max(optionalNumber(searchParams.get("from")) ?? toMs - 24 * 60 * 60 * 1000, toMs - MAX_RANGE_MS);
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");
  return {
    fromMs: Math.min(fromMs, toMs - 60_000),
    toMs,
    query: text(searchParams.get("q")),
    status: status === "error" || status === "healthy" ? status : "all",
    traceName: text(searchParams.get("traceName")),
    modelId: text(searchParams.get("modelId")),
    environment: text(searchParams.get("environment")),
    release: text(searchParams.get("release")),
    endUserId: text(searchParams.get("endUserId")),
    sessionId: text(searchParams.get("sessionId")),
    tag: text(searchParams.get("tag")),
    minLatencyMs: optionalNumber(searchParams.get("minLatencyMs")),
    maxLatencyMs: optionalNumber(searchParams.get("maxLatencyMs")),
    minCostUsd: optionalNumber(searchParams.get("minCostUsd")),
    maxCostUsd: optionalNumber(searchParams.get("maxCostUsd")),
    sort: sort === "latency" || sort === "cost" ? sort : "startedAt",
    direction: searchParams.get("dir") === "asc" ? "asc" : "desc",
    page: optionalNumber(searchParams.get("page")),
    pageSize: optionalNumber(searchParams.get("pageSize")),
  };
}
