/** Pure shaping helpers for the Costs page; every number comes from the analytics rows, nothing is estimated. */

export type CostSeriesRow = { bucket: string; model: string; costUsd: number };
export type StackedBucket = { start: number; total: number; parts: number[] };
export type StackedSeries = { models: string[]; buckets: StackedBucket[]; bucketMs: number };

export const NO_MODEL = "No model";
export const OTHER_MODELS = "Other";

const bucketStart = (bucket: string) => Date.parse(bucket.includes("T") ? bucket : `${bucket.replace(" ", "T")}Z`);

/**
 * Cost per bucket split by model: the `top` models by total spend get their own slice, the rest share "Other".
 * Empty buckets across the range are kept as zeros so a quiet day shows as a gap instead of being skipped.
 */
export function stackSeries(rows: CostSeriesRow[], bucketSeconds: number, range: { from: number; to: number }, top = 5): StackedSeries {
  const bucketMs = bucketSeconds * 1000;
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.model || NO_MODEL, (totals.get(row.model || NO_MODEL) ?? 0) + row.costUsd);
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([model]) => model);
  const named = ranked.slice(0, top);
  const hasOther = ranked.length > top;
  const models = hasOther ? [...named, OTHER_MODELS] : named;
  const index = new Map(named.map((model, position) => [model, position]));
  const byStart = new Map<number, number[]>();
  const starts = new Set<number>();
  for (const row of rows) {
    const start = bucketStart(row.bucket);
    if (!Number.isFinite(start)) continue;
    starts.add(start);
    const parts = byStart.get(start) ?? models.map(() => 0);
    parts[index.get(row.model || NO_MODEL) ?? models.length - 1] += row.costUsd;
    byStart.set(start, parts);
  }
  for (let at = Math.floor(range.from / bucketMs) * bucketMs; at <= range.to && starts.size < 500; at += bucketMs) starts.add(at);
  const buckets = [...starts].sort((a, b) => a - b).map((start): StackedBucket => {
    const parts = byStart.get(start) ?? models.map(() => 0);
    return { start, parts, total: parts.reduce((sum, value) => sum + value, 0) };
  });
  return { models, buckets, bucketMs };
}

/** Running total after each bucket. */
export function cumulative(values: number[]) {
  let sum = 0;
  return values.map((value) => (sum += value));
}

/** Change against the previous period in percent; null when there is nothing to compare with. */
export function changePercent(current: number, previous: number) {
  if (!(previous > 0)) return null;
  return ((current - previous) / previous) * 100;
}

/** Dollars per thousand tokens, or null when no tokens were recorded. */
export function costPerThousandTokens(costUsd: number, tokens: number) {
  return tokens > 0 ? (costUsd / tokens) * 1000 : null;
}
