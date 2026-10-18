/**
 * Checks tool (function) definitions for the mistakes that make agents call
 * tools wrongly: unclear names and descriptions, missing types, missing
 * required fields, loose schemas and formats a provider rejects.
 */

import { repairJson } from "./json-fixer.ts";
import { heuristicTokens, type Counter } from "./tokens.ts";

export type ToolFormat = "openai" | "openai-responses" | "anthropic" | "mcp" | "gemini" | "unknown";
export type Level = "error" | "warning" | "tip";

export type ToolIssue = {
  level: Level;
  tool?: string;
  /** Where in the definition, for example `parameters.city`. */
  path?: string;
  title: string;
  detail: string;
  fix: string;
};

export type ToolSummary = { name: string; format: ToolFormat; parameters: number; required: number; tokens: number };

export type ToolReport =
  | { ok: false; error: string }
  | {
      ok: true;
      repaired: boolean;
      formats: ToolFormat[];
      tools: ToolSummary[];
      issues: ToolIssue[];
      score: number;
      totalTokens: number;
    };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

const VAGUE_NAMES = new Set(["run", "do", "tool", "function", "helper", "handle", "process", "execute", "action", "query", "call", "invoke", "main", "test", "fn", "func", "util", "utility", "api", "get", "set", "data", "search", "fetch", "lookup", "submit"]);
const ENUM_HINT = /^(unit|units|status|state|mode|format|type|kind|language|lang|sort|sort_by|sortby|order|order_by|direction|level|priority|category|currency|method|role|size|sentiment|channel)$/i;
const NAME_RE = /^[a-zA-Z0-9_-]{1,64}$/;

/** Pulls tool objects out of whatever wrapper the user pasted. */
function collect(value: unknown, depth = 0): Obj[] {
  if (depth > 3) return [];
  if (Array.isArray(value)) return value.flatMap((v) => collect(v, depth + 1));
  if (!isObj(value)) return [];
  if (Array.isArray(value.functionDeclarations)) return value.functionDeclarations.filter(isObj);
  if (Array.isArray(value.function_declarations)) return value.function_declarations.filter(isObj);
  for (const key of ["tools", "functions", "toolDefinitions", "tool_definitions"]) {
    if (Array.isArray(value[key])) return collect(value[key], depth + 1);
  }
  if (isObj(value.result) && Array.isArray(value.result.tools)) return collect(value.result.tools, depth + 1); // MCP tools/list response
  if (typeof value.name === "string" || isObj(value.function) || value.type === "function") return [value];
  // A map of name → definition.
  const entries = Object.entries(value);
  if (entries.length > 0 && entries.every(([, v]) => isObj(v) && (v.description !== undefined || v.parameters !== undefined || v.input_schema !== undefined || v.inputSchema !== undefined))) {
    return entries.map(([name, v]) => ({ name, ...(v as Obj) }));
  }
  return [];
}

function normalise(tool: Obj): { name: unknown; description: unknown; schema: unknown; format: ToolFormat; strict: boolean } {
  if (isObj(tool.function)) {
    const f = tool.function;
    return { name: f.name, description: f.description, schema: f.parameters, format: "openai", strict: f.strict === true };
  }
  if (tool.type === "function" && (tool.parameters !== undefined || tool.name !== undefined)) {
    return { name: tool.name, description: tool.description, schema: tool.parameters, format: "openai-responses", strict: tool.strict === true };
  }
  if (tool.input_schema !== undefined) return { name: tool.name, description: tool.description, schema: tool.input_schema, format: "anthropic", strict: tool.strict === true };
  if (tool.inputSchema !== undefined) return { name: tool.name, description: tool.description, schema: tool.inputSchema, format: "mcp", strict: false };
  if (tool.parameters !== undefined) return { name: tool.name, description: tool.description, schema: tool.parameters, format: "gemini", strict: false };
  return { name: tool.name, description: tool.description, schema: undefined, format: "unknown", strict: false };
}

function typeOf(schema: Obj): string | undefined {
  const t = schema.type;
  if (typeof t === "string") return t;
  if (Array.isArray(t)) return t.filter((x) => x !== "null").join("|") || "null";
  return undefined;
}

function walk(schema: unknown, path: string, tool: string, issues: ToolIssue[], strict: boolean, depth: number, counts: { params: number; required: number }, top: boolean) {
  if (!isObj(schema)) return;
  const type = typeOf(schema);
  if (depth > 3) {
    issues.push({ level: "warning", tool, path, title: "Deeply nested parameters", detail: "Models make more mistakes with parameters nested more than three levels deep.", fix: "Flatten the structure, or split this into two tools." });
    return;
  }
  if (type === "array") {
    if (!isObj(schema.items)) {
      issues.push({ level: "error", tool, path, title: "List without an item type", detail: "OpenAI rejects an array schema that has no `items`, and other models have to guess what goes in the list.", fix: 'Add `"items": { "type": "string" }` (or the right type).' });
    } else {
      walk(schema.items, `${path}[]`, tool, issues, strict, depth + 1, counts, false);
    }
  }
  const props = schema.properties;
  if (type === "object" || isObj(props)) {
    if (!isObj(props)) {
      if (!top) issues.push({ level: "warning", tool, path, title: "Object without listed properties", detail: "The model cannot know which fields to send.", fix: "List each field under `properties`, or use a string if free-form text is intended." });
      return;
    }
    const required = Array.isArray(schema.required) ? schema.required.filter((r): r is string => typeof r === "string") : [];
    if (top) counts.required = required.length;
    for (const r of required) {
      if (!(r in props)) issues.push({ level: "error", tool, path: `${path}.required`, title: `“${r}” is required but not defined`, detail: "The required list names a field that is missing from `properties`. Providers reject this or the model cannot fill it.", fix: `Add “${r}” to \`properties\`, or remove it from \`required\`.` });
    }
    if (strict) {
      const missing = Object.keys(props).filter((k) => !required.includes(k));
      if (missing.length) issues.push({ level: "error", tool, path: `${path}.required`, title: "Strict mode needs every field listed as required", detail: `These fields are not in \`required\`: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}. OpenAI strict mode rejects that.`, fix: "Add them to `required` and make optional ones accept null, for example `\"type\": [\"string\", \"null\"]`." });
      if (schema.additionalProperties !== false) issues.push({ level: "error", tool, path, title: "Strict mode needs additionalProperties: false", detail: "Without it OpenAI strict mode rejects the schema.", fix: 'Add `"additionalProperties": false` to this object.' });
    }
    for (const [key, raw] of Object.entries(props)) {
      const p = `${path}.${key}`;
      if (top) counts.params++;
      if (!isObj(raw)) {
        issues.push({ level: "error", tool, path: p, title: `“${key}” is not a valid schema`, detail: "A property must be an object such as `{ \"type\": \"string\" }`.", fix: "Replace it with an object that has a `type` and a `description`." });
        continue;
      }
      const pType = typeOf(raw);
      const hasShape = pType !== undefined || raw.enum !== undefined || raw.anyOf !== undefined || raw.oneOf !== undefined || raw.allOf !== undefined || raw.$ref !== undefined || raw.const !== undefined;
      if (!hasShape) issues.push({ level: "error", tool, path: p, title: `“${key}” has no type`, detail: "Without a type the model guesses what to send, and some providers refuse the whole tool.", fix: `Add a \`type\` to “${key}”, for example "string", "number", "boolean", "array" or "object".` });
      if (!(typeof raw.description === "string" && raw.description.trim().length >= 3) && pType !== "object") {
        issues.push({ level: "warning", tool, path: p, title: `“${key}” has no description`, detail: "The name alone rarely tells a model what value to send, in what format, or what units.", fix: `Describe “${key}” in one line and include an example value.` });
      }
      if (Array.isArray(raw.enum) && raw.enum.length === 0) issues.push({ level: "error", tool, path: p, title: `“${key}” has an empty list of allowed values`, detail: "An empty `enum` can never be satisfied.", fix: "List the allowed values or remove `enum`." });
      if (pType === "string" && raw.enum === undefined && raw.format === undefined && ENUM_HINT.test(key) && !/\b(e\.g\.|one of|such as|either)\b/i.test(String(raw.description ?? ""))) {
        issues.push({ level: "tip", tool, path: p, title: `“${key}” looks like a fixed choice`, detail: "Free text invites made-up values such as “celcius” or “high-ish”.", fix: "Use `enum` to list the allowed values." });
      }
      if ((pType === "number" || pType === "integer") && !/\b(min|max|between|range|unit|seconds?|ms|percent|%|count|number of|\d)/i.test(String(raw.description ?? "")) && raw.minimum === undefined && raw.maximum === undefined) {
        issues.push({ level: "tip", tool, path: p, title: `“${key}” is a number with no unit or range`, detail: "Is it seconds or milliseconds? Does 0 mean “none” or “unlimited”?", fix: "Say the unit and range in the description, or add `minimum` and `maximum`." });
      }
      walk(raw, p, tool, issues, strict, depth + 1, counts, false);
    }
  } else if (top && type !== undefined && type !== "object") {
    issues.push({ level: "error", tool, path, title: "Parameters must be an object", detail: `The top level is “${type}”. Every provider expects an object with named properties.`, fix: 'Use `{ "type": "object", "properties": { ... } }`.' });
  }
}

export function checkTools(input: string, count: Counter = heuristicTokens): ToolReport {
  if (!input || !input.trim()) return { ok: false, error: "Paste your tool definitions first." };
  let value: unknown;
  let repaired = false;
  try {
    value = JSON.parse(input);
  } catch {
    const r = repairJson(input);
    if (!r.ok) return { ok: false, error: "This is not valid JSON and could not be repaired. Paste the tools array exactly as you send it to the model." };
    value = r.value;
    repaired = true;
  }
  const raw = collect(value);
  if (raw.length === 0) return { ok: false, error: "No tools found. Paste an array of tool definitions, or an object with a `tools` list." };
  if (raw.length > 500) return { ok: false, error: "That is more than 500 tools. Paste a smaller set." };

  const issues: ToolIssue[] = [];
  const tools: ToolSummary[] = [];
  const names = new Map<string, number>();
  const formats = new Set<ToolFormat>();

  for (const [i, tool] of raw.entries()) {
    const n = normalise(tool);
    formats.add(n.format);
    const label = typeof n.name === "string" && n.name ? n.name : `tool #${i + 1}`;
    const counts = { params: 0, required: 0 };
    if (typeof n.name !== "string" || !n.name.trim()) {
      issues.push({ level: "error", tool: label, title: "Tool has no name", detail: "Every tool needs a `name` the model can call.", fix: 'Add a short name such as "get_order_status".' });
    } else {
      names.set(n.name, (names.get(n.name) ?? 0) + 1);
      if (!NAME_RE.test(n.name)) issues.push({ level: "error", tool: label, path: "name", title: "Name has characters providers reject", detail: "OpenAI and Anthropic allow only letters, numbers, underscores and dashes, up to 64 characters. No spaces or dots.", fix: `Rename it, for example “${n.name.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64) || "my_tool"}”.` });
      else if (n.format === "gemini" && !/^[a-zA-Z_]/.test(n.name)) issues.push({ level: "error", tool: label, path: "name", title: "Gemini names must start with a letter or underscore", detail: "A name starting with a number or dash is rejected.", fix: "Start the name with a letter." });
      if (VAGUE_NAMES.has(n.name.toLowerCase())) issues.push({ level: "warning", tool: label, path: "name", title: `“${n.name}” is too vague`, detail: "Models pick tools mostly by name and description. A generic name makes the wrong call more likely, especially next to other tools.", fix: "Use a verb and a noun, like “search_orders” or “create_refund”." });
      else if (/^[a-z]+$/.test(n.name) && n.name.length <= 3) issues.push({ level: "tip", tool: label, path: "name", title: "Very short name", detail: "Short codes carry little meaning for the model.", fix: "Spell the name out." });
    }
    const desc = typeof n.description === "string" ? n.description.trim() : "";
    if (!desc) issues.push({ level: "error", tool: label, path: "description", title: "No description", detail: "The description is the main thing a model uses to decide whether to call a tool.", fix: "Write 1 to 3 sentences: what it does, when to use it, and what it returns." });
    else {
      if (desc.length < 25) issues.push({ level: "warning", tool: label, path: "description", title: "Description is very short", detail: `“${desc}” says little about when to call this tool.`, fix: "Say what it does, when to use it, and when not to." });
      else if (typeof n.name === "string" && desc.toLowerCase().replace(/[^a-z]/g, "") === n.name.toLowerCase().replace(/[^a-z]/g, "")) issues.push({ level: "warning", tool: label, path: "description", title: "Description just repeats the name", detail: "It adds no information.", fix: "Explain what the tool returns and when it should be used." });
      if (desc.length > 1500) issues.push({ level: "warning", tool: label, path: "description", title: "Description is very long", detail: "Every call to the model pays for these tokens.", fix: "Keep it under about 3 sentences and move detail into parameter descriptions." });
      if (desc.length >= 25 && !/\b(use|when|if|returns?|returns|get|gets|fetch|create|update|delete|search|find|send|list|look|check|read|write|run|calculate|convert|add|remove|cancel|open|close|start|stop)\b/i.test(desc)) issues.push({ level: "tip", tool: label, path: "description", title: "Description does not say what the tool does", detail: "Start with a verb and say what comes back.", fix: "For example: “Looks up an order by id and returns its status and delivery date.”" });
    }
    if (n.schema === undefined) {
      if (n.format !== "unknown") issues.push({ level: "warning", tool: label, path: "parameters", title: "No parameter schema", detail: "Without a schema the model sends arguments in any shape. If the tool takes no input, say so explicitly.", fix: 'Add `"parameters": { "type": "object", "properties": {} }` (or the matching field for your provider).' });
      else issues.push({ level: "error", tool: label, title: "Format not recognised", detail: "Expected `function.parameters` (OpenAI), `input_schema` (Anthropic), `inputSchema` (MCP) or `parameters` (Gemini).", fix: "Check the field names against your provider's documentation." });
    } else if (typeof n.schema === "string") {
      issues.push({ level: "error", tool: label, path: "parameters", title: "Parameters are a string, not an object", detail: "The schema was pasted as JSON text inside a string.", fix: "Use an object, not a quoted string." });
    } else if (isObj(n.schema)) {
      if (n.schema.type === undefined && isObj(n.schema.properties)) issues.push({ level: "error", tool: label, path: "parameters", title: 'Parameters are missing "type": "object"', detail: "Providers require the top level of the schema to say it is an object.", fix: 'Add `"type": "object"` next to `properties`.' });
      if (n.format === "gemini" && JSON.stringify(n.schema).includes('"additionalProperties"')) issues.push({ level: "warning", tool: label, path: "parameters", title: "Gemini does not accept additionalProperties", detail: "Gemini function declarations support only a subset of JSON Schema.", fix: "Remove `additionalProperties` for Gemini." });
      if ((n.format === "gemini" || n.format === "unknown") && /"\$ref"|"\$defs"/.test(JSON.stringify(n.schema))) issues.push({ level: "warning", tool: label, path: "parameters", title: "References may not be supported", detail: "`$ref` and `$defs` are not accepted by every provider.", fix: "Inline the referenced schema." });
      walk({ ...n.schema, type: n.schema.type ?? (isObj(n.schema.properties) ? "object" : undefined) }, "parameters", label, issues, n.strict, 0, counts, true);
      if (counts.params > 12) issues.push({ level: "warning", tool: label, path: "parameters", title: `${counts.params} parameters is a lot`, detail: "Models fill in fewer fields correctly as the list grows.", fix: "Cut optional fields, give sensible defaults, or split the tool." });
      if (counts.params > 0 && counts.required === 0 && !Array.isArray(n.schema.required)) issues.push({ level: "tip", tool: label, path: "parameters.required", title: "No required fields", detail: "Every field is optional, so the model may call the tool with nothing.", fix: "List the fields that must always be present under `required`." });
    }
    tools.push({ name: label, format: n.format, parameters: counts.params, required: counts.required, tokens: count(JSON.stringify(tool)) });
  }

  for (const [name, n] of names) if (n > 1) issues.push({ level: "error", tool: name, path: "name", title: `Name “${name}” is used ${n} times`, detail: "Providers reject duplicate tool names.", fix: "Give each tool a unique name." });
  if (formats.size > 1) issues.push({ level: "warning", title: "Mixed formats in one list", detail: `This list mixes ${[...formats].join(", ")} definitions. A single API call accepts only one.`, fix: "Convert them all to the format your provider uses." });
  if (raw.length > 20) issues.push({ level: raw.length > 40 ? "warning" : "tip", title: `${raw.length} tools in one call`, detail: "Accuracy drops as the tool list grows, and every call pays for every definition.", fix: "Send only the tools relevant to the current step, or route first and then pick from a smaller set." });
  const totalTokens = tools.reduce((a, t) => a + t.tokens, 0);
  if (totalTokens >= 3000) issues.push({ level: "tip", title: `Tool definitions cost about ${totalTokens.toLocaleString("en-US")} tokens on every call`, detail: "They are sent with each request, so a long list is a fixed cost per call. A prompt cache helps if the list never changes.", fix: "Shorten descriptions and drop tools that the current step cannot use." });
  if (names.size >= 3) {
    const prefixes = [...names.keys()].map((nm) => nm.toLowerCase().split(/[_-]/).slice(0, 2).join("_"));
    const similar = prefixes.filter((p, i) => prefixes.indexOf(p) !== i);
    if (similar.length >= 2) issues.push({ level: "tip", title: "Several tools have very similar names", detail: "Look-alike names (for example get_user and get_users) are easy to mix up.", fix: "Make the difference obvious in the name and start each description with when to use it." });
  }

  const weight = { error: 12, warning: 4, tip: 1 } as const;
  const penalty = issues.reduce((a, i) => a + weight[i.level], 0);
  const score = Math.max(0, Math.round(100 - (penalty / Math.max(1, raw.length)) * 1.4));
  const order = { error: 0, warning: 1, tip: 2 } as const;
  issues.sort((a, b) => order[a.level] - order[b.level]);
  return { ok: true, repaired, formats: [...formats], tools, issues, score, totalTokens };
}
