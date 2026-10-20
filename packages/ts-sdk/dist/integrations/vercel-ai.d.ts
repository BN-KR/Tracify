import { type IntegrationOptions } from "./observation";
type Value = Record<string, any>;
/**
 * One-line tracing for the Vercel AI SDK. Pass it to `wrapLanguageModel`:
 *
 *   const model = wrapLanguageModel({ model: openai("gpt-4o"), middleware: tracifyMiddleware() });
 *
 * Every `generateText`, `streamText` or `generateObject` call made with that model becomes a Tracify step.
 */
export declare function tracifyMiddleware(options?: IntegrationOptions): {
    wrapGenerate({ doGenerate, params, model }: {
        doGenerate: () => Promise<Value>;
        params: unknown;
        model?: Value;
    }): Promise<Value>;
    wrapStream({ doStream, params, model }: {
        doStream: () => Promise<Value>;
        params: unknown;
        model?: Value;
    }): Promise<{
        stream: any;
    }>;
};
export {};
