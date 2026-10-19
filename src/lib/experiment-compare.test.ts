import assert from "node:assert/strict";
import test from "node:test";
import { compareRows, summarise, verdictCounts, type CompareItem, type CompareResult } from "./experiment-compare.ts";

const items: CompareItem[] = [{ _id: "1", input: "q1", expectedOutput: "Yes" }, { _id: "2", input: "q2", expectedOutput: "No" }, { _id: "3", input: "q3" }];
const r = (id: string, output: string, extra: Partial<CompareResult> = {}): CompareResult => ({ datasetItemId: id, output, ...extra });

test("summary counts matches only where an answer was expected", () => {
  const s = summarise(items, [r("1", " yes "), r("2", "Maybe"), r("3", "anything", { latencyMs: 100, costUsd: 0.5 })]);
  assert.equal(s.ran, 3); assert.equal(s.withExpected, 2); assert.equal(s.matched, 1); assert.equal(s.matchRate, 0.5); assert.equal(s.costUsd, 0.5); assert.equal(s.avgLatencyMs, 100);
});

test("failed items never match and do not count toward latency", () => {
  const s = summarise(items, [r("1", "Yes", { error: "boom", latencyMs: 9000 }), r("2", "No", { latencyMs: 50 })]);
  assert.equal(s.failed, 1); assert.equal(s.matched, 1); assert.equal(s.avgLatencyMs, 50); assert.equal(s.ran, 2);
});

test("an empty or unscored run has no rate or average", () => {
  const s = summarise(items, []);
  assert.equal(s.matchRate, null); assert.equal(s.avgScore, null); assert.equal(s.avgLatencyMs, null); assert.equal(s.ran, 0);
});

test("a repeated result for the same item replaces the earlier one", () => {
  const s = summarise(items, [r("1", "No"), r("1", "Yes")]);
  assert.equal(s.matched, 1); assert.equal(s.ran, 1);
});

test("rows say better, worse, changed, same or missing", () => {
  const rows = compareRows(items, [r("1", "No"), r("2", "No")], [r("1", "Yes"), r("2", "Nope")]);
  assert.deepEqual(rows.map((row) => row.verdict), ["better", "worse", "missing"]);
  const noExpected = compareRows([items[2]], [r("3", "a")], [r("3", "b")]);
  assert.equal(noExpected[0].verdict, "changed");
  assert.equal(compareRows([items[2]], [r("3", "A ")], [r("3", "a")])[0].verdict, "same");
});

test("a new failure counts as worse and a fixed one as better", () => {
  assert.equal(compareRows([items[2]], [r("3", "ok")], [r("3", "", { error: "x" })])[0].verdict, "worse");
  assert.equal(compareRows([items[2]], [r("3", "", { error: "x" })], [r("3", "ok")])[0].verdict, "better");
  assert.equal(compareRows([items[2]], [r("3", "", { error: "x" })], [r("3", "", { error: "y" })])[0].verdict, "changed");
  assert.deepEqual(verdictCounts(compareRows(items, [], [])), { same: 0, better: 0, worse: 0, changed: 0, missing: 3 });
});
