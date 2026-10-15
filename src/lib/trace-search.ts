/**
 * The Tracing search box understands `field:value` tokens next to plain text, for example
 * `model:gpt-5 status:error latency:>2s timeout`. Known tokens become the same filters the sidebar sets;
 * everything else stays full-text search. A leading `-` excludes (`-env:dev`), and latency, cost and tokens take
 * `>`, `>=`, `<`, `<=` and `=` (`latency:<2s`, `cost:>=0.01`, `tokens:<=10k`); a bare number means "at least".
 * Bounds are inclusive.
 */

/** URL prefix of an exclusion: `not_environment=dev` drops traces with a dev step. */
export const EXCLUDE_PREFIX = "not_";

export type SearchFieldKind = "facet" | "status" | "latency" | "cost" | "tokens";
export type SearchField = {
  /** What the suggestions insert, e.g. `model:`. */
  token: string;
  aliases: string[];
  /** The URL / filter key it sets (the minimum, for numeric fields). */
  key: string;
  /** Numeric fields only: the URL / filter key for the maximum. */
  maxKey?: string;
  label: string;
  hint: string;
  kind: SearchFieldKind;
};

export const SEARCH_FIELDS: SearchField[] = [
  { token: "name", aliases: ["name", "trace"], key: "traceName", label: "Trace name", hint: "The agent or flow name", kind: "facet" },
  { token: "type", aliases: ["type", "step"], key: "spanType", label: "Step type", hint: "agent, llm, tool…", kind: "facet" },
  { token: "tool", aliases: ["tool"], key: "toolName", label: "Tool", hint: "A tool a step used", kind: "facet" },
  { token: "model", aliases: ["model"], key: "modelId", label: "Model", hint: "A model a step called", kind: "facet" },
  { token: "error", aliases: ["error", "errortype"], key: "errorType", label: "Error type", hint: "Type of a failed step", kind: "facet" },
  { token: "env", aliases: ["env", "environment"], key: "environment", label: "Environment", hint: "For example production", kind: "facet" },
  { token: "release", aliases: ["release", "version"], key: "release", label: "Release", hint: "Deployed version", kind: "facet" },
  { token: "user", aliases: ["user", "userid"], key: "endUserId", label: "User", hint: "End user id", kind: "facet" },
  { token: "session", aliases: ["session"], key: "sessionId", label: "Session", hint: "Session id", kind: "facet" },
  { token: "tag", aliases: ["tag"], key: "tag", label: "Tag", hint: "A label on the trace", kind: "facet" },
  { token: "status", aliases: ["status"], key: "status", label: "Status", hint: "error or healthy", kind: "status" },
  { token: "latency", aliases: ["latency", "duration"], key: "minLatencyMs", label: "Latency", maxKey: "maxLatencyMs", hint: "e.g. >2s, <500ms", kind: "latency" },
  { token: "cost", aliases: ["cost"], key: "minCostUsd", maxKey: "maxCostUsd", label: "Cost", hint: "In USD, e.g. >0.01, <0.5", kind: "cost" },
  { token: "tokens", aliases: ["tokens"], key: "minTokens", maxKey: "maxTokens", label: "Tokens", hint: "Input + output, e.g. >5k, <200", kind: "tokens" },
];

export function fieldFor(name: string) {
  const lower = name.toLowerCase();
  return SEARCH_FIELDS.find((field) => field.aliases.includes(lower));
}

export type SearchToken = { raw: string; start: number; end: number };

/** Words split on whitespace; a double-quoted run keeps its spaces (`name:"my agent"`). */
export function tokenize(text: string): SearchToken[] {
  const tokens: SearchToken[] = [];
  let start = -1;
  let quoted = false;
  for (let index = 0; index <= text.length; index++) {
    const char = text[index];
    if (index < text.length && char === '"') quoted = !quoted;
    const boundary = index === text.length || (!quoted && /\s/.test(char!));
    if (boundary) {
      if (start >= 0) tokens.push({ raw: text.slice(start, index), start, end: index });
      start = -1;
    } else if (start < 0) {
      start = index;
    }
  }
  return tokens;
}

export const unquote = (value: string) => value.replace(/^"/, "").replace(/"$/, "");

/** The `field` and `value` of a `field:value` token whose field is known; value may be empty while typing. */
export function splitToken(raw: string): { field: SearchField; value: string; negate: boolean } | null {
  const negate = raw.startsWith("-");
  const body = negate ? raw.slice(1) : raw;
  const colon = body.indexOf(":");
  if (colon <= 0) return null;
  const field = fieldFor(body.slice(0, colon));
  return field ? { field, value: unquote(body.slice(colon + 1)), negate } : null;
}

/** The token the caret is in or directly after, or null when the caret sits in whitespace. */
export function tokenAt(text: string, caret: number): SearchToken | null {
  return tokenize(text).find((token) => caret >= token.start && caret <= token.end) ?? null;
}

/** Replace one token (or insert at the caret when there is none) and say where the caret should go. */
export function replaceToken(text: string, token: SearchToken | null, replacement: string, caret: number) {
  const start = token?.start ?? caret, end = token?.end ?? caret;
  const before = text.slice(0, start), after = text.slice(end);
  const next = `${before}${replacement}${after}`.replace(/\s{2,}/g, " ").replace(/^\s+/, "");
  const position = Math.min(next.length, before.replace(/\s{2,}/g, " ").replace(/^\s+/, "").length + replacement.length);
  return { text: next, caret: position };
}

const OPERATOR = /^(>=|<=|>|<|=)?\s*/;

/** `>2s`, `<=500ms`, `2` (milliseconds) -> milliseconds. The operator is read by `parseComparison`. */
export function parseLatency(value: string): number | null {
  const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m)?$/i.exec(value.trim().replace(OPERATOR, ""));
  if (!match) return null;
  const unit = (match[2] ?? "ms").toLowerCase();
  const amount = Number(match[1]) * (unit === "m" ? 60_000 : unit === "s" ? 1000 : 1);
  return Number.isFinite(amount) ? Math.round(amount) : null;
}

/** `>0.01`, `$0.01`, `0.5` -> USD. */
export function parseCost(value: string): number | null {
  const match = /^\$?\s*(\d+(?:\.\d+)?)$/.exec(value.trim().replace(OPERATOR, ""));
  const amount = match ? Number(match[1]) : NaN;
  return Number.isFinite(amount) ? amount : null;
}

/** `>5k`, `<=1200`, `1.5m` -> a whole number of tokens. */
export function parseTokens(value: string): number | null {
  const match = /^(\d+(?:\.\d+)?)\s*(k|m)?$/i.exec(value.trim().replace(OPERATOR, ""));
  if (!match) return null;
  const amount = Number(match[1]) * ((match[2] ?? "").toLowerCase() === "m" ? 1_000_000 : (match[2] ?? "") ? 1000 : 1);
  return Number.isFinite(amount) ? Math.round(amount) : null;
}

export type NumericBound = "min" | "max" | "exact";

/** `>`/`>=` and a bare number are a minimum, `<`/`<=` a maximum, `=` both. */
export function comparisonBound(value: string): NumericBound {
  const operator = OPERATOR.exec(value.trim())?.[1];
  return operator === "<" || operator === "<=" ? "max" : operator === "=" ? "exact" : "min";
}

export type ParsedFilter =
  | { field: SearchField; kind: "facet"; value: string; negate: boolean }
  | { field: SearchField; kind: "status"; value: "error" | "healthy" | "all" }
  | { field: SearchField; kind: "latency" | "cost" | "tokens"; bound: NumericBound; value: number };

export type SearchParse = { filters: ParsedFilter[]; text: string; errors: string[] };

const NUMERIC_HELP = { latency: "latency needs a number such as >2s or <500ms", cost: "cost needs a number such as >0.01 or <0.5", tokens: "tokens needs a number such as >5k or <200" } as const;

export function parseSearch(text: string): SearchParse {
  const filters: ParsedFilter[] = [];
  const rest: string[] = [];
  const errors: string[] = [];
  for (const token of tokenize(text)) {
    const split = splitToken(token.raw);
    if (!split || !split.value) { rest.push(token.raw); continue; }
    const { field, value, negate } = split;
    if (field.kind === "facet") filters.push({ field, kind: "facet", value, negate });
    else if (field.kind === "status") {
      const lower = value.toLowerCase();
      const status = lower === "error" || lower === "errors" ? "error" : lower === "healthy" || lower === "ok" ? "healthy" : lower === "all" ? "all" : null;
      // `-status:error` is the same as `status:healthy`; `-status:all` would match nothing, so it is rejected.
      const flipped = status && negate ? (status === "error" ? "healthy" : status === "healthy" ? "error" : null) : status;
      if (flipped) filters.push({ field, kind: "status", value: flipped }); else errors.push(`status must be error or healthy, not “${value}”.`);
    } else if (negate) {
      errors.push(`${field.token} cannot be excluded; use a comparison such as ${field.token}:<${field.kind === "latency" ? "2s" : field.kind === "cost" ? "0.5" : "200"} instead.`);
    } else {
      const amount = field.kind === "latency" ? parseLatency(value) : field.kind === "cost" ? parseCost(value) : parseTokens(value);
      if (amount === null) errors.push(`${NUMERIC_HELP[field.kind]}, not “${value}”.`);
      else filters.push({ field, kind: field.kind, bound: comparisonBound(value), value: amount });
    }
  }
  return { filters, text: rest.join(" "), errors };
}
