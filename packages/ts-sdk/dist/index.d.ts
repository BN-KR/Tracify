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
export declare class FiveToOneClient {
    private apiKey;
    private host;
    private ingestUrl;
    constructor(config?: FiveToOneConfig);
    ingest(data: SpanData): Promise<void>;
}
export declare class TracifyClient extends FiveToOneClient {
}
export declare function traceAgent<T extends (...args: any[]) => Promise<any>>(func: T, config?: FiveToOneConfig): T;
export declare const llmCall: (data: Omit<SpanData, "spanType">) => Promise<void>;
export declare const toolCall: (data: Omit<SpanData, "spanType">) => Promise<void>;
export declare const decision: (data: Omit<SpanData, "spanType">) => Promise<void>;
