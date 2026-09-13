// Shared types for the "explore" premium dashboard surface.
// Kept independent from Convex/Tinybird schema so the same UI can run against
// live project data or fully static demo data.

export type SpanKind =
  | "generation"
  | "tool"
  | "retrieval"
  | "chain"
  | "agent"
  | "error";

export type ExploreSpan = {
  id: string;
  parentId: string | null;
  name: string;
  kind: SpanKind;
  /** Milliseconds from the start of the trace. */
  startOffsetMs: number;
  durationMs: number;
  status: "ok" | "error";
  model?: string;
  costUsd?: number;
  inputTokens?: number;
  outputTokens?: number;
  children: ExploreSpan[];
};

export type TraceStatus = "success" | "error" | "running";

export type ExploreTrace = {
  id: string;
  name: string;
  status: TraceStatus;
  startedAt: string; // ISO timestamp
  durationMs: number;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
  model: string;
  user: string;
  tags: string[];
  spans: ExploreSpan[];
};

export type FilterOperator = "eq" | "contains" | "gte" | "lte" | "between";

export type FilterField =
  | "status"
  | "model"
  | "tag"
  | "search"
  | "cost"
  | "latency"
  | "dateRange";

export type ExploreFilter = {
  id: string;
  field: FilterField;
  label: string;
  operator: FilterOperator;
  value: string;
  /** Optional second value, e.g. for range filters (max of a min/max pair). */
  value2?: string;
};

export function totalDurationMs(spans: ExploreSpan[]): number {
  let max = 0;
  const walk = (list: ExploreSpan[]) => {
    for (const s of list) {
      max = Math.max(max, s.startOffsetMs + s.durationMs);
      if (s.children.length) walk(s.children);
    }
  };
  walk(spans);
  return max;
}

export function applyFilters(traces: ExploreTrace[], filters: ExploreFilter[]): ExploreTrace[] {
  return traces.filter((trace) => filters.every((f) => matchesFilter(trace, f)));
}

function matchesFilter(trace: ExploreTrace, filter: ExploreFilter): boolean {
  switch (filter.field) {
    case "status":
      return trace.status === filter.value;
    case "model":
      return trace.model === filter.value;
    case "tag":
      return trace.tags.includes(filter.value);
    case "search": {
      const needle = filter.value.trim().toLowerCase();
      if (!needle) return true;
      return (
        trace.name.toLowerCase().includes(needle) ||
        trace.id.toLowerCase().includes(needle) ||
        trace.user.toLowerCase().includes(needle) ||
        trace.model.toLowerCase().includes(needle)
      );
    }
    case "cost": {
      const min = filter.value ? parseFloat(filter.value) : undefined;
      const max = filter.value2 ? parseFloat(filter.value2) : undefined;
      if (min !== undefined && trace.costUsd < min) return false;
      if (max !== undefined && trace.costUsd > max) return false;
      return true;
    }
    case "latency": {
      const min = filter.value ? parseFloat(filter.value) : undefined;
      const max = filter.value2 ? parseFloat(filter.value2) : undefined;
      const seconds = trace.durationMs / 1000;
      if (min !== undefined && seconds < min) return false;
      if (max !== undefined && seconds > max) return false;
      return true;
    }
    case "dateRange": {
      const from = filter.value ? new Date(filter.value).getTime() : undefined;
      const to = filter.value2 ? new Date(filter.value2).getTime() : undefined;
      const ts = new Date(trace.startedAt).getTime();
      if (from !== undefined && ts < from) return false;
      if (to !== undefined && ts > to) return false;
      return true;
    }
    default:
      return true;
  }
}
