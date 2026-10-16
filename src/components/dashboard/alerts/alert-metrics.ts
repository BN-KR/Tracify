export type Metric = "failed_runs" | "cost_usd" | "slow_p95_seconds" | "minutes_without_runs";

type MetricConfig = {
  title: string;
  hint: string;
  sentence: string;
  unit: string;
  defaultLimit: number;
  /** Metrics that always look at a fixed window hide the hour/day choice. */
  fixedWindow?: number;
  defaultName: (windowMinutes: number) => string;
  format: (value: number) => string;
  condition: (threshold: number, windowMinutes: number) => string;
};

const per = (windowMinutes: number) => (windowMinutes >= 1440 ? "day" : "hour");

export const METRICS: Record<Metric, MetricConfig> = {
  failed_runs: {
    title: "Failures", hint: "failed runs", sentence: "failed runs", unit: "runs", defaultLimit: 5,
    defaultName: (w) => `Failed runs per ${per(w)}`,
    format: (value) => String(value),
    condition: (t, w) => `> ${t} / ${per(w)}`,
  },
  cost_usd: {
    title: "Cost", hint: "spend", sentence: "spend", unit: "USD", defaultLimit: 30,
    defaultName: (w) => `Spend per ${per(w)}`,
    format: (value) => `$${value.toFixed(2)}`,
    condition: (t, w) => `> $${t} / ${per(w)}`,
  },
  slow_p95_seconds: {
    title: "Speed", hint: "slow runs (p95)", sentence: "the slowest 5% of runs", unit: "seconds", defaultLimit: 20, fixedWindow: 60,
    defaultName: () => "Slow runs (p95)",
    format: (value) => `${value} s`,
    condition: (t) => `> ${t} s`,
  },
  minutes_without_runs: {
    title: "No data", hint: "nothing arrives", sentence: "the time since the last run", unit: "minutes", defaultLimit: 30, fixedWindow: 1440,
    defaultName: () => "No runs received",
    format: (value) => `${value} min`,
    condition: (t) => `> ${t} min quiet`,
  },
};
