export type WidgetSource = "traces" | "stats" | "scores";
export type WidgetDef = { id: string; title: string; description: string; source: WidgetSource; wide: boolean };

export const WIDGETS: WidgetDef[] = [
  { id: "trace_volume", title: "Traces over time", description: "How many runs your agent made, with failed runs marked in red.", source: "traces", wide: true },
  { id: "error_rate", title: "Failure rate", description: "The share of runs that hit an error, and how it moves.", source: "traces", wide: false },
  { id: "latency", title: "Response time", description: "How long a run takes: the typical one (median) and the slow ones (95th percentile).", source: "traces", wide: true },
  { id: "cost_daily", title: "Cost per day", description: "What your agent spent each day on models and tools.", source: "stats", wide: true },
  { id: "cost_by_model", title: "Cost by model", description: "Which models take the biggest share of the bill.", source: "stats", wide: false },
  { id: "cost_by_tool", title: "Cost by tool", description: "Which tools your agent calls most, and what they cost.", source: "stats", wide: false },
  { id: "top_users", title: "Top users by cost", description: "The end users who cost the most in this period.", source: "stats", wide: false },
  { id: "quality_scores", title: "Quality scores", description: "Average score or pass rate for every score you record.", source: "scores", wide: false },
];

export const widgetInfo = (id: string) => WIDGETS.find((widget) => widget.id === id) ?? null;

/** Moves one id a step earlier (-1) or later (1) in a list; at the ends or for an unknown id the list is unchanged. */
export function moveWidget(ids: string[], id: string, direction: -1 | 1) {
  const index = ids.indexOf(id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const errorShare = (traces: number, errors: number) => (traces > 0 ? Math.min(1, errors / traces) : null);

export function compactNumber(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  return String(Math.round(value));
}

export function compactCost(value: number) {
  if (value === 0) return "$0";
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 100) return `$${value.toFixed(2)}`;
  return `$${compactNumber(value)}`;
}

export function duration(ms: number) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

/** Short axis label for a histogram bucket: a time inside a day, a date beyond it. */
export function bucketLabel(iso: string, bucketSeconds: number) {
  const date = new Date(`${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return bucketSeconds < 86_400 && bucketSeconds <= 10_800
    ? date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", timeZone: "UTC" })
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}
