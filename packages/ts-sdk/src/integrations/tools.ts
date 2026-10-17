import { observation, type IntegrationOptions } from "./observation";

type AnyFunction = (...args: any[]) => any;

/**
 * Trace any set of tools. Works with plain functions and with tool objects that carry an `execute`
 * function (the Vercel AI SDK, OpenAI Agents and most agent frameworks use that shape):
 *
 *   const tools = traceTools({ searchDocs, sendEmail });
 *
 * The returned object has the same keys and behaves the same; each call is recorded as a tool step.
 */
export function traceTools<T extends Record<string, any>>(tools: T, options: IntegrationOptions = {}): T {
  const traced: Record<string, any> = {};
  for (const [name, tool] of Object.entries(tools)) {
    if (typeof tool === "function") traced[name] = wrapTool(name, tool as AnyFunction, options);
    else if (tool && typeof tool.execute === "function") {
      const copy = Object.create(Object.getPrototypeOf(tool), Object.getOwnPropertyDescriptors(tool));
      copy.execute = wrapTool(name, tool.execute.bind(tool), options);
      traced[name] = copy;
    } else traced[name] = tool;
  }
  return traced as T;
}

function wrapTool(name: string, fn: AnyFunction, options: IntegrationOptions): AnyFunction {
  return function (this: unknown, ...args: any[]) {
    const obs = observation("tool", name, args.length > 1 ? args : args[0], options);
    obs.data.spanType = "tool_call";
    obs.data.toolName = name;
    obs.data.modelId = undefined;
    let outcome: unknown;
    try {
      outcome = fn.apply(this, args);
    } catch (error) {
      obs.finish(undefined, error);
      throw error;
    }
    if (outcome && typeof (outcome as Promise<unknown>).then === "function") {
      return (outcome as Promise<unknown>).then(
        (value) => { obs.finish(value); return value; },
        (error) => { obs.finish(undefined, error); throw error; },
      );
    }
    obs.finish(outcome);
    return outcome;
  };
}
