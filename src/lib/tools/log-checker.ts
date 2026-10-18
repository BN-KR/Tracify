/**
 * Reads a pasted agent log or trace and says where it failed, which steps were
 * slow and where tokens were wasted. Everything runs in the browser.
 *
 * Accepted input: a JSON trace (a list of steps or spans, OpenTelemetry export,
 * a chat message list with tool calls), JSON lines, or plain text logs with or
 * without timestamps.
 */

import { heuristicTokens } from "./tokens.ts";

export type StepKind = "llm" | "tool" | "retrieval" | "agent" | "other";

export type Step = {
  index: number;
  name: string;
  kind: StepKind;
  status: "ok" | "error";
  error?: string;
  model?: string;
  startMs?: number;
  durationMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  /** True when the token numbers were guessed from text length rather than read from the log. */
  tokensEstimated?: boolean;
  /** Short fingerprint of the input, used to spot identical repeated calls. */
  inputKey?: string;
};

export type Severity = "problem" | "warning" | "tip";

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  /** What to try next, in plain words. */
  fix?: string;
  stepIndexes?: number[];
};

export type Analysis = {
  format: "json-trace" | "json-lines" | "messages" | "text-log" | "empty";
  steps: Step[];
  totals: {
    steps: number;
    errors: number;
    wallMs?: number;
    inputTokens: number;
    outputTokens: number;
    tokensEstimated: boolean;
    wastedTokens: number;
    llmCalls: number;
    toolCalls: number;
  };
  firstFailure?: Step;
  findings: Finding[];
  notes: string[];
};

const MAX_STEPS = 5000;
const MAX_INPUT = 4_000_000;

// ---------------------------------------------------------------- helpers

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function str(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return undefined;
}

function get(obj: Obj, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (!isObj(cur)) return undefined;
    cur = cur[part];
  }
  return cur;
}

function first(obj: Obj, paths: string[]): unknown {
  for (const p of paths) {
    const v = obj[p] !== undefined ? obj[p] : p.includes(".") ? get(obj, p) : undefined;
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

/** Turns an OpenTelemetry attribute list into a flat object. */
function flattenAttributes(attrs: unknown): Obj {
  const out: Obj = {};
  if (Array.isArray(attrs)) {
    for (const a of attrs) {
      if (!isObj(a) || typeof a.key !== "string") continue;
      const v = a.value;
      if (isObj(v)) out[a.key] = v.stringValue ?? v.intValue ?? v.doubleValue ?? v.boolValue ?? undefined;
      else out[a.key] = v;
    }
  } else if (isObj(attrs)) {
    Object.assign(out, attrs);
  }
  return out;
}

function parseTime(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "number") {
    if (v > 1e17) return v / 1e6; // nanoseconds
    if (v > 1e14) return v / 1e3; // microseconds
    if (v > 1e11) return v; // milliseconds
    if (v > 1e8) return v * 1000; // seconds
    return v; // relative milliseconds
  }
  if (typeof v === "string") {
    if (/^\d+$/.test(v.trim())) return parseTime(Number(v));
    const t = Date.parse(v);
    return Number.isNaN(t) ? undefined : t;
  }
  return undefined;
}

function fingerprint(v: unknown): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const text = typeof v === "string" ? v : safeStringify(v);
  return text.replace(/\s+/g, " ").trim().slice(0, 400);
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v) ?? "";
  } catch {
    return "";
  }
}

function kindFrom(name: string, hint: string | undefined, hasModel: boolean, hasTokens: boolean): StepKind {
  const h = `${hint ?? ""} ${name}`.toLowerCase();
  if (/(retriev|vector|embed|search|rag\b|rerank)/.test(h)) return "retrieval";
  if (/(\bllm\b|chat|completion|generat|model|gpt|claude|gemini|llama|response)/.test(h) || hasModel || hasTokens) {
    if (/\btool\b|function_call|tool_call|tool\./.test(h) && !hasModel && !hasTokens) return "tool";
    return "llm";
  }
  if (/(\btool\b|function|action|invoke|call_|api|http|fetch|sql|shell|exec|browser)/.test(h)) return "tool";
  if (/(agent|chain|workflow|graph|run\b|pipeline|supervisor|planner)/.test(h)) return "agent";
  return "other";
}

// ------------------------------------------------------- JSON step reading

const LIST_KEYS = ["steps", "spans", "events", "observations", "runs", "child_runs", "trace", "traces", "records", "logs", "items", "data", "calls", "messages", "intermediate_steps"];

function findStepList(root: unknown, depth = 0): unknown[] | undefined {
  if (Array.isArray(root)) return root;
  if (!isObj(root) || depth > 4) return undefined;
  // OpenTelemetry export
  if (Array.isArray(root.resourceSpans)) {
    const spans: unknown[] = [];
    for (const rs of root.resourceSpans) {
      if (!isObj(rs)) continue;
      for (const key of ["scopeSpans", "instrumentationLibrarySpans"]) {
        const scopes = rs[key];
        if (!Array.isArray(scopes)) continue;
        for (const sc of scopes) if (isObj(sc) && Array.isArray(sc.spans)) spans.push(...sc.spans);
      }
    }
    return spans;
  }
  for (const key of LIST_KEYS) {
    const v = root[key];
    if (Array.isArray(v) && v.length > 0 && v.some(isObj)) return v;
    if (isObj(v)) {
      const inner = findStepList(v, depth + 1);
      if (inner && inner.length > 0) return inner;
    }
  }
  // A single step object.
  if (first(root, ["name", "tool", "span_name", "type", "role"]) !== undefined) return [root];
  return undefined;
}

function isMessageList(list: unknown[]): boolean {
  const objs = list.filter(isObj);
  return objs.length > 0 && objs.filter((o) => typeof o.role === "string").length >= Math.ceil(objs.length * 0.8);
}

function errorFrom(o: Obj, attrs: Obj): string | undefined {
  const err = first(o, ["error", "exception", "error_message", "errorMessage", "err", "failure"]) ?? first(attrs, ["exception.message", "error.message", "error", "exception.type"]);
  if (err !== undefined && err !== false && err !== null) {
    if (isObj(err)) return str(err.message) ?? str(err.error) ?? str(err.type) ?? safeStringify(err).slice(0, 300);
    if (typeof err === "string") return err;
    if (err === true) return "Marked as an error";
  }
  const statusRaw = first(o, ["status", "state", "outcome", "result_status", "level", "severity"]);
  const status = isObj(statusRaw) ? (str(statusRaw.code) ?? str(statusRaw.status)) : str(statusRaw);
  if (status && /^(error|failed|failure|fail|exception|fatal|critical|2|STATUS_CODE_ERROR|timeout|timed_out|cancelled|canceled)$/i.test(status)) {
    return str(first(o, ["message", "status_message", "statusMessage", "detail"])) ?? (isObj(statusRaw) ? str(statusRaw.message) : undefined) ?? `Status: ${status}`;
  }
  const code = num(first(o, ["status_code", "statusCode", "http_status", "code"]));
  if (code !== undefined && code >= 400 && code < 600) return `HTTP ${code}${str(first(o, ["message", "reason"])) ? `: ${str(first(o, ["message", "reason"]))}` : ""}`;
  if (o.ok === false || o.success === false) return str(first(o, ["message", "reason"])) ?? "Reported as unsuccessful";
  return undefined;
}

function durationFrom(o: Obj, attrs: Obj, startMs: number | undefined, endMs: number | undefined): number | undefined {
  for (const key of ["duration_ms", "durationMs", "latency_ms", "latencyMs", "elapsed_ms", "elapsedMs", "time_ms", "ms"]) {
    const v = num(o[key] ?? attrs[key]);
    if (v !== undefined) return v;
  }
  for (const key of ["duration_s", "durationSeconds", "latency_s", "elapsed_s", "seconds", "elapsed", "elapsed_seconds"]) {
    const v = num(o[key] ?? attrs[key]);
    if (v !== undefined) return v * 1000;
  }
  const generic = num(o.duration ?? o.latency ?? attrs.duration);
  if (generic !== undefined) return generic; // documented: a bare "duration" is read as milliseconds
  if (startMs !== undefined && endMs !== undefined && endMs >= startMs) return endMs - startMs;
  return undefined;
}

function stepFromObject(o: Obj, index: number): Step {
  const attrs = flattenAttributes(o.attributes ?? o.metadata ?? o.extra);
  const usage = (isObj(o.usage) ? o.usage : isObj(o.token_usage) ? o.token_usage : isObj(o.usage_metadata) ? o.usage_metadata : isObj(attrs.usage) ? attrs.usage : {}) as Obj;
  const model = str(first(o, ["model", "model_name", "modelName", "llm.model", "gen_ai.request.model"]) ?? first(attrs, ["gen_ai.request.model", "llm.model_name", "model", "llm.model"]));
  const inTok = num(first(usage, ["prompt_tokens", "input_tokens", "inputTokens", "promptTokenCount", "prompt_token_count"]) ?? first(o, ["prompt_tokens", "input_tokens", "inputTokens", "tokens_in"]) ?? first(attrs, ["gen_ai.usage.input_tokens", "llm.token_count.prompt", "gen_ai.usage.prompt_tokens"]));
  const outTok = num(first(usage, ["completion_tokens", "output_tokens", "outputTokens", "candidatesTokenCount", "completion_token_count"]) ?? first(o, ["completion_tokens", "output_tokens", "outputTokens", "tokens_out"]) ?? first(attrs, ["gen_ai.usage.output_tokens", "llm.token_count.completion", "gen_ai.usage.completion_tokens"]));
  const totalTok = num(first(usage, ["total_tokens", "totalTokens", "totalTokenCount"]) ?? o.total_tokens ?? o.tokens ?? attrs["llm.token_count.total"]);
  const nameRaw = str(first(o, ["name", "span_name", "spanName", "tool", "tool_name", "toolName", "function", "operation", "operationName", "event", "action", "step", "type"])) ?? str(isObj(o.function) ? o.function.name : undefined) ?? "step";
  const name = nameRaw.slice(0, 120);
  const startMs = parseTime(first(o, ["startTimeUnixNano", "start_time", "startTime", "start", "started_at", "startedAt", "timestamp", "time", "ts", "created_at", "createdAt"]));
  const endMs = parseTime(first(o, ["endTimeUnixNano", "end_time", "endTime", "end", "ended_at", "endedAt", "finished_at"]));
  const durationMs = durationFrom(o, attrs, startMs, endMs);
  const hint = str(first(o, ["kind", "span_kind", "type", "run_type", "category", "observation_type"])) ?? str(attrs["openinference.span.kind"]) ?? str(attrs["gen_ai.operation.name"]);
  let inputTokens = inTok ?? (totalTok !== undefined && outTok !== undefined ? Math.max(0, totalTok - outTok) : undefined);
  let outputTokens = outTok ?? (totalTok !== undefined && inTok !== undefined ? Math.max(0, totalTok - inTok) : undefined);
  const kind = kindFrom(name, hint, !!model, inputTokens !== undefined || outputTokens !== undefined);
  const input = first(o, ["input", "inputs", "arguments", "args", "params", "parameters", "prompt", "query", "request"]);
  const output = first(o, ["output", "outputs", "result", "response", "content", "completion", "observation"]);
  let tokensEstimated = false;
  if (inputTokens === undefined && outputTokens === undefined && kind === "llm") {
    const inText = typeof input === "string" ? input : input ? safeStringify(input) : "";
    const outText = typeof output === "string" ? output : output ? safeStringify(output) : "";
    if (inText || outText) {
      inputTokens = inText ? heuristicTokens(inText) : undefined;
      outputTokens = outText ? heuristicTokens(outText) : undefined;
      tokensEstimated = true;
    }
  }
  const error = errorFrom(o, attrs);
  return {
    index,
    name,
    kind,
    status: error ? "error" : "ok",
    error: error?.slice(0, 400),
    model,
    startMs,
    durationMs,
    inputTokens,
    outputTokens,
    tokensEstimated,
    inputKey: fingerprint(input),
  };
}

function stepsFromMessages(list: unknown[]): Step[] {
  const steps: Step[] = [];
  const pending = new Map<string, number>();
  const push = (s: Omit<Step, "index">) => steps.push({ ...s, index: steps.length });
  for (const m of list) {
    if (!isObj(m)) continue;
    const role = str(m.role) ?? "";
    const content = typeof m.content === "string" ? m.content : Array.isArray(m.content) ? m.content.map((c) => (isObj(c) ? str(c.text) ?? "" : str(c) ?? "")).join(" ") : "";
    const calls = Array.isArray(m.tool_calls) ? m.tool_calls : [];
    const blocks = Array.isArray(m.content) ? m.content.filter(isObj) : [];
    if (role === "assistant") {
      const text = content;
      const outTokens = heuristicTokens(text + safeStringify(calls));
      const usage = isObj(m.usage) ? m.usage : undefined;
      push({ name: "assistant reply", kind: "llm", status: "ok", inputTokens: num(usage?.prompt_tokens ?? usage?.input_tokens), outputTokens: num(usage?.completion_tokens ?? usage?.output_tokens) ?? outTokens, tokensEstimated: !usage });
      for (const c of calls) {
        if (!isObj(c)) continue;
        const fn = isObj(c.function) ? c.function : c;
        const name = str(fn.name) ?? "tool call";
        const id = str(c.id);
        push({ name, kind: "tool", status: "ok", inputKey: fingerprint(fn.arguments ?? fn.input) });
        if (id) pending.set(id, steps.length - 1);
      }
      for (const b of blocks) {
        if (b.type === "tool_use") {
          push({ name: str(b.name) ?? "tool call", kind: "tool", status: "ok", inputKey: fingerprint(b.input) });
          if (str(b.id)) pending.set(String(b.id), steps.length - 1);
        }
      }
    } else if (role === "tool" || role === "function") {
      const id = str(m.tool_call_id);
      const at = id !== undefined ? pending.get(id) : undefined;
      const err = looksLikeErrorText(content) ? content.slice(0, 300) : undefined;
      if (at !== undefined && err) {
        steps[at].status = "error";
        steps[at].error = err;
      } else if (at === undefined) {
        push({ name: str(m.name) ?? "tool result", kind: "tool", status: err ? "error" : "ok", error: err });
      }
    } else if (role === "user") {
      for (const b of blocks) {
        if (b.type === "tool_result") {
          const id = str(b.tool_use_id);
          const at = id !== undefined ? pending.get(id) : undefined;
          const text = typeof b.content === "string" ? b.content : Array.isArray(b.content) ? b.content.map((c) => (isObj(c) ? str(c.text) ?? "" : "")).join(" ") : "";
          if (at !== undefined && (b.is_error === true || looksLikeErrorText(text))) {
            steps[at].status = "error";
            steps[at].error = (text || "Tool reported an error").slice(0, 300);
          }
        }
      }
    }
  }
  return steps;
}

function looksLikeErrorText(text: string): boolean {
  return /^\s*(error|exception|traceback|failed|fatal)\b|"error"\s*:|\b(timed? ?out|rate limit|not found|unauthorized|forbidden|invalid|exceeded)\b/i.test(text.slice(0, 400));
}

// ------------------------------------------------------------ text logs

const TS_RE = /^\s*\[?(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d{1,9})?(?:Z|[+-]\d{2}:?\d{2})?|\d{2}:\d{2}:\d{2}(?:[.,]\d{1,6})?)\]?\s*[-:|]?\s*/;

function parseLineTime(raw: string): number | undefined {
  const t = raw.replace(",", ".");
  if (/^\d{2}:/.test(t)) {
    const [h, m, s] = t.split(":");
    return (Number(h) * 3600 + Number(m) * 60 + Number(s)) * 1000;
  }
  const iso = t.replace(" ", "T");
  const ms = Date.parse(/(Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(ms) ? undefined : ms;
}

const ERROR_LINE = /\b(error|exception|traceback|fatal|failed|failure|timed? ?out|timeout|refused|denied|unauthorized|forbidden|rate.?limit|429|500|502|503|504|invalid|exceeded|overloaded)\b/i;
const NOT_ERROR_LINE = /\b(0 errors|no errors?|error[s]? (?:count|rate)\s*[:=]\s*0|retry(?:ing)? (?:succeeded|ok)|recovered)\b/i;

function stepsFromText(text: string): Step[] {
  const lines = text.split(/\r?\n/);
  const steps: Step[] = [];
  let inTrace = false;
  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    // Indented lines under a Python traceback belong to the previous error.
    if (/^\s+(File "|at |\.\.\.|raise |\w+Error)/.test(rawLine) && steps.length > 0 && inTrace) {
      const prev = steps[steps.length - 1];
      if (/^\s*\w*(Error|Exception)\b[:\s]/.test(rawLine.trim()) || /^\w+(Error|Exception)/.test(rawLine.trim())) prev.error = rawLine.trim().slice(0, 300);
      continue;
    }
    inTrace = false;
    const tsMatch = rawLine.match(TS_RE);
    const startMs = tsMatch ? parseLineTime(tsMatch[1]) : undefined;
    const body = (tsMatch ? rawLine.slice(tsMatch[0].length) : rawLine).trim();
    if (!body) continue;
    if (/^Traceback \(most recent call last\)/.test(body)) inTrace = true;
    const isError = (ERROR_LINE.test(body) && !NOT_ERROR_LINE.test(body)) || /^(ERROR|CRITICAL|FATAL)\b/.test(body) || inTrace;
    const toolMatch = body.match(/\b(?:tool(?:[_ ]call)?|calling tool|invoke(?:d)?|using tool|action|function(?:[_ ]call)?)\s*[:=]?\s*[`'"]?([A-Za-z_][\w.-]{1,60})/i);
    const modelMatch = body.match(/\b(gpt-[\w.-]+|claude-[\w.-]+|gemini-[\w.-]+|llama-?[\w.-]*|mistral-[\w.-]+|o[34](?:-mini)?)\b/i);
    const tokenMatch = body.match(/(\d[\d,]*)\s*(?:prompt|input)\s*tokens?[^\d]{0,40}(\d[\d,]*)\s*(?:completion|output)\s*tokens?/i) ?? body.match(/(?:prompt|input)[_ ]tokens?\s*[:=]\s*(\d[\d,]*)[^\d]{1,20}(?:completion|output)[_ ]tokens?\s*[:=]\s*(\d[\d,]*)/i);
    const durMatch = body.match(/\b(?:took|in|duration|elapsed|latency)[:=\s]+(\d+(?:\.\d+)?)\s*(ms|s|sec|seconds|milliseconds)\b/i);
    const name = toolMatch ? toolMatch[1] : modelMatch ? modelMatch[1] : body.replace(/^\[?(?:INFO|DEBUG|WARN(?:ING)?|ERROR|TRACE|CRITICAL|FATAL)\]?\s*[-:|]?\s*/i, "").slice(0, 60);
    steps.push({
      index: steps.length,
      name,
      kind: toolMatch ? "tool" : modelMatch || tokenMatch ? "llm" : "other",
      status: isError ? "error" : "ok",
      error: isError ? body.slice(0, 300) : undefined,
      model: modelMatch?.[1],
      startMs,
      durationMs: durMatch ? Number(durMatch[1]) * (/^m/i.test(durMatch[2]) ? 1 : 1000) : undefined,
      inputTokens: tokenMatch ? Number(tokenMatch[1].replace(/,/g, "")) : undefined,
      outputTokens: tokenMatch ? Number(tokenMatch[2].replace(/,/g, "")) : undefined,
      inputKey: toolMatch ? body.slice(toolMatch.index! + toolMatch[0].length).trim().slice(0, 300) || undefined : undefined,
    });
    if (steps.length >= MAX_STEPS) break;
  }
  // When lines carry timestamps, a line lasts until the next one starts.
  for (let i = 0; i < steps.length - 1; i++) {
    const a = steps[i];
    const b = steps[i + 1];
    if (a.durationMs === undefined && a.startMs !== undefined && b.startMs !== undefined && b.startMs >= a.startMs) a.durationMs = b.startMs - a.startMs;
  }
  return steps;
}

// ---------------------------------------------------------------- analysis

export type ErrorClass = { id: string; label: string; fix: string };

const ERROR_CLASSES: Array<ErrorClass & { test: RegExp }> = [
  { id: "context", label: "The prompt was too long for the model", test: /context[_ ]length|maximum context|too many tokens|token limit|prompt is too long|input is too long|exceeds? the (?:model'?s )?(?:context|limit)/i, fix: "Trim the history, summarise older turns or retrieve fewer chunks. Check how large the prompt grew just before this step." },
  { id: "rate", label: "A rate limit was hit", test: /\b429\b|rate.?limit|too many requests|quota|insufficient_quota|tokens per min|requests per min/i, fix: "Slow down or queue calls, retry with growing waits, and compare your usage with the limits on your provider dashboard." },
  { id: "timeout", label: "A call timed out", test: /timed? ?out|timeout|deadline exceeded|ETIMEDOUT|took too long/i, fix: "Raise the timeout only if the work is really slow. Otherwise shorten the prompt, cut the output length or split the step." },
  { id: "auth", label: "Credentials were rejected", test: /\b401\b|\b403\b|unauthori[sz]ed|forbidden|invalid api key|incorrect api key|permission denied|authentication/i, fix: "Check the API key in this environment, its project and whether it may use this model or tool." },
  { id: "overloaded", label: "The provider was overloaded or down", test: /\b50[0234]\b|overloaded|service unavailable|bad gateway|internal server error|temporarily unavailable|ECONNRESET|ECONNREFUSED|ENOTFOUND|socket hang up|network/i, fix: "Retry with a short wait and add a fallback model. Check the provider status page for an incident." },
  { id: "schema", label: "The model output or tool input was not valid", test: /json|schema|validation|parse|malformed|unexpected token|missing (?:required )?(?:field|argument|parameter)|invalid (?:argument|parameter|input|tool)|pydantic/i, fix: "Tighten the tool definition, add an example and return the exact validation error to the model so it can correct itself once." },
  { id: "tool-missing", label: "The agent called a tool that does not exist", test: /unknown tool|tool .* not found|no such tool|unknown function|function .* not found|not a valid tool/i, fix: "Make tool names exact and unique, and list only the tools that are really available on this call." },
  { id: "filter", label: "A safety filter blocked the reply", test: /content[_ ]filter|content policy|safety|blocked|refus(?:ed|al)|cannot assist/i, fix: "Look at the prompt and the retrieved text that triggered it. Rephrase, or handle the refusal as its own outcome." },
  { id: "not-found", label: "Something the agent looked for was missing", test: /not found|\b404\b|no such file|does not exist|ENOENT/i, fix: "Check the id, path or URL the agent used, and make tools say clearly when a lookup has no result." },
];

export function classifyError(text: string | undefined): ErrorClass | undefined {
  if (!text) return undefined;
  const hit = ERROR_CLASSES.find((c) => c.test.test(text));
  return hit ? { id: hit.id, label: hit.label, fix: hit.fix } : undefined;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function formatMs(ms: number | undefined): string {
  if (ms === undefined || !Number.isFinite(ms)) return "—";
  if (ms < 1) return "<1 ms";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
  const m = Math.floor(ms / 60_000);
  return `${m} min ${Math.round((ms % 60_000) / 1000)} s`;
}

function stepLabel(s: Step) {
  return `step ${s.index + 1} (${s.name})`;
}

export function analyzeLog(raw: string): Analysis {
  const empty: Analysis = {
    format: "empty",
    steps: [],
    totals: { steps: 0, errors: 0, inputTokens: 0, outputTokens: 0, tokensEstimated: false, wastedTokens: 0, llmCalls: 0, toolCalls: 0 },
    findings: [],
    notes: [],
  };
  const notes: string[] = [];
  let text = raw ?? "";
  if (!text.trim()) return empty;
  if (text.length > MAX_INPUT) {
    text = text.slice(0, MAX_INPUT);
    notes.push("The paste was very large, so only the first 4 MB was read.");
  }

  let format: Analysis["format"] = "text-log";
  let steps: Step[] = [];
  const trimmed = text.trim().replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "");

  const parsed = tryJson(trimmed);
  if (parsed.ok) {
    const list = findStepList(parsed.value);
    if (list && isMessageList(list)) {
      format = "messages";
      steps = stepsFromMessages(list);
    } else if (list) {
      format = "json-trace";
      steps = list.filter(isObj).slice(0, MAX_STEPS).map((o, i) => stepFromObject(o, i));
      if (list.length > MAX_STEPS) notes.push(`Only the first ${MAX_STEPS} steps were read.`);
    }
  } else {
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
    const objs: unknown[] = [];
    let allJson = lines.length > 1;
    for (const line of lines) {
      const v = tryJson(line.trim());
      if (!v.ok || !isObj(v.value)) {
        allJson = false;
        break;
      }
      objs.push(v.value);
    }
    if (allJson) {
      format = "json-lines";
      steps = objs.filter(isObj).slice(0, MAX_STEPS).map((o, i) => stepFromObject(o, i));
    }
  }
  if (steps.length === 0) {
    if (parsed.ok) {
      return { ...empty, notes: [...notes, "This is valid JSON, but it does not look like a trace. Paste a list of steps or spans, or a chat message list with tool calls."] };
    }
    steps = stepsFromText(trimmed);
    format = "text-log";
    const only = steps[0];
    if (steps.length === 1 && only.kind === "other" && only.status === "ok" && only.startMs === undefined) steps = [];
  }
  if (steps.length === 0) return { ...empty, notes: [...notes, "Nothing in this paste looked like a step or a log line."] };

  steps = steps.map((s, i) => ({ ...s, index: i }));

  // Makes relative start times start at zero for display and for wall time.
  const starts = steps.map((s) => s.startMs).filter((v): v is number => v !== undefined);
  const ends = steps.map((s) => (s.startMs !== undefined && s.durationMs !== undefined ? s.startMs + s.durationMs : s.startMs)).filter((v): v is number => v !== undefined);
  const wallMs = starts.length > 0 && ends.length > 0 ? Math.max(...ends) - Math.min(...starts) : undefined;

  const errors = steps.filter((s) => s.status === "error");
  const findings: Finding[] = [];
  const firstFailure = errors[0];

  // ---- failures
  if (firstFailure) {
    const cls = classifyError(firstFailure.error);
    const after = steps.length - firstFailure.index - 1;
    findings.push({
      id: "first-failure",
      severity: "problem",
      title: `First failure at ${stepLabel(firstFailure)}`,
      detail: `${cls ? cls.label + ". " : ""}${firstFailure.error ? `The log says: “${firstFailure.error.slice(0, 220)}”. ` : ""}${after > 0 ? `${after} more step${after === 1 ? "" : "s"} ran after it.` : "It was the last step."}`,
      fix: cls?.fix ?? "Open this step and check its input and the exact error message. Return clear errors from tools so the agent can recover.",
      stepIndexes: [firstFailure.index],
    });
    const groups = new Map<string, Step[]>();
    for (const e of errors.slice(1)) {
      const key = classifyError(e.error)?.id ?? "other";
      groups.set(key, [...(groups.get(key) ?? []), e]);
    }
    for (const [key, list] of groups) {
      const cls = ERROR_CLASSES.find((c) => c.id === key);
      findings.push({
        id: `more-errors-${key}`,
        severity: "warning",
        title: `${list.length} more failed step${list.length === 1 ? "" : "s"}${cls ? `: ${cls.label.toLowerCase()}` : ""}`,
        detail: list.slice(0, 4).map((s) => stepLabel(s)).join(", ") + (list.length > 4 ? ` and ${list.length - 4} more` : "") + ".",
        fix: cls?.fix,
        stepIndexes: list.map((s) => s.index),
      });
    }
  }

  // ---- slow steps
  const timed = steps.filter((s) => s.durationMs !== undefined && s.durationMs > 0);
  const totalTimed = timed.reduce((a, s) => a + (s.durationMs ?? 0), 0);
  if (timed.length >= 3 && totalTimed > 0) {
    const med = median(timed.map((s) => s.durationMs ?? 0));
    const slow = [...timed]
      .filter((s) => (s.durationMs ?? 0) >= med * 2 && (s.durationMs ?? 0) / totalTimed >= 0.15)
      .sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0))
      .slice(0, 3);
    for (const s of slow) {
      const share = Math.round(((s.durationMs ?? 0) / totalTimed) * 100);
      findings.push({
        id: `slow-${s.index}`,
        severity: share >= 40 ? "warning" : "tip",
        title: `Slow: ${stepLabel(s)} took ${formatMs(s.durationMs)}`,
        detail: `That is about ${share}% of all timed work and ${Math.round((s.durationMs ?? 0) / Math.max(med, 1))}× the typical step.`,
        fix: s.kind === "llm" ? "Shorten the prompt, cap the output length, use a smaller model for this step, or stream the answer." : s.kind === "tool" ? "Check what this tool waits on. Run independent tool calls in parallel and cache repeated lookups." : "Look at what this step waits on, and whether it can run alongside other steps.",
        stepIndexes: [s.index],
      });
    }
  } else if (timed.length === 0) {
    notes.push("No timings were found, so slow steps could not be checked. Add start and end times or a duration to each step.");
  }

  // ---- repeated identical calls
  const seen = new Map<string, Step[]>();
  for (const s of steps) {
    if (s.kind === "other" || !s.inputKey) continue;
    const key = `${s.kind}|${s.name}|${s.inputKey}`;
    seen.set(key, [...(seen.get(key) ?? []), s]);
  }
  let wastedTokens = 0;
  const wastedSteps = new Set<number>();
  for (const [, list] of seen) {
    if (list.length < 2) continue;
    const dup = list.slice(1);
    const wasted = dup.reduce((a, s) => a + (s.inputTokens ?? 0) + (s.outputTokens ?? 0), 0);
    dup.forEach((s) => wastedSteps.add(s.index));
    wastedTokens += wasted;
    findings.push({
      id: `repeat-${list[0].index}`,
      severity: list.length >= 3 ? "warning" : "tip",
      title: `${list[0].name} was called ${list.length} times with the same input`,
      detail: `Steps ${list.map((s) => s.index + 1).slice(0, 8).join(", ")}${list.length > 8 ? "…" : ""}. ${wasted > 0 ? `The repeats used about ${wasted.toLocaleString("en-US")} tokens.` : "Repeats cost time and money and usually mean the agent is stuck."}`,
      fix: "Cache the result inside the run, tell the agent what it already tried, and stop after two identical calls.",
      stepIndexes: list.map((s) => s.index),
    });
  }

  // ---- retries after errors and tokens spent on failed steps
  for (const e of errors) {
    if (wastedSteps.has(e.index)) continue;
    const spent = (e.inputTokens ?? 0) + (e.outputTokens ?? 0);
    if (spent > 0) {
      wastedTokens += spent;
      wastedSteps.add(e.index);
    }
  }
  const retryRuns: Step[][] = [];
  for (let i = 1; i < steps.length; i++) {
    if (steps[i - 1].status === "error" && steps[i].name === steps[i - 1].name && steps[i].kind !== "other") {
      const last = retryRuns[retryRuns.length - 1];
      if (last && last[last.length - 1].index === i - 1) last.push(steps[i]);
      else retryRuns.push([steps[i - 1], steps[i]]);
    }
  }
  for (const run of retryRuns) {
    if (run.length >= 3) {
      findings.push({
        id: `retry-${run[0].index}`,
        severity: "warning",
        title: `${stepLabel(run[0])} was retried ${run.length - 1} times`,
        detail: "Several attempts in a row at the same step. Each retry spends time, and for model calls, tokens.",
        fix: "Cap retries at two or three, wait longer between them, and change something (a shorter prompt, another model) rather than repeating the same call.",
        stepIndexes: run.map((s) => s.index),
      });
    }
  }

  // ---- loop of the same steps
  const loop = detectLoop(steps);
  if (loop) {
    findings.push({
      id: "loop",
      severity: "warning",
      title: `The agent looped: “${loop.pattern.join(" → ")}” ran ${loop.times} times in a row`,
      detail: `From step ${loop.start + 1} to step ${loop.end + 1}. Loops are the most common reason one run costs far more than the rest.`,
      fix: "Set a hard cap on steps, detect that the last results did not change and stop, and give the agent a clear way to say it is done or stuck.",
      stepIndexes: Array.from({ length: loop.end - loop.start + 1 }, (_, i) => loop.start + i),
    });
  }

  // ---- context growth
  const llm = steps.filter((s) => s.kind === "llm" && s.inputTokens !== undefined);
  if (llm.length >= 3) {
    const firstIn = llm[0].inputTokens ?? 0;
    const lastIn = llm[llm.length - 1].inputTokens ?? 0;
    if (firstIn > 0 && lastIn >= firstIn * 2 && lastIn - firstIn >= 1000) {
      const total = llm.reduce((a, s) => a + (s.inputTokens ?? 0), 0);
      findings.push({
        id: "context-growth",
        severity: "warning",
        title: `The prompt grew from ${firstIn.toLocaleString("en-US")} to ${lastIn.toLocaleString("en-US")} tokens`,
        detail: `Every model call re-sends the whole history, so input added up to ${total.toLocaleString("en-US")} tokens across ${llm.length} calls.`,
        fix: "Summarise older turns, drop tool output the agent no longer needs, and keep the start of the prompt identical so a prompt cache can reuse it.",
        stepIndexes: [llm[0].index, llm[llm.length - 1].index],
      });
    }
  }

  // ---- very large single outputs
  const hungry = [...steps].filter((s) => (s.outputTokens ?? 0) >= 4000).sort((a, b) => (b.outputTokens ?? 0) - (a.outputTokens ?? 0)).slice(0, 2);
  for (const s of hungry) {
    findings.push({
      id: `big-output-${s.index}`,
      severity: "tip",
      title: `${stepLabel(s)} wrote ${(s.outputTokens ?? 0).toLocaleString("en-US")} tokens`,
      detail: "Output tokens cost several times more than input tokens.",
      fix: "Ask for a shorter format, set a maximum output length, or have tools return only the fields the agent needs.",
      stepIndexes: [s.index],
    });
  }

  const inputTokens = steps.reduce((a, s) => a + (s.inputTokens ?? 0), 0);
  const outputTokens = steps.reduce((a, s) => a + (s.outputTokens ?? 0), 0);
  const tokensEstimated = steps.some((s) => s.tokensEstimated && (s.inputTokens !== undefined || s.outputTokens !== undefined));
  if (inputTokens + outputTokens === 0) notes.push("No token counts were found, so token waste could not be measured. Log prompt and completion tokens on each model call.");
  if (tokensEstimated) notes.push("Some token numbers were estimated from text length because the log did not include them.");

  if (findings.length === 0) {
    findings.push({
      id: "clean",
      severity: "tip",
      title: "No failures, loops or wasted calls found",
      detail: `${steps.length} step${steps.length === 1 ? "" : "s"} were read and nothing stood out.`,
    });
  }
  const order: Record<Severity, number> = { problem: 0, warning: 1, tip: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    format,
    steps,
    totals: {
      steps: steps.length,
      errors: errors.length,
      wallMs,
      inputTokens,
      outputTokens,
      tokensEstimated,
      wastedTokens,
      llmCalls: steps.filter((s) => s.kind === "llm").length,
      toolCalls: steps.filter((s) => s.kind === "tool").length,
    },
    firstFailure,
    findings,
    notes,
  };
}

function tryJson(text: string): { ok: true; value: unknown } | { ok: false } {
  const t = text.trim();
  if (!t || (t[0] !== "{" && t[0] !== "[")) return { ok: false };
  try {
    return { ok: true, value: JSON.parse(t) };
  } catch {
    return { ok: false };
  }
}

/** Finds a short pattern of steps repeated at least three times back to back. */
function detectLoop(steps: Step[]): { pattern: string[]; times: number; start: number; end: number } | undefined {
  const names = steps.map((s) => s.name);
  let best: { pattern: string[]; times: number; start: number; end: number } | undefined;
  for (let size = 1; size <= 4; size++) {
    for (let start = 0; start + size * 3 <= names.length; start++) {
      let times = 1;
      while (start + (times + 1) * size <= names.length && names.slice(start, start + size).every((n, k) => n === names[start + times * size + k])) times++;
      if (times >= 3) {
        const unique = new Set(names.slice(start, start + size));
        if (size > 1 && unique.size === 1) continue; // covered by the size 1 case
        const covered = times * size;
        if (!best || covered > best.times * best.pattern.length) best = { pattern: names.slice(start, start + size), times, start, end: start + covered - 1 };
      }
    }
  }
  // A plain alternation like search → read → search → read is normal for two repeats, so we ask for three.
  return best;
}
