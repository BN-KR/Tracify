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
