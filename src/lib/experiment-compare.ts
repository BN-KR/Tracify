import { sameAnswer } from "./dataset-import.ts";

export type CompareItem = { _id: string; input: string; expectedOutput?: string };
export type CompareResult = { datasetItemId: string; output: string; error?: string; score?: number; latencyMs?: number; costUsd?: number };
export type Verdict = "same" | "better" | "worse" | "changed" | "missing";

export type Summary = { items: number; ran: number; failed: number; withExpected: number; matched: number; matchRate: number | null; avgScore: number | null; avgLatencyMs: number | null; costUsd: number };
export type CompareRow = { item: CompareItem; a: CompareResult | null; b: CompareResult | null; aMatch: boolean | null; bMatch: boolean | null; verdict: Verdict };

const byItem = (results: CompareResult[]) => {
  // A later result for the same item replaces an earlier one, as when a run is repeated.
  const map = new Map<string, CompareResult>();
  for (const result of results) map.set(result.datasetItemId, result);
  return map;
};
const matches = (item: CompareItem, result: CompareResult | null | undefined) => (!result || !item.expectedOutput ? null : result.error ? false : sameAnswer(result.output, item.expectedOutput));

export function summarise(items: CompareItem[], results: CompareResult[]): Summary {
  const latest = byItem(results);
  const ran = items.filter((item) => latest.has(item._id));
  const answered = ran.map((item) => latest.get(item._id)!);
  const withExpected = ran.filter((item) => item.expectedOutput);
  const matched = withExpected.filter((item) => matches(item, latest.get(item._id)) === true).length;
  const scored = answered.filter((result) => typeof result.score === "number");
  const timed = answered.filter((result) => typeof result.latencyMs === "number" && !result.error);
  return {
    items: items.length, ran: ran.length, failed: answered.filter((result) => result.error).length, withExpected: withExpected.length, matched,
    matchRate: withExpected.length ? matched / withExpected.length : null,
    avgScore: scored.length ? scored.reduce((sum, result) => sum + (result.score ?? 0), 0) / scored.length : null,
    avgLatencyMs: timed.length ? timed.reduce((sum, result) => sum + (result.latencyMs ?? 0), 0) / timed.length : null,
    costUsd: answered.reduce((sum, result) => sum + (result.costUsd ?? 0), 0),
  };
}

/** Lines up two runs of the same dataset row by row and says whether the candidate (b) did better, worse or just differently. */
export function compareRows(items: CompareItem[], aResults: CompareResult[], bResults: CompareResult[]): CompareRow[] {
  const a = byItem(aResults);
  const b = byItem(bResults);
  return items.map((item) => {
    const ra = a.get(item._id) ?? null;
    const rb = b.get(item._id) ?? null;
    const aMatch = matches(item, ra);
    const bMatch = matches(item, rb);
    let verdict: Verdict;
    if (!ra || !rb) verdict = "missing";
    else if (aMatch !== null && bMatch !== null && aMatch !== bMatch) verdict = bMatch ? "better" : "worse";
    else if (!!ra.error !== !!rb.error) verdict = rb.error ? "worse" : "better";
    else verdict = sameAnswer(ra.output, rb.output) && !ra.error ? "same" : "changed";
    return { item, a: ra, b: rb, aMatch, bMatch, verdict };
  });
}

export function verdictCounts(rows: CompareRow[]) {
  const counts = { same: 0, better: 0, worse: 0, changed: 0, missing: 0 };
  for (const row of rows) counts[row.verdict] += 1;
  return counts;
}
