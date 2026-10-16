import type { Doc } from "./_generated/dataModel";

export type AlertMetric = Doc<"alertRules">["metric"];
type Run = Pick<Doc<"agentRuns">, "status" | "totalCostUsd" | "startedAt" | "finishedAt" | "environment">;

const MINUTE = 60_000;

function percentile95(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
}

/** Value of `metric` at time `at`, looking back `windowMinutes`. Runs must already be scoped to the project. */
export function metricAt(runs: Run[], metric: AlertMetric, windowMinutes: number, at: number, environment?: string) {
  const from = at - windowMinutes * MINUTE;
  const scoped = runs.filter((run) => !environment || run.environment === environment);
  const times = scoped.map((run) => ({ run, t: Date.parse(run.startedAt) })).filter((entry) => Number.isFinite(entry.t) && entry.t <= at);
  if (metric === "minutes_without_runs") {
    const latest = times.reduce((max, entry) => Math.max(max, entry.t), 0);
    return latest ? Math.max(0, Math.round((at - latest) / MINUTE)) : windowMinutes;
  }
  const inWindow = times.filter((entry) => entry.t > from).map((entry) => entry.run);
  if (metric === "failed_runs") return inWindow.filter((run) => run.status === "failed").length;
  if (metric === "cost_usd") return Math.round(inWindow.reduce((sum, run) => sum + run.totalCostUsd, 0) * 100) / 100;
  const seconds = inWindow.flatMap((run) => {
    const ms = run.finishedAt ? Date.parse(run.finishedAt) - Date.parse(run.startedAt) : NaN;
    return Number.isFinite(ms) && ms >= 0 ? [ms / 1000] : [];
  });
  return Math.round(percentile95(seconds) * 10) / 10;
}

/** `points` evenly spaced values across the last `spanMinutes`, oldest first. */
export function metricSeries(runs: Run[], metric: AlertMetric, windowMinutes: number, now: number, environment?: string, points = 30, spanMinutes = 24 * 60) {
  return Array.from({ length: points }, (_, index) => {
    const at = now - ((points - 1 - index) * spanMinutes * MINUTE) / (points - 1);
    return metricAt(runs, metric, windowMinutes, at, environment);
  });
}

export function describeBreach(rule: Pick<Doc<"alertRules">, "name" | "metric" | "threshold" | "windowMinutes">, value: number) {
  const per = rule.windowMinutes >= 1440 ? "day" : rule.windowMinutes === 60 ? "hour" : `${rule.windowMinutes} min`;
  switch (rule.metric) {
    case "failed_runs": return `${rule.name}: ${value} failed runs in the last ${per} (limit ${rule.threshold}).`;
    case "cost_usd": return `${rule.name}: $${value.toFixed(2)} spent in the last ${per} (limit $${rule.threshold}).`;
    case "slow_p95_seconds": return `${rule.name}: slowest 5% of runs took ${value}s (limit ${rule.threshold}s).`;
    default: return `${rule.name}: no runs for ${value} minutes (limit ${rule.threshold}).`;
  }
}
