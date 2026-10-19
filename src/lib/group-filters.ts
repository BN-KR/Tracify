export type GroupKind = "session" | "user";

export const GROUP_KINDS: readonly GroupKind[] = ["session", "user"];
export const GROUP_PAGE_SIZES = [25, 50, 100] as const;
const MAX_RANGE_MS = 90 * 24 * 60 * 60 * 1000;

/** Columns the list may be sorted by; anything else falls back to the last activity. */
export const GROUP_SORTS = ["lastSeenAt", "firstSeenAt", "runs", "failedRuns", "totalCostUsd", "tokens", "spanSeconds", "id"] as const;
export type GroupSort = (typeof GROUP_SORTS)[number];

export type GroupFilters = {
  fromMs: number;
  toMs: number;
  query?: string;
  status: "all" | "error" | "healthy";
  environment?: string;
  sort: GroupSort;
  direction: "asc" | "desc";
  page: number;
  pageSize: number;
};

export function isGroupKind(value: string): value is GroupKind {
  return (GROUP_KINDS as readonly string[]).includes(value);
}

function whole(value: string | null, fallback: number, min: number, max: number) {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(Math.max(Math.floor(parsed), min), max) : fallback;
}

/** Reads and bounds every filter from the URL: time at most 90 days, text at 200 characters. */
export function parseGroupFilters(params: URLSearchParams, now = Date.now()): GroupFilters {
  const toMs = Math.min(whole(params.get("to"), now, 0, now), now);
  const fromMs = Math.max(whole(params.get("from"), toMs - 24 * 60 * 60 * 1000, 0, toMs), toMs - MAX_RANGE_MS);
  const status = params.get("status");
  const sort = params.get("sort");
  const pageSize = whole(params.get("pageSize"), 50, 10, 100);
  return {
    fromMs: Math.min(fromMs, toMs - 60_000),
    toMs,
    query: params.get("q")?.trim().slice(0, 200) || undefined,
    status: status === "error" || status === "healthy" ? status : "all",
    environment: params.get("environment")?.slice(0, 200) || undefined,
    sort: (GROUP_SORTS as readonly string[]).includes(sort ?? "") ? (sort as GroupSort) : "lastSeenAt",
    direction: params.get("dir") === "asc" ? "asc" : "desc",
    page: whole(params.get("page"), 0, 0, 10_000),
    pageSize,
  };
}
