import assert from "node:assert/strict";
import test from "node:test";
import { checkCodeRule, runCodeRule } from "./evaluator-rules.ts";

test("contains ignores case, equals_expected needs an expected answer", () => {
  assert.equal(runCodeRule("contains:Refund", "We will REFUND you"), 1);
  assert.equal(runCodeRule("contains:refund", "nothing"), 0);
  assert.equal(runCodeRule("equals_expected", " a ", "a"), 1);
  assert.equal(runCodeRule("equals_expected", "a"), 0);
});

test("not_empty, json_valid and regex", () => {
  assert.equal(runCodeRule("not_empty", "  "), 0);
  assert.equal(runCodeRule("json_valid", '{"a":1}'), 1);
  assert.equal(runCodeRule("json_valid", "{a"), 0);
  assert.equal(runCodeRule("regex:/^ord-\\d+$/i", "ORD-12"), 1);
  assert.equal(runCodeRule("regex:^a", "ba"), 0);
});

test("json_schema checks object type and required keys", () => {
  const rule = 'json_schema:{"type":"object","required":["id","name"]}';
  assert.equal(runCodeRule(rule, '{"id":1,"name":"x"}'), 1);
  assert.equal(runCodeRule(rule, '{"id":1}'), 0);
  assert.equal(runCodeRule(rule, "[1]"), 0);
  assert.equal(runCodeRule(rule, "nope"), 0);
});

test("checkCodeRule explains unusable rules and accepts good ones", () => {
  assert.equal(checkCodeRule("not_empty"), null);
  assert.match(checkCodeRule("be nice") ?? "", /Unsupported/);
  assert.match(checkCodeRule("regex:/(/") ?? "", /regular expression/);
  assert.match(checkCodeRule("json_schema:{oops") ?? "", /not valid JSON/);
});
