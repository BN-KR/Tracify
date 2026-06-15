export interface FiveToOneConfig {
  apiKey?: string;
  host?: string;
}

export type TracifyConfig = FiveToOneConfig;

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
  createdAt?: string;
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `span_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export class FiveToOneClient {
  private apiKey: string;
  private host: string;
  private ingestUrl: string;

  constructor(config: FiveToOneConfig = {}) {
    this.apiKey = config.apiKey || process.env.TRACIFY_API_KEY || process.env.FIVETOONE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Tracify Warning: TRACIFY_API_KEY or FIVETOONE_API_KEY is not set');
    }
    this.host = (config.host || 'https://tracify.tech').replace(/\/$/, '');
    this.ingestUrl = `${this.host}/api/ingest`;
  }

  async ingest(data: SpanData) {
    if (!this.apiKey) return;

    const span = {
      spanId: data.spanId || createId(),
      runId: data.runId || process.env.TRACIFY_CURRENT_RUN_ID || process.env.FIVETOONE_CURRENT_RUN_ID || 'unknown',
      createdAt: data.createdAt || new Date().toISOString(),
      metadata: data.metadata || {},
      input: typeof data.input === 'string' ? data.input : JSON.stringify(data.input || ''),
      output: typeof data.output === 'string' ? data.output : JSON.stringify(data.output || ''),
      ...data,
    };

    try {
      // Fire and forget
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
}

export class TracifyClient extends FiveToOneClient {}

export function traceAgent<T extends (...args: any[]) => Promise<any>>(
  func: T,
  config: FiveToOneConfig = {}
): T {
  const client = new TracifyClient(config);

  return (async (...args: any[]) => {
    const runId = createId();
    const startTime = Date.now();
    
    // Set runId for the current execution context
    process.env.TRACIFY_CURRENT_RUN_ID = runId;
    process.env.FIVETOONE_CURRENT_RUN_ID = runId;

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

// Global default client for easy access
const defaultClient = new TracifyClient();

export const llmCall = (data: Omit<SpanData, 'spanType'>) => 
  defaultClient.ingest({ ...data, spanType: 'llm_call' });

export const toolCall = (data: Omit<SpanData, 'spanType'>) => 
  defaultClient.ingest({ ...data, spanType: 'tool_call' });

export const decision = (data: Omit<SpanData, 'spanType'>) => 
  defaultClient.ingest({ ...data, spanType: 'decision' });
