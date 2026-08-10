export interface FiveToOneConfig {
    apiKey?: string;
    host?: string;
    projectId?: string;
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
    prompt: {
        id: string;
        name: string;
        description?: string;
        type: "text" | "chat";
    };
    version: {
        id: string;
        version: number;
        content: string;
        variables: string[];
        labels: string[];
        model?: string;
        createdAt: number;
    };
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
export declare class FiveToOneClient {
    protected apiKey: string;
    protected host: string;
    protected ingestUrl: string;
    protected projectId?: string;
    private checkCostUrl;
    private _lastFailOpen;
    private promptCache;
    constructor(config?: FiveToOneConfig);
    ingest(data: SpanData): Promise<void>;
    /** Resolve a prompt version labeled for an environment without redeploying application code. */
    getPrompt(name: string, environment?: string, options?: PromptResolutionOptions): Promise<PromptResolution>;
    /** Attach end-user feedback to a trace or span. The request is fire-and-forget like span ingestion. */
    feedback(traceId: string, value: boolean | number | string, options?: {
        kind?: 'thumb' | 'star' | 'text';
        spanId?: string;
        reason?: string;
        comment?: string;
        endUserId?: string;
        dedupeKey?: string;
        projectId?: string;
    }): void;
    /** Attach a typed score to a trace or span through the feedback API. */
    score(traceId: string, name: string, value: boolean | number | string, options?: {
        dataType?: 'numeric' | 'boolean' | 'categorical' | 'text';
        spanId?: string;
        comment?: string;
        projectId?: string;
    }): void;
    /**
     * Server-side cost check. Returns the server's decision on whether
     * the next call would exceed the ceiling.
     */
    private checkCost;
    orchestrate<T>(options: OrchestrateOptions<T>): Promise<T>;
}
export declare class TracifyClient extends FiveToOneClient {
}
export declare function traceAgent<T extends (...args: any[]) => Promise<any>>(func: T, config?: FiveToOneConfig): T;
export declare const llmCall: (data: Omit<SpanData, "spanType">) => Promise<void>;
export declare const toolCall: (data: Omit<SpanData, "spanType">) => Promise<void>;
export declare const decision: (data: Omit<SpanData, "spanType">) => Promise<void>;
