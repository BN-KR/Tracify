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
    private checkCostUrl;
    private _lastFailOpen;
    constructor(config?: FiveToOneConfig);
    ingest(data: SpanData): Promise<void>;
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
