import assert from "node:assert/strict";
import test from "node:test";
import { checkTools } from "./tool-checker.ts";

const good = [{ type: "function", function: { name: "get_order_status", description: "Looks up an order by id and returns its status and delivery date. Use when the customer asks where their order is.", parameters: { type: "object", properties: { order_id: { type: "string", description: "Order id, like ORD-1042" } }, required: ["order_id"], additionalProperties: false } } }];

function run(v: unknown) {
  const r = checkTools(typeof v === "string" ? v : JSON.stringify(v));
  assert.equal(r.ok, true, JSON.stringify(r));
  if (!r.ok) throw new Error("x");
  return r;
}

test("a good OpenAI tool scores high with no errors", () => {
  const r = run(good);
  assert.equal(r.issues.filter((i) => i.level === "error").length, 0);
  assert.ok(r.score >= 90, String(r.score));
  assert.deepEqual(r.formats, ["openai"]);
  assert.equal(r.tools[0].parameters, 1);
  assert.ok(r.totalTokens > 20);
});

test("finds the classic mistakes", () => {
  const bad = [{ type: "function", function: { name: "run", description: "run", parameters: { type: "object", properties: { unit: { type: "string" }, tags: { type: "array" }, n: { description: "x" }, count: { type: "number" } }, required: ["missing"] } } }, { name: "bad name!", input_schema: { type: "object", properties: {} } }];
  const r = run(bad);
  const titles = r.issues.map((i) => i.title).join("|");
  assert.match(titles, /too vague/);
  assert.match(titles, /List without an item type/);
  assert.match(titles, /“n” has no type/);
  assert.match(titles, /“missing” is required but not defined/);
  assert.match(titles, /“unit” looks like a fixed choice/);
  assert.match(titles, /Name has characters providers reject/);
  assert.match(titles, /No description/);
  assert.match(titles, /Mixed formats/);
  assert.ok(r.score < 50);
});

test("handles Anthropic, MCP, Gemini and wrapped shapes", () => {
  const a = run({ tools: [{ name: "search_docs", description: "Searches the docs and returns matching pages.", input_schema: { type: "object", properties: { q: { type: "string", description: "Query text" } }, required: ["q"] } }] });
  assert.deepEqual(a.formats, ["anthropic"]);
  const m = run({ result: { tools: [{ name: "list_files", description: "Lists files in a folder and returns names.", inputSchema: { type: "object", properties: { path: { type: "string", description: "Folder path" } } } }] } });
  assert.deepEqual(m.formats, ["mcp"]);
  const g = run([{ functionDeclarations: [{ name: "set_light", description: "Sets a light's brightness and returns the new level.", parameters: { type: "object", properties: { level: { type: "integer", description: "Brightness 0 to 100" } }, required: ["level"] } }] }]);
  assert.deepEqual(g.formats, ["gemini"]);
  const single = run(good[0]);
  assert.equal(single.tools.length, 1);
});

test("strict mode and duplicates", () => {
  const t = JSON.parse(JSON.stringify(good));
  t[0].function.strict = true;
  t[0].function.parameters.properties.note = { type: "string", description: "Optional note" };
  delete t[0].function.parameters.additionalProperties;
  const r = run([...t, t[0]]);
  const titles = r.issues.map((i) => i.title).join("|");
  assert.match(titles, /Strict mode needs every field/);
  assert.match(titles, /additionalProperties: false/);
  assert.match(titles, /used 2 times/);
});

test("repairs sloppy JSON and rejects junk", () => {
  const r = run("[{ name: 'get_time', description: 'Returns the current time in a time zone.', input_schema: { type: 'object', properties: { tz: { type: 'string', description: 'IANA zone' } }, } }]");
  assert.equal(r.repaired, true);
  for (const input of ["", "hello", "{}", "[]", "[1,2]", "null", '{"a":1}']) {
    const out = checkTools(input);
    assert.equal(out.ok, false, input);
  }
});

test("never throws on odd shapes", () => {
  const odd = [[{ name: 5 }], [{ name: "x", parameters: "nope" }], [{ name: "x", parameters: { type: "string" } }], [{ type: "function", function: null }], [{ name: "x", input_schema: { type: "object", properties: { a: null, b: 5, c: { type: ["string", "null"] } } } }]];
  for (const o of odd) assert.doesNotThrow(() => checkTools(JSON.stringify(o)));
});
