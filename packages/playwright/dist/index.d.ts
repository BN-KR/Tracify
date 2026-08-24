import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult, TestStep } from "@playwright/test/reporter";
export type PlaywrightEventType = "run" | "test_step" | "browser_action" | "network_request" | "console_error" | "assertion" | "screenshot" | "trace_artifact" | "ci_metadata";
export type PlaywrightEventStatus = "started" | "passed" | "failed" | "skipped" | "timed_out" | "info";
export interface PlaywrightArtifact {
    name: string;
    contentType?: string;
    url?: string;
    path?: string;
}
export interface PlaywrightEvent {
    eventType: PlaywrightEventType;
    name: string;
    status: PlaywrightEventStatus;
    startedAt: string;
    durationMs: number;
    input?: unknown;
    output?: unknown;
    metadata?: Record<string, unknown>;
    parentEventId?: string;
    eventId?: string;
    error?: {
        message: string;
        stack?: string;
        value?: string;
    };
    artifacts?: PlaywrightArtifact[];
}
export interface PlaywrightSpan {
    spanId: string;
    runId: string;
    spanType: PlaywrightEventType | "run_end";
    createdAt: string;
    latencyMs: number;
    input: string;
    output: string;
    metadata: Record<string, unknown>;
    parentSpanId?: string;
    environment?: string;
    release?: string;
    tags?: string[];
    errorType?: string;
    errorMessage?: string;
    stackTrace?: string;
    attachments?: PlaywrightArtifact[];
}
export type SpanTransport = (span: PlaywrightSpan) => void | Promise<void>;
export interface PlaywrightReporterOptions {
    apiKey?: string;
    host?: string;
    region?: "eu" | "us";
    runId?: string;
    environment?: string;
    release?: string;
    tags?: string[];
    traceArtifactUrl?: string;
    fetch?: typeof globalThis.fetch;
    transport?: SpanTransport;
    onTransportError?: (error: unknown, span: PlaywrightSpan) => void;
}
export declare function eventToSpan(event: PlaywrightEvent, options: {
    runId: string;
    environment?: string;
    release?: string;
    tags?: string[];
}): PlaywrightSpan;
export declare class PlaywrightReporter implements Reporter {
    readonly runId: string;
    private readonly options;
    private readonly pending;
    private readonly activeTests;
    private readonly activeSteps;
    private readonly startedAt;
    private runMetadata;
    constructor(options?: PlaywrightReporterOptions);
    onBegin(config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, result: TestResult): void;
    onStepBegin(test: TestCase, result: TestResult, step: TestStep): void;
    onStepEnd(test: TestCase, result: TestResult, step: TestStep): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    onEnd(result: FullResult): Promise<void>;
    record(event: PlaywrightEvent): void;
    recordBrowserAction(name: string, metadata?: Record<string, unknown>): void;
    recordNetworkRequest(name: string, metadata?: Record<string, unknown>): void;
    recordConsoleError(message: string, metadata?: Record<string, unknown>): void;
    recordAssertion(name: string, status: "passed" | "failed", metadata?: Record<string, unknown>): void;
    recordScreenshot(name: string, artifact: PlaywrightArtifact): void;
    recordTraceArtifact(artifact: PlaywrightArtifact): void;
    private manualEvent;
    private stepKey;
    private send;
}
export default PlaywrightReporter;
