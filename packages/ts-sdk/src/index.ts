import { AsyncLocalStorage } from "node:async_hooks";

export interface TracifyConfig {
  apiKey?: string;
  host?: string;
  /** Tracify Cloud data region. Ignored when `host` is provided. Defaults to TRACIFY_REGION or EU. */
  region?: TracifyRegion;
  projectId?: string;
  /** Release and environment are copied onto observations created by this client. */
  release?: string;
  environment?: string;
  deploymentId?: string;
  sessionId?: string;
  endUserId?: string;
  tags?: string[];
}

export type TracifyRegion = "eu" | "us";

export const TRACIFY_REGION_HOSTS: Record<TracifyRegion, string> = {
  eu: "https://eu.cloud.tracify.tech",
  us: "https://us.cloud.tracify.tech",
};

function parseRegion(value: string | undefined): TracifyRegion | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized === "eu" || normalized === "us" ? normalized : undefined;
}

function apiKeyRegion(apiKey: string): TracifyRegion | undefined {
  if (apiKey.startsWith("tracify_sk_live_eu_")) return "eu";
  if (apiKey.startsWith("tracify_sk_live_us_")) return "us";
  if (apiKey.startsWith("tracify_sk_live_")) return "eu";
  return undefined;
}

export interface SpanData {
  spanId?: string;
  runId?: string;
  spanType: string;
  input?: any;
  output?: any;
  latencyMs?: number;
  costUsd?: number;
  modelId?: string;
  toolName?: string;
  metadata?: Record<string, any>;
  parentSpanId?: string;
  sessionId?: string;
  endUserId?: string;
  deploymentId?: string;
  environment?: string;
  release?: string;
  tags?: string[];
  traceName?: string;
  inputTokens?: number;
  outputTokens?: number;
  ttftMs?: number;
  retryCount?: number;
  errorType?: string;
  errorMessage?: string;
  isStreamChunk?: boolean;
  streamSequence?: number;
  streamFinal?: boolean;
  payloadFormat?: string;
  createdAt?: string;
  promptVersionId?: string;
}

export interface PromptResolution {
  prompt: { id: string; name: string; description?: string; type: "text" | "chat" };
  version: { id: string; version: number; content: string; variables: string[]; labels: string[]; model?: string; createdAt: number };
}

export interface PromptResolutionOptions {
  cacheTtlMs?: number;
  fallback?: PromptResolution;
}

export interface RuntimePolicy {
  enforcementMode: "observe" | "enforce";
  maxCostPerRun?: number;
  maxCostPerDay?: number;
  fallbackChain: string[];
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
    backoffMultiplier: number;
    retryableErrors: string[];
  };
  latencyBudgetMs?: number;
}

export interface OrchestrateOptions<T> {
  policy: RuntimePolicy;
  call: (model: string, signal: AbortSignal) => Promise<T>;
  model: string;
  input?: any;
  calculateCost?: (result: T, model: string) => number;
  runId?: string;
}

/**
 * The current run and step for this async call chain. AsyncLocalStorage keeps concurrent runs apart, so steps
 * from two agents running at once never land in each other's trace.
 */
const stepContext = new AsyncLocalStorage<{ runId: string; spanId?: string; traceName?: string; client?: TracifyClient }>();

export function currentRunId() {
  return stepContext.getStore()?.runId || process.env.TRACIFY_CURRENT_RUN_ID || 'unknown';
}

export function currentTraceContext() { return stepContext.getStore(); }
export function integrationPayload(value: unknown) { return payload(value); }

export function currentSpanId() {
  return stepContext.getStore()?.spanId;
}

export const MAX_PAYLOAD_CHARS = 10_000;
const SECRET_PATTERNS: RegExp[] = [
  /\bbearer\s+[a-z0-9._~+/=-]{12,}/gi,
  /\b(?:sk|pk|rk)[-_](?:live|test|proj|ant)?[-_]?[A-Za-z0-9_-]{16,}/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
];
const SECRET_FIELD = /((?:api[_-]?key|password|secret|token)["']?\s*[:=]\s*["']?)[^\s"',}]{6,}/gi;

/** Serialise an input or output, remove obvious secrets and cap its size. */
function payload(value: unknown): string {
  if (value === undefined || value === null) return '';
  let text: string;
  if (typeof value === 'string') text = value;
  else {
    try { text = JSON.stringify(value); } catch { text = String(value); }
  }
  for (const pattern of SECRET_PATTERNS) text = text.replace(pattern, '[redacted]');
  text = text.replace(SECRET_FIELD, '$1[redacted]');
  return text.length > MAX_PAYLOAD_CHARS ? `${text.slice(0, MAX_PAYLOAD_CHARS)}… [truncated ${text.length - MAX_PAYLOAD_CHARS} chars]` : text;
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `span_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError") return false; // AbortError is never retryable
  const msg = error.message.toLowerCase();
  const name = (error as any).name?.toLowerCase?.() ?? "";
  const status = (error as any).status ?? (error as any).statusCode ?? 0;

  for (const code of retryableErrors) {
    switch (code) {
      case "timeout":
        if (msg.includes("timeout") || msg.includes("timed out") || name === "timeouterror") return true;
        break;
      case "5xx":
        if (status >= 500 && status < 600) return true;
        break;
      case "429":
        if (status === 429 || msg.includes("rate limit") || msg.includes("too many requests")) return true;
        break;
      case "rate_limit":
        if (status === 429 || msg.includes("rate limit") || msg.includes("throttl")) return true;
        break;
      case "overloaded":
        if (msg.includes("overloaded") || msg.includes("capacity") || msg.includes("busy")) return true;
        break;
    }
  }
  return false;
}

function isLatencyAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export class TracifyClient {
  protected apiKey: string;
  protected host: string;
  protected ingestUrl: string;
  protected projectId?: string;
  private checkCostUrl: string;
  private _lastFailOpen: boolean = false;
  private promptCache = new Map<string, { value: PromptResolution; expiresAt: number }>();
  private release?: string;
  private environment?: string;
  private deploymentId?: string;
  private sessionId?: string;
  private endUserId?: string;
  private tags?: string[];

  constructor(config: TracifyConfig = {}) {
    this.apiKey = config.apiKey || process.env.TRACIFY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Tracify Warning: TRACIFY_API_KEY is not set');
    }
    const configuredRegion = config.region ?? parseRegion(process.env.TRACIFY_REGION) ?? "eu";
    this.host = (config.host || process.env.TRACIFY_HOST || TRACIFY_REGION_HOSTS[configuredRegion]).replace(/\/$/, '');
    const selectedHostRegion = Object.entries(TRACIFY_REGION_HOSTS).find(([, host]) => host === this.host)?.[0] as TracifyRegion | undefined;
    const keyRegion = apiKeyRegion(this.apiKey);
    if (keyRegion && selectedHostRegion && keyRegion !== selectedHostRegion) {
      throw new Error(`Tracify API key region mismatch: this key belongs to ${keyRegion.toUpperCase()}, but the client is configured for ${selectedHostRegion.toUpperCase()}.`);
    }
    this.projectId = config.projectId;
    this.release = config.release;
    this.environment = config.environment;
    this.deploymentId = config.deploymentId;
    this.sessionId = config.sessionId;
    this.endUserId = config.endUserId;
    this.tags = config.tags;
    this.ingestUrl = `${this.host}/api/ingest`;
    this.checkCostUrl = `${this.host}/api/orchestration/check-cost`;
  }

  async ingest(data: SpanData) {
    if (!this.apiKey) return;

    const context = stepContext.getStore();
    const spanId = data.spanId || createId();
    const parentSpanId = data.parentSpanId || (context?.spanId && context.spanId !== spanId ? context.spanId : undefined);
    const span = {
      ...data,
      spanId,
      runId: data.runId || currentRunId(),
      traceName: data.traceName ?? context?.traceName,
      parentSpanId,
      createdAt: data.createdAt || new Date().toISOString(),
      metadata: data.metadata || {},
      input: payload(data.input),
      output: payload(data.output),
      release: data.release ?? this.release,
      environment: data.environment ?? this.environment,
      deploymentId: data.metadata?.deploymentId ?? this.deploymentId,
      sessionId: data.sessionId ?? this.sessionId,
      endUserId: data.endUserId ?? this.endUserId,
      tags: data.tags ?? this.tags,
    };

    try {
      fetch(this.ingestUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(span),
      }).catch(err => console.warn('Tracify Warning: Failed to ingest span:', err));
    } catch {
      // Ignore errors in telemetry
    }
  }

  /** Resolve a prompt version labeled for an environment without redeploying application code. */
  async getPrompt(name: string, environment = "production", options: PromptResolutionOptions = {}): Promise<PromptResolution> {
    if (!this.apiKey) throw new Error("A Tracify API key is required to resolve prompts");
    const key = `${name}:${environment}`;
    const cached = this.promptCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    try {
      const response = await fetch(`${this.host}/api/prompts/${encodeURIComponent(name)}?environment=${encodeURIComponent(environment)}`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Prompt resolution failed (${response.status})`);
      const value = data as PromptResolution;
      this.promptCache.set(key, { value, expiresAt: Date.now() + (options.cacheTtlMs ?? 60_000) });
      return value;
    } catch (error) {
      if (cached) return cached.value;
      if (options.fallback) return options.fallback;
      throw error;
    }
  }

  /** Attach end-user feedback to a trace or span. The request is fire-and-forget like span ingestion. */
  feedback(traceId: string, value: boolean | number | string, options: { kind?: 'thumb' | 'star' | 'text'; spanId?: string; reason?: string; comment?: string; endUserId?: string; dedupeKey?: string; projectId?: string } = {}) {
    if (!this.apiKey || !(options.projectId || this.projectId)) return;
    fetch(`${this.host}/api/feedback`, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: options.projectId || this.projectId, traceId, spanId: options.spanId, kind: options.kind || (typeof value === 'number' ? 'star' : typeof value === 'boolean' ? 'thumb' : 'text'), value, reason: options.reason, comment: options.comment, endUserId: options.endUserId, dedupeKey: options.dedupeKey }) }).catch((error) => console.warn('Tracify Warning: Failed to record feedback:', error));
  }

  /** Attach a typed score to a trace or span through the feedback API. */
  score(traceId: string, name: string, value: boolean | number | string, options: { dataType?: 'numeric' | 'boolean' | 'categorical' | 'text'; spanId?: string; comment?: string; projectId?: string } = {}) {
    if (!this.apiKey || !(options.projectId || this.projectId)) return;
    fetch(`${this.host}/api/feedback`, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: options.projectId || this.projectId, traceId, spanId: options.spanId, kind: 'text', name, value, dataType: options.dataType, comment: options.comment }) }).catch((error) => console.warn('Tracify Warning: Failed to record score:', error));
  }

  /**
   * Server-side cost check. Returns the server's decision on whether
   * the next call would exceed the ceiling.
   */
  private async checkCost(runId: string, incrementUsd: number): Promise<{
    allowed: boolean;
    reason?: string;
    currentCost?: number;
    ceiling?: number;
  }> {
    try {
      const res = await fetch(this.checkCostUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ runId, incrementUsd }),
      });

      if (!res.ok) {
        this._lastFailOpen = true;
        return { allowed: true, reason: "check_failed" };
      }

      this._lastFailOpen = false;
      return await res.json();
    } catch {
      this._lastFailOpen = true;
      return { allowed: true, reason: "network_error" };
    }
  }

  async orchestrate<T>(options: OrchestrateOptions<T>): Promise<T> {
    const { policy, call, model, input, calculateCost, runId: explicitRunId } = options;
    const runId = explicitRunId || stepContext.getStore()?.runId || process.env.TRACIFY_CURRENT_RUN_ID || createId();
    const allModels = [model, ...policy.fallbackChain.filter((m) => m !== model)];

    let lastError: unknown = null;

    for (let modelIndex = 0; modelIndex < allModels.length; modelIndex++) {
      const currentModel = allModels[modelIndex];
      const isFallback = modelIndex > 0;
      const fallbackReason = isFallback
        ? lastError
          ? isLatencyAbort(lastError) ? "latency_budget" : "provider_error"
          : "cost_ceiling"
        : undefined;

      const maxAttempts = isFallback ? 1 : (policy.retryPolicy.maxAttempts + 1);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const spanId = createId();
        const startTime = Date.now();

        // Server-side cost ceiling enforcement (shared across all instances)
        if (policy.enforcementMode === "enforce") {
          const estimatedCost = calculateCost ? 0.01 : 0; // Estimate before call; actual cost reported after

          if (policy.maxCostPerRun !== undefined) {
            const check = await this.checkCost(runId, estimatedCost);
            if (!check.allowed && check.reason === "maxCostPerRun") {
              this.ingest({
                spanId,
                runId,
                spanType: "llm_call",
                input,
                output: JSON.stringify({ blocked: true, reason: "cost_ceiling" }),
                modelId: currentModel,
                costUsd: 0,
                latencyMs: 0,
                metadata: {
                  orchestrationBlocked: true,
                  orchestrationReason: "cost_ceiling",
                  orchestrationAttempt: attempt,
                  orchestrationModel: currentModel,
                  orchestrationOriginalModel: model,
                  orchestrationServerCost: check.currentCost,
                  orchestrationCeiling: check.ceiling,
                  orchestrationFailOpen: this._lastFailOpen,
                  orchestrationPolicy: JSON.stringify(policy),
                },
              });
              if (modelIndex < allModels.length - 1) {
                lastError = new Error(`Cost ceiling reached: $${check.currentCost?.toFixed(4)} >= $${check.ceiling}`);
                break;
              }
              throw new Error(`Cost ceiling reached: $${check.currentCost?.toFixed(4)} >= $${check.ceiling}`);
            }
          }

          if (policy.maxCostPerDay !== undefined) {
            const check = await this.checkCost(runId, estimatedCost);
            if (!check.allowed && check.reason === "maxCostPerDay") {
              this.ingest({
                spanId,
                runId,
                spanType: "llm_call",
                input,
                output: JSON.stringify({ blocked: true, reason: "daily_cost_ceiling" }),
                modelId: currentModel,
                costUsd: 0,
                latencyMs: 0,
                metadata: {
                  orchestrationBlocked: true,
                  orchestrationReason: "daily_cost_ceiling",
                  orchestrationAttempt: attempt,
                  orchestrationModel: currentModel,
                  orchestrationOriginalModel: model,
                  orchestrationServerCost: check.currentCost,
                  orchestrationCeiling: check.ceiling,
                  orchestrationFailOpen: this._lastFailOpen,
                  orchestrationPolicy: JSON.stringify(policy),
                },
              });
              if (modelIndex < allModels.length - 1) {
                lastError = new Error(`Daily cost ceiling reached: $${check.currentCost?.toFixed(4)} >= $${check.ceiling}`);
                break;
              }
              throw new Error(`Daily cost ceiling reached: $${check.currentCost?.toFixed(4)} >= $${check.ceiling}`);
            }
          }
        }

        // Latency budget enforcement via AbortController
        const controller = new AbortController();
        let latencyTimer: ReturnType<typeof setTimeout> | undefined;

        if (policy.latencyBudgetMs !== undefined && policy.enforcementMode === "enforce") {
          latencyTimer = setTimeout(() => controller.abort(), policy.latencyBudgetMs);
        }

        try {
          const result = await call(currentModel, controller.signal);
          const latencyMs = Date.now() - startTime;
          const costUsd = calculateCost ? calculateCost(result, currentModel) : 0;

          if (latencyTimer) clearTimeout(latencyTimer);

          // Report actual cost to server
          if (policy.enforcementMode === "enforce" && costUsd > 0) {
            await this.checkCost(runId, costUsd);
          }

          this.ingest({
            spanId,
            runId,
            spanType: "llm_call",
            input,
            output: result,
            modelId: currentModel,
            costUsd,
            latencyMs,
            metadata: {
              orchestrationAttempt: attempt,
              orchestrationModel: currentModel,
              orchestrationOriginalModel: model,
              orchestrationIsFallback: isFallback,
              orchestrationFallbackReason: fallbackReason ?? null,
              orchestrationFinal: true,
              orchestrationFailOpen: this._lastFailOpen,
              orchestrationPolicy: JSON.stringify(policy),
            },
          });

          return result;
        } catch (error) {
          const latencyMs = Date.now() - startTime;
          if (latencyTimer) clearTimeout(latencyTimer);
          lastError = error;

          const retryable = isRetryableError(error, policy.retryPolicy.retryableErrors);
          const isLastAttempt = attempt === maxAttempts;
          const wasLatencyAbort = isLatencyAbort(error);

          this.ingest({
            spanId,
            runId,
            spanType: retryable && !isLastAttempt ? "llm_call" : "error",
            input,
            output: error instanceof Error ? error.message : String(error),
            modelId: currentModel,
            costUsd: 0,
            latencyMs,
            metadata: {
              orchestrationAttempt: attempt,
              orchestrationModel: currentModel,
              orchestrationOriginalModel: model,
              orchestrationIsFallback: isFallback,
              orchestrationFallbackReason: fallbackReason ?? null,
              orchestrationError: true,
              orchestrationLatencyAbort: wasLatencyAbort,
              orchestrationRetryable: retryable,
              orchestrationWillRetry: retryable && !isLastAttempt,
              orchestrationFailOpen: this._lastFailOpen,
              orchestrationPolicy: JSON.stringify(policy),
            },
          });

          if (retryable && !isLastAttempt) {
            const delay = policy.retryPolicy.backoffMs * Math.pow(policy.retryPolicy.backoffMultiplier, attempt - 1);
            await sleep(delay);
            continue;
          }

          break;
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error("All fallback models exhausted");
  }
}


export type StepType = 'agent' | 'llm' | 'tool' | 'retrieval' | 'span' | (string & {});

/** A step in progress. Set its output and anything it measured before it ends. */
export class Step {
  readonly id = createId();
  output: unknown;
  metadata: Record<string, any>;
  fields: Partial<Pick<SpanData, 'modelId' | 'inputTokens' | 'outputTokens' | 'costUsd'>> = {};

  constructor(readonly name: string, readonly type: StepType, readonly input?: unknown, metadata?: Record<string, any>) {
    this.metadata = { ...(metadata ?? {}) };
  }

  setOutput(output: unknown) {
    this.output = output;
    return this;
  }

  /** Record what the step measured; anything not listed goes into metadata. */
  set({ model, inputTokens, outputTokens, costUsd, ...metadata }: { model?: string; inputTokens?: number; outputTokens?: number; costUsd?: number; [key: string]: any }) {
    if (model !== undefined) this.fields.modelId = model;
    if (inputTokens !== undefined) this.fields.inputTokens = inputTokens;
    if (outputTokens !== undefined) this.fields.outputTokens = outputTokens;
    if (costUsd !== undefined) this.fields.costUsd = costUsd;
    Object.assign(this.metadata, metadata);
    return this;
  }
}

export interface StepOptions {
  type?: StepType;
  input?: unknown;
  metadata?: Record<string, any>;
  client?: TracifyClient;
  /** Start a new run with this id (used by traceAgent). */
  runId?: string;
  /** Send this step as the run's end (run_end or error), which marks the run completed or failed. */
  root?: boolean;
}

let defaultClientInstance: TracifyClient | undefined;
function defaultClient() {
  return (defaultClientInstance ??= new TracifyClient());
}

/**
 * Record one step of the agent. Steps started inside `fn` become its children, so the trace shows which step
 * called which. The step ends when `fn` settles; its return value is the output unless one was set.
 *
 *     const docs = await span("search-docs", (step) => search(query), { type: "tool", input: query });
 */
export async function span<T>(name: string, fn: (step: Step) => T | Promise<T>, options: StepOptions = {}): Promise<T> {
  const step = new Step(name, options.type ?? 'span', options.input, options.metadata);
  const parent = stepContext.getStore();
  const runId = options.runId || parent?.runId || currentRunId();
  const started = Date.now();
  const finish = (error?: unknown) => {
    const failed = error !== undefined;
    (options.client ?? parent?.client ?? defaultClient()).ingest({
      spanId: step.id,
      runId,
      parentSpanId: options.root ? undefined : parent?.spanId,
      spanType: options.root ? (failed ? 'error' : 'run_end') : step.type,
      toolName: step.name,
      input: step.input,
      output: failed ? (error instanceof Error ? error.message : String(error)) : step.output,
      latencyMs: Date.now() - started,
      costUsd: 0,
      createdAt: new Date(started).toISOString(),
      metadata: options.root ? { ...step.metadata, stepType: step.type } : step.metadata,
      ...step.fields,
      ...(failed ? {
        errorType: error instanceof Error ? error.name : 'Error',
        errorMessage: payload(error instanceof Error ? error.message : String(error)),
      } : {}),
    });
  };
  return stepContext.run({ runId, spanId: step.id, traceName: options.root ? name : parent?.traceName, client: options.client ?? parent?.client }, async () => {
    try {
      const result = await fn(step);
      if (step.output === undefined) step.setOutput(result);
      finish();
      return result;
    } catch (error) {
      finish(error ?? new Error('Unknown error'));
      throw error;
    }
  });
}

/** Wrap a function so each call is recorded as a step, with its arguments and result. */
export function observe<A extends any[], R>(fn: (...args: A) => R | Promise<R>, options: StepOptions & { name?: string; captureInput?: boolean } = {}) {
  const name = options.name || fn.name || 'step';
  return (...args: A): Promise<R> =>
    span(name, () => fn(...args), { ...options, input: options.captureInput === false ? undefined : args });
}

/**
 * Wrap an agent's entry point. Each call is one trace: a new run id, and a root step that every step recorded
 * inside it hangs from. The root is sent as run_end (or error) when the call settles.
 */
export function traceAgent<T extends (...args: any[]) => Promise<any>>(
  func: T,
  config: TracifyConfig & { name?: string } = {}
): T {
  const client = new TracifyClient(config);
  const name = config.name || func.name || 'agent';
  return ((...args: any[]) => span(name, () => func(...args), { type: 'agent', client, runId: createId(), root: true })) as T;
}

/** Record a finished model call. It is attached to the step it was made in. */
export const llmCall = (data: Omit<SpanData, 'spanType'>) =>
  defaultClient().ingest({ ...data, spanType: 'llm_call' });

/** Record a finished tool call. It is attached to the step it was made in. */
export const toolCall = (data: Omit<SpanData, 'spanType'>) =>
  defaultClient().ingest({ ...data, spanType: 'tool_call' });

export const decision = (data: Omit<SpanData, 'spanType'>) =>
  defaultClient().ingest({ ...data, spanType: 'decision' });

export { wrapOpenAI, wrapAnthropic, type IntegrationOptions } from "./integrations/providers";
export { TracifyLangGraphHandler } from "./integrations/langgraph";
