import { type IntegrationOptions } from "./observation";
/**
 * Trace any set of tools. Works with plain functions and with tool objects that carry an `execute`
 * function (the Vercel AI SDK, OpenAI Agents and most agent frameworks use that shape):
 *
 *   const tools = traceTools({ searchDocs, sendEmail });
 *
 * The returned object has the same keys and behaves the same; each call is recorded as a tool step.
 */
export declare function traceTools<T extends Record<string, any>>(tools: T, options?: IntegrationOptions): T;
