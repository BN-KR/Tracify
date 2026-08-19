export interface TracifyConfig {
  apiKey?: string;
  host?: string;
  /** Tracify Cloud data region. Ignored when `host` is provided. Defaults to TRACIFY_REGION or EU. */
  region?: TracifyRegion;
  projectId?: string;
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
    this.ingestUrl = `${this.host}/api/ingest`;
    this.checkCostUrl = `${this.host}/api/orchestration/check-cost`;
  }

  async ingest(data: SpanData) {
    if (!this.apiKey) return;

    const span = {
      spanId: data.spanId || createId(),
      runId: data.runId || process.env.TRACIFY_CURRENT_RUN_ID || 'unknown',
      createdAt: data.createdAt || new Date().toISOString(),
      metadata: data.metadata || {},
      input: typeof data.input === 'string' ? data.input : JSON.stringify(data.input || ''),
      output: typeof data.output === 'string' ? data.output : JSON.stringify(data.output || ''),
      ...data,
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
    } catch (e) {
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
    const runId = explicitRunId || process.env.TRACIFY_CURRENT_RUN_ID || createId();
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


export function traceAgent<T extends (...args: any[]) => Promise<any>>(
  func: T,
  config: TracifyConfig = {}
): T {
  const client = new TracifyClient(config);

  return (async (...args: any[]) => {
    const runId = createId();
    const startTime = Date.now();
    
    process.env.TRACIFY_CURRENT_RUN_ID = runId;

    try {
      const result = await func(...args);
      const latencyMs = Date.now() - startTime;
      
      client.ingest({
        spanType: 'run_end',
        output: result,
        latencyMs,
        costUsd: 0,
      });
      
      return result;
    } catch (e) {
      const latencyMs = Date.now() - startTime;
      client.ingest({
        spanType: 'error',
        output: e instanceof Error ? e.message : String(e),
        latencyMs,
        costUsd: 0,
      });
      throw e;
    }
  }) as T;
}

const defaultClient = new TracifyClient();

export const llmCall = (data: Omit<SpanData, 'spanType'>) => 
  defaultClient.ingest({ ...data, spanType: 'llm_call' });

export const toolCall = (data: Omit<SpanData, 'spanType'>) => 
  defaultClient.ingest({ ...data, spanType: 'tool_call' });

export const decision = (data: Omit<SpanData, 'spanType'>) => 
  defaultClient.ingest({ ...data, spanType: 'decision' });
