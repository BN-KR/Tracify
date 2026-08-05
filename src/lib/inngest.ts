import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "5to1r" });

// Typed event map for all Inngest events used in this app
export type SpanIngestedEvent = {
  name: "5to1r/span.received";
  data: {
    spanId: string;
    runId: string;
    projectId: string;
    projectDocId: string; // Convex _id for the project
    spanType: string;
    input: string;
    output: string;
    latencyMs: number;
    costUsd: number;
    modelId: string;
    toolName: string;
    metadata: Record<string, unknown>;
    parentSpanId: string;
    sessionId: string;
    endUserId: string;
    environment: string;
    release: string;
    tags: string[];
    traceName: string;
    inputTokens: number;
    outputTokens: number;
    ttftMs: number;
    retryCount: number;
    errorType: string;
    errorMessage: string;
    isStreamChunk: boolean;
    streamSequence: number;
    streamFinal: boolean;
    payloadFormat: string;
    stackTrace: string;
    timedOut: boolean;
    timeoutMs: number;
    createdAt: string;
  };
};
