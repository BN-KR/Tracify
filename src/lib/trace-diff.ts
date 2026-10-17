/** Pure helpers for the side-by-side run comparison: line steps up, total each side, bundle similar failures. */

export type DiffSpan = {
  spanId: string; parentSpanId?: string; spanType: string; toolName?: string; modelId?: string;
  latencyMs: number; costUsd: number; inputTokens?: number; outputTokens?: number;
  errorType?: string; errorMessage?: string; createdAt: string;
};

const TYPE_ALIASES: Record<string, string> = { llm_call: "llm", model: "llm", generation: "llm", tool_call: "tool", function: "tool" };
export const stepType = (span: Pick<DiffSpan, "spanType">) => {
  const type = (span.spanType || "span").toLowerCase();
  return TYPE_ALIASES[type] ?? type;
};
export const stepName = (span: Pick<DiffSpan, "toolName" | "modelId" | "spanType">) => span.toolName || span.modelId || span.spanType || "span";
export const stepKey = (span: DiffSpan) => `${stepType(span)}:${stepName(span)}`;
export const isFailed = (span: Pick<DiffSpan, "spanType" | "errorType">) => span.spanType === "error" || !!span.errorType;

/** Same rule as the server's error groups: ids, paths and numbers replaced so one failure groups together. */
export function errorSignature(span: Pick<DiffSpan, "toolName" | "modelId" | "errorType" | "errorMessage">) {
  const message = (span.errorMessage ?? "").slice(0, 600)
    .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, "<id>")
    .replace(/(~|\.{1,2})?(\/[^/\s"(),:;<>]+){2,}\/?/g, "<path>")
    .replace(/[0-9a-fA-F]{8,}/g, "<id>")
    .replace(/\d+(\.\d+)?/g, "<n>")
    .replace(/\s+/g, " ").trim().slice(0, 120);
  return { tool: span.toolName || span.modelId || "", type: span.errorType ?? "", message };
}

export type RunTotals = { steps: number; llm: number; tools: number; errors: number; costUsd: number; tokens: number; durationMs: number };

export function totals(spans: DiffSpan[]): RunTotals {
  const root = spans.filter((span) => !span.parentSpanId);
  const durationMs = root.length ? Math.max(...root.map((span) => span.latencyMs)) : Math.max(0, ...spans.map((span) => span.latencyMs));
  return {
    steps: spans.length, llm: spans.filter((span) => stepType(span) === "llm").length, tools: spans.filter((span) => stepType(span) === "tool").length,
    errors: spans.filter(isFailed).length, costUsd: spans.reduce((sum, span) => sum + span.costUsd, 0),
    tokens: spans.reduce((sum, span) => sum + (span.inputTokens ?? 0) + (span.outputTokens ?? 0), 0), durationMs,
  };
}

export type AlignedRow =
  | { kind: "same" | "changed"; a: DiffSpan; b: DiffSpan }
  | { kind: "onlyA"; a: DiffSpan; b?: undefined }
  | { kind: "onlyB"; a?: undefined; b: DiffSpan };

/**
 * Lines up two runs step by step (longest common run of the same type and name, in time order).
 * Matched steps are "changed" when one failed and the other did not, or latency differs by more than half.
 */
export function alignSteps(left: DiffSpan[], right: DiffSpan[]): AlignedRow[] {
  const byTime = (list: DiffSpan[]) => [...list].sort((x, y) => x.createdAt.localeCompare(y.createdAt) || x.spanId.localeCompare(y.spanId));
  const a = byTime(left), b = byTime(right);
  const table = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) {
    table[i]![j] = stepKey(a[i]!) === stepKey(b[j]!) ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
  }
  const rows: AlignedRow[] = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && stepKey(a[i]!) === stepKey(b[j]!)) {
      rows.push({ kind: differs(a[i]!, b[j]!) ? "changed" : "same", a: a[i]!, b: b[j]! }); i++; j++;
    } else if (j >= b.length || (i < a.length && table[i + 1]![j]! >= table[i]![j + 1]!)) rows.push({ kind: "onlyA", a: a[i++]! });
    else rows.push({ kind: "onlyB", b: b[j++]! });
  }
  return rows;
}

function differs(x: DiffSpan, y: DiffSpan) {
  if (isFailed(x) !== isFailed(y)) return true;
  const slow = Math.max(x.latencyMs, y.latencyMs), fast = Math.min(x.latencyMs, y.latencyMs);
  return slow > 200 && slow > fast * 1.5;
}

export type ErrorBundle = { id: string; tool: string; type: string; message: string; countA: number; countB: number; where: "both" | "onlyA" | "onlyB" };

/** Failures from both runs bundled by signature, so "the same timeout" shows once with a count per side. */
export function bundleErrors(left: DiffSpan[], right: DiffSpan[]): ErrorBundle[] {
  const map = new Map<string, ErrorBundle>();
  const add = (spans: DiffSpan[], side: "countA" | "countB") => {
    for (const span of spans.filter(isFailed)) {
      const sig = errorSignature(span);
      const id = JSON.stringify([sig.tool, sig.type, sig.message]);
      const entry = map.get(id) ?? { id, tool: sig.tool, type: sig.type, message: sig.message, countA: 0, countB: 0, where: "both" as const };
      entry[side]++; map.set(id, entry);
    }
  };
  add(left, "countA"); add(right, "countB");
  return [...map.values()].map((entry) => ({ ...entry, where: entry.countA && entry.countB ? "both" : entry.countA ? "onlyA" : "onlyB" } as ErrorBundle))
    .sort((x, y) => (y.countA + y.countB) - (x.countA + x.countB));
}

export type GroupRow = { key: string; runs: number; failedRuns: number; avgCostUsd: number; p50DurationMs: number; p95DurationMs: number; avgSteps: number };
export const MIN_SAMPLE = 5;

/** Which group is cheapest and which fails least, among groups with enough runs to mean something. */
export function pickWinners(rows: GroupRow[]) {
  const eligible = rows.filter((row) => row.runs >= MIN_SAMPLE);
  if (eligible.length < 2) return { cheapest: null, mostReliable: null, fastest: null };
  const best = (score: (row: GroupRow) => number) => eligible.reduce((top, row) => (score(row) < score(top) ? row : top)).key;
  return { cheapest: best((row) => row.avgCostUsd), mostReliable: best((row) => row.failedRuns / row.runs), fastest: best((row) => row.p50DurationMs) };
}
