/** Pure helpers for the Scores page: filtering, per-name summaries and display text. */

export type ScoreValue = number | boolean | string;
export type ScoreRow = {
  _id: string; name: string; value: ScoreValue; dataType: "numeric" | "boolean" | "categorical" | "text";
  source: "human" | "llm" | "code" | "user"; traceId?: string; spanId?: string; comment?: string; createdBy: string; createdAt: number;
};
export type ScoreFilters = { q?: string; name?: string; source?: string; type?: string; since?: number };

export const SCORE_RANGES = [
  { id: "24h", label: "24 hours", ms: 86_400_000 }, { id: "7d", label: "7 days", ms: 7 * 86_400_000 },
  { id: "30d", label: "30 days", ms: 30 * 86_400_000 }, { id: "all", label: "All loaded", ms: 0 },
] as const;

export function filterScores(rows: ScoreRow[], filters: ScoreFilters): ScoreRow[] {
  const needle = filters.q?.trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.since && row.createdAt < filters.since) return false;
    if (filters.name && row.name !== filters.name) return false;
    if (filters.source && row.source !== filters.source) return false;
    if (filters.type && row.dataType !== filters.type) return false;
    if (!needle) return true;
    return [row.name, row.traceId, row.spanId, row.comment, String(row.value)].some((part) => part?.toLowerCase().includes(needle));
  });
}

export type NameSummary = {
  name: string; count: number; dataType: ScoreRow["dataType"]; mixed: boolean; latestAt: number; sources: string[];
  average: number | null; min: number | null; max: number | null; passRate: number | null; top: Array<{ value: string; count: number }>;
  /** Daily average (or pass rate) for the last 14 days, oldest first; null for days with no scores. */
  trend: Array<number | null>;
};

const DAY = 86_400_000;

export function summariseByName(rows: ScoreRow[], now: number): NameSummary[] {
  const groups = new Map<string, ScoreRow[]>();
  for (const row of rows) groups.set(row.name, [...(groups.get(row.name) ?? []), row]);
  const today = Math.floor(now / DAY);
  return [...groups.entries()].map(([name, items]) => {
    const kinds = new Map<string, number>();
    for (const item of items) kinds.set(item.dataType, (kinds.get(item.dataType) ?? 0) + 1);
    const dataType = [...kinds.entries()].sort((a, b) => b[1] - a[1])[0][0] as ScoreRow["dataType"];
    const numeric = items.flatMap((item) => (item.dataType === "numeric" && typeof item.value === "number" ? [item.value] : []));
    const booleans = items.flatMap((item) => (item.dataType === "boolean" && typeof item.value === "boolean" ? [item.value] : []));
    const counts = new Map<string, number>();
    if (dataType === "categorical" || dataType === "text") for (const item of items) counts.set(String(item.value), (counts.get(String(item.value)) ?? 0) + 1);
    const trend = Array.from({ length: 14 }, (_, index) => {
      const day = today - 13 + index;
      const inDay = items.filter((item) => Math.floor(item.createdAt / DAY) === day);
      if (dataType === "numeric") { const values = inDay.flatMap((item) => (typeof item.value === "number" ? [item.value] : [])); return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null; }
      if (dataType === "boolean") { const values = inDay.flatMap((item) => (typeof item.value === "boolean" ? [item.value] : [])); return values.length ? values.filter(Boolean).length / values.length : null; }
      return inDay.length ? inDay.length : null;
    });
    return {
      name, count: items.length, dataType, mixed: kinds.size > 1, latestAt: Math.max(...items.map((item) => item.createdAt)), sources: [...new Set(items.map((item) => item.source))].sort(),
      average: numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : null, min: numeric.length ? Math.min(...numeric) : null, max: numeric.length ? Math.max(...numeric) : null,
      passRate: booleans.length ? booleans.filter(Boolean).length / booleans.length : null,
      top: [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3).map(([value, count]) => ({ value, count })),
      trend,
    };
  }).sort((a, b) => b.latestAt - a.latestAt);
}

export function formatScoreValue(value: ScoreValue): string {
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  if (typeof value === "boolean") return value ? "true" : "false";
  return value.length > 60 ? `${value.slice(0, 57)}…` : value;
}

/** Turns what someone typed into the value for a score type, or an error in plain words. */
export function parseScoreInput(type: ScoreRow["dataType"], input: string): { value: ScoreValue } | { error: string } {
  const text = input.trim();
  if (type === "numeric") {
    if (!text) return { error: "Enter a number." };
    const number = Number(text);
    return Number.isFinite(number) ? { value: number } : { error: "That is not a number." };
  }
  if (type === "boolean") {
    if (/^(true|yes|pass|1)$/i.test(text)) return { value: true };
    if (/^(false|no|fail|0)$/i.test(text)) return { value: false };
    return { error: "Choose true or false." };
  }
  if (!text) return { error: type === "categorical" ? "Enter a category." : "Enter some text." };
  return text.length > 1000 ? { error: "Use at most 1,000 characters." } : { value: text };
}

export const SOURCE_TEXT: Record<string, string> = { human: "Human", llm: "AI judge", code: "Code rule", user: "App / API" };

export type DayPoint = { start: number; count: number; value: number | null };
export type Series = { kind: "numeric" | "boolean" | "categorical"; days: DayPoint[]; overall: number | null; total: number };

/** One point per day, oldest first. Numeric scores give the day's mean, yes/no scores the share of true, categories the day's count. */
export function dailySeries(rows: ScoreRow[], name: string, now: number, days: number): Series {
  const mine = rows.filter((row) => row.name === name);
  const kinds = new Map<string, number>();
  for (const row of mine) kinds.set(row.dataType, (kinds.get(row.dataType) ?? 0) + 1);
  const top = [...kinds.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "numeric";
  const kind = top === "numeric" ? "numeric" : top === "boolean" ? "boolean" : "categorical";
  const today = Math.floor(now / DAY);
  const points: DayPoint[] = Array.from({ length: days }, (_, index) => {
    const day = today - (days - 1) + index;
    const inDay = mine.filter((row) => Math.floor(row.createdAt / DAY) === day);
    let value: number | null = null;
    if (kind === "numeric") { const values = inDay.flatMap((row) => (typeof row.value === "number" ? [row.value] : [])); value = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null; }
    else if (kind === "boolean") { const values = inDay.flatMap((row) => (typeof row.value === "boolean" ? [row.value] : [])); value = values.length ? values.filter(Boolean).length / values.length : null; }
    else value = inDay.length ? inDay.length : null;
    return { start: day * DAY, count: inDay.length, value };
  });
  const inWindow = mine.filter((row) => { const day = Math.floor(row.createdAt / DAY); return day >= today - (days - 1) && day <= today; });
  let overall: number | null = null;
  if (kind === "numeric") { const values = inWindow.flatMap((row) => (typeof row.value === "number" ? [row.value] : [])); overall = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null; }
  else if (kind === "boolean") { const values = inWindow.flatMap((row) => (typeof row.value === "boolean" ? [row.value] : [])); overall = values.length ? values.filter(Boolean).length / values.length : null; }
  else overall = inWindow.length || null;
  return { kind, days: points, overall, total: inWindow.length };
}

/** Compares the last `days` days with the `days` before them. `change` is null when either side has no scores. */
export function periodChange(rows: ScoreRow[], name: string, now: number, days: number): { current: number | null; previous: number | null; change: number | null } {
  const current = dailySeries(rows, name, now, days).overall;
  const previous = dailySeries(rows, name, now - days * DAY, days).overall;
  return { current, previous, change: current !== null && previous !== null ? current - previous : null };
}

export type Bucket = { from: number; to: number; count: number };

/** Equal-width buckets over the data's own range (a single value gets one bucket). */
export function histogram(values: number[], buckets = 10): Bucket[] {
  if (!values.length) return [];
  const lo = Math.min(...values); const hi = Math.max(...values);
  if (lo === hi) return [{ from: lo, to: hi, count: values.length }];
  const width = (hi - lo) / buckets;
  const out: Bucket[] = Array.from({ length: buckets }, (_, index) => ({ from: lo + index * width, to: lo + (index + 1) * width, count: 0 }));
  for (const value of values) out[Math.min(buckets - 1, Math.floor((value - lo) / width))].count += 1;
  return out;
}

/** The scores most worth a look: false yes/no scores and the lowest numbers (judged against each name's own range), newest first within ties. */
export function needsAttention(rows: ScoreRow[], limit = 6): ScoreRow[] {
  const ranges = new Map<string, { lo: number; hi: number }>();
  for (const row of rows) if (row.dataType === "numeric" && typeof row.value === "number") { const range = ranges.get(row.name) ?? { lo: row.value, hi: row.value }; ranges.set(row.name, { lo: Math.min(range.lo, row.value), hi: Math.max(range.hi, row.value) }); }
  const badness = (row: ScoreRow): number | null => {
    if (row.dataType === "boolean" && row.value === false) return 0;
    if (row.dataType === "numeric" && typeof row.value === "number") { const range = ranges.get(row.name)!; return range.hi === range.lo ? null : (row.value - range.lo) / (range.hi - range.lo); }
    return null;
  };
  const ranked = rows.flatMap((row) => { const score = badness(row); return score !== null && score <= 0.25 ? [{ row, score }] : []; })
    .sort((a, b) => a.score - b.score || b.row.createdAt - a.row.createdAt);
  // At most two per score name, so one noisy score cannot fill the list.
  const perName = new Map<string, number>();
  const picked: ScoreRow[] = [];
  for (const { row } of ranked) {
    const used = perName.get(row.name) ?? 0;
    if (used >= 2) continue;
    perName.set(row.name, used + 1);
    picked.push(row);
    if (picked.length === limit) break;
  }
  return picked;
}
