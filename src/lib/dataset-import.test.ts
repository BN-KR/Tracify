import assert from "node:assert/strict";
import test from "node:test";
import { MAX_IMPORT_ROWS, parseDatasetImport, sameAnswer } from "./dataset-import.ts";

test("plain lines become inputs and blank lines are ignored", () => {
  const result = parseDatasetImport("first\n\n  second  \n");
  assert.deepEqual(result.items, [{ input: "first" }, { input: "second" }]);
  assert.equal(result.problems.length, 0);
});

test("tab separated lines carry the expected answer", () => {
  assert.deepEqual(parseDatasetImport("2+2\t4\nhi\thello\tthere").items, [{ input: "2+2", expectedOutput: "4" }, { input: "hi", expectedOutput: "hello\tthere" }]);
});

test("json lines and json arrays accept common key names", () => {
  assert.deepEqual(parseDatasetImport('{"question":"q1","answer":"a1"}\n{"input":"q2","expected_output":{"x":1}}').items, [{ input: "q1", expectedOutput: "a1" }, { input: "q2", expectedOutput: '{"x":1}' }]);
  assert.deepEqual(parseDatasetImport('[{"input":"a"},"b"]').items, [{ input: "a" }, { input: "b" }]);
});

test("bad rows are reported with their line and good rows still import", () => {
  const result = parseDatasetImport('ok\n{"nope":1}\n{broken\n');
  assert.deepEqual(result.items, [{ input: "ok" }]);
  assert.deepEqual(result.problems.map((problem) => problem.line), [2, 3]);
  assert.equal(parseDatasetImport("[1, 2").problems.length, 1);
});

test("imports stop at the row limit and long cells are rejected", () => {
  const many = parseDatasetImport(Array.from({ length: MAX_IMPORT_ROWS + 5 }, (_, i) => `row ${i}`).join("\n"));
  assert.equal(many.items.length, MAX_IMPORT_ROWS);
  assert.equal(many.truncated, true);
  assert.equal(parseDatasetImport("x".repeat(20_001)).problems.length, 1);
});

test("answers match ignoring case and spacing", () => {
  assert.equal(sameAnswer(" Thursday.\n", "thursday."), true);
  assert.equal(sameAnswer("Friday", "Thursday"), false);
});
