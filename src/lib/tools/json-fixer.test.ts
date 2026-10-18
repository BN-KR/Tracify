import assert from "node:assert/strict";
import test from "node:test";
import { repairJson } from "./json-fixer.ts";

function fixed(input: string) {
  const r = repairJson(input);
  assert.equal(r.ok, true, JSON.stringify(r));
  if (!r.ok) throw new Error("unreachable");
  return r;
}

test("valid JSON is left alone and reported valid", () => {
  const r = fixed('{"a":1,"b":[true,null]}');
  assert.equal(r.alreadyValid, true);
  assert.deepEqual(r.value, { a: 1, b: [true, null] });
  assert.equal(r.minified, '{"a":1,"b":[true,null]}');
});

test("code fences and chatty text are removed", () => {
  const r = fixed('Sure! Here is the JSON you asked for:\n```json\n{"ok": true}\n```\nLet me know if you need more.');
  assert.deepEqual(r.value, { ok: true });
  const r2 = fixed('The answer is {"x": 1} hope it helps');
  assert.deepEqual(r2.value, { x: 1 });
});

test("single quotes, unquoted keys, trailing commas, comments", () => {
  const r = fixed("{ name: 'Ada', // who\n  tags: ['a', 'b',], /* note */ age: 36, }");
  assert.deepEqual(r.value, { name: "Ada", tags: ["a", "b"], age: 36 });
});

test("python values and smart quotes", () => {
  const r = fixed("{“city”: “Oslo”, 'ok': True, 'none': None, 'bad': False}");
  assert.deepEqual(r.value, { city: "Oslo", ok: true, none: null, bad: false });
});

test("missing commas and cut-off output", () => {
  const r = fixed('{"a": 1\n "b": [1, 2\n "c": "x"}');
  assert.equal((r.value as Record<string, unknown>).a, 1);
  const cut = fixed('{"items": [{"id": 1, "name": "one"}, {"id": 2, "na');
  assert.deepEqual(cut.value, { items: [{ id: 1, name: "one" }, { id: 2 }] });
});

test("raw line breaks and stray quotes inside strings", () => {
  const r = fixed('{"text": "line one\nline two", "quote": "He said "hi" to me"}');
  assert.deepEqual(r.value, { text: "line one\nline two", quote: 'He said "hi" to me' });
});

test("json lines become a list", () => {
  const r = fixed('{"a":1}\n{"a":2}\n{"a":3}');
  assert.deepEqual(r.value, [{ a: 1 }, { a: 2 }, { a: 3 }]);
});

test("big integers keep every digit", () => {
  const r = fixed('{"id": 12345678901234567890, "x": 1,}');
  assert.match(r.text, /12345678901234567890/);
});

test("empty and non-JSON input fail politely", () => {
  assert.equal(repairJson("").ok, false);
  assert.equal(repairJson("   ").ok, false);
  const r = repairJson("hello there");
  assert.equal(r.ok, false);
});

test("output always parses with the strict parser", () => {
  const inputs = ["{a:1,b:{c:[1,2,{d:'x'}]}}", "[1,2,3", "{\"a\":", "[{'a': None}, {'a': 1.5e3}]", "{'k': 'it\\'s'}", "{a: 1 b: 2}", "{\"a\": 0x1F, \"b\": +5, \"c\": .5}"];
  for (const input of inputs) {
    const r = repairJson(input);
    assert.equal(r.ok, true, input);
    if (r.ok) assert.doesNotThrow(() => JSON.parse(r.text));
  }
});

test("deeply nested input does not crash", () => {
  const r = repairJson("[".repeat(5000));
  assert.equal(r.ok, false);
});

test("hostile keys do not pollute prototypes", () => {
  const r = fixed('{"__proto__": {"polluted": true}, "a": 1}');
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.equal(Object.keys(r.value as object).includes("__proto__"), true);
});
