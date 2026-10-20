"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceTools = traceTools;
const observation_1 = require("./observation");
/**
 * Trace any set of tools. Works with plain functions and with tool objects that carry an `execute`
 * function (the Vercel AI SDK, OpenAI Agents and most agent frameworks use that shape):
 *
 *   const tools = traceTools({ searchDocs, sendEmail });
 *
 * The returned object has the same keys and behaves the same; each call is recorded as a tool step.
 */
function traceTools(tools, options = {}) {
    const traced = {};
    for (const [name, tool] of Object.entries(tools)) {
        if (typeof tool === "function")
            traced[name] = wrapTool(name, tool, options);
        else if (tool && typeof tool.execute === "function") {
            const copy = Object.create(Object.getPrototypeOf(tool), Object.getOwnPropertyDescriptors(tool));
            copy.execute = wrapTool(name, tool.execute.bind(tool), options);
            traced[name] = copy;
        }
        else
            traced[name] = tool;
    }
    return traced;
}
function wrapTool(name, fn, options) {
    return function (...args) {
        const obs = (0, observation_1.observation)("tool", name, args.length > 1 ? args : args[0], options);
        obs.data.spanType = "tool_call";
        obs.data.toolName = name;
        obs.data.modelId = undefined;
        let outcome;
        try {
            outcome = fn.apply(this, args);
        }
        catch (error) {
            obs.finish(undefined, error);
            throw error;
        }
        if (outcome && typeof outcome.then === "function") {
            return outcome.then((value) => { obs.finish(value); return value; }, (error) => { obs.finish(undefined, error); throw error; });
        }
        obs.finish(outcome);
        return outcome;
    };
}
