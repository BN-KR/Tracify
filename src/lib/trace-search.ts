/**
 * The Tracing search box understands `field:value` tokens next to plain text, for example
 * `model:gpt-5 status:error latency:>2s timeout`. Known tokens become the same filters the sidebar sets;
 * everything else stays full-text search. Exclusions (`-env:dev`) and maximums are not supported yet.
 */

export type SearchFieldKind = "facet" | "status" | "latency" | "cost";
export type SearchField = {
  /** What the suggestions insert, e.g. `model:`. */
  token: string;
  aliases: string[];
  /** The URL / filter key it sets. */
  key: string;
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
  { token: "latency", aliases: ["latency", "duration"], key: "minLatencyMs", label: "Latency", hint: "At least, e.g. >2s or >500ms", kind: "latency" },
  { token: "cost", aliases: ["cost"], key: "minCostUsd", label: "Cost", hint: "At least, in USD, e.g. >0.01", kind: "cost" },
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
export function splitToken(raw: string): { field: SearchField; value: string } | null {
  const colon = raw.indexOf(":");
  if (colon <= 0) return null;
  const field = fieldFor(raw.slice(0, colon));
  return field ? { field, value: unquote(raw.slice(colon + 1)) } : null;
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

/** `>2s`, `>=500ms`, `2` (milliseconds) -> milliseconds. */
export function parseLatency(value: string): number | null {
  const match = /^(?:>=?)?\s*(\d+(?:\.\d+)?)\s*(ms|s|m)?$/i.exec(value.trim());
  if (!match) return null;
  const unit = (match[2] ?? "ms").toLowerCase();
  const amount = Number(match[1]) * (unit === "m" ? 60_000 : unit === "s" ? 1000 : 1);
  return Number.isFinite(amount) ? Math.round(amount) : null;
}

/** `>0.01`, `$0.01`, `0.5` -> USD. */
export function parseCost(value: string): number | null {
  const match = /^(?:>=?)?\s*\$?\s*(\d+(?:\.\d+)?)$/.exec(value.trim());
  const amount = match ? Number(match[1]) : NaN;
  return Number.isFinite(amount) ? amount : null;
}

export type ParsedFilter =
  | { field: SearchField; kind: "facet"; value: string }
  | { field: SearchField; kind: "status"; value: "error" | "healthy" | "all" }
  | { field: SearchField; kind: "latency" | "cost"; value: number };

export type SearchParse = { filters: ParsedFilter[]; text: string; errors: string[] };

export function parseSearch(text: string): SearchParse {
  const filters: ParsedFilter[] = [];
  const rest: string[] = [];
  const errors: string[] = [];
  for (const token of tokenize(text)) {
    const split = splitToken(token.raw);
    if (!split || !split.value) { rest.push(token.raw); continue; }
    const { field, value } = split;
    if (field.kind === "facet") filters.push({ field, kind: "facet", value });
    else if (field.kind === "status") {
      const lower = value.toLowerCase();
      const status = lower === "error" || lower === "errors" ? "error" : lower === "healthy" || lower === "ok" ? "healthy" : lower === "all" ? "all" : null;
      if (status) filters.push({ field, kind: "status", value: status }); else errors.push(`status must be error or healthy, not “${value}”.`);
    } else if (field.kind === "latency") {
      const amount = parseLatency(value);
      if (amount === null) errors.push(`latency needs a number such as >2s or >500ms, not “${value}”.`); else filters.push({ field, kind: "latency", value: amount });
    } else {
      const amount = parseCost(value);
      if (amount === null) errors.push(`cost needs a number such as >0.01, not “${value}”.`); else filters.push({ field, kind: "cost", value: amount });
    }
  }
  return { filters, text: rest.join(" "), errors };
}
