import assert from "node:assert/strict";
import test from "node:test";
import { filterScores, formatScoreValue, parseScoreInput, summariseByName, type ScoreRow } from "./score-utils.ts";

const NOW = Date.UTC(2026, 9, 19, 12);
const row = (over: Partial<ScoreRow>): ScoreRow => ({ _id: "x", name: "helpfulness", value: 0.5, dataType: "numeric", source: "llm", traceId: "trace_1", createdBy: "u", createdAt: NOW, ...over });

test("filterScores combines filters and searches name, trace, comment and value", () => {
  const rows = [row({ _id: "a" }), row({ _id: "b", name: "tone", value: "friendly", dataType: "categorical", source: "human", comment: "Warm" }), row({ _id: "c", createdAt: NOW - 10 * 86_400_000 })];
  assert.deepEqual(filterScores(rows, { source: "human" }).map((r) => r._id), ["b"]);
  assert.deepEqual(filterScores(rows, { since: NOW - 86_400_000 }).map((r) => r._id), ["a", "b"]);
  assert.deepEqual(filterScores(rows, { q: "WARM" }).map((r) => r._id), ["b"]);
  assert.deepEqual(filterScores(rows, { q: "trace_1", name: "helpfulness" }).map((r) => r._id), ["a", "c"]);
});

test("summariseByName gives mean, range, pass rate, top categories and a 14 day trend", () => {
  const rows = [
    row({ value: 0.2 }), row({ value: 0.6, createdAt: NOW - 86_400_000 }),
    row({ name: "ok", value: true, dataType: "boolean" }), row({ name: "ok", value: false, dataType: "boolean" }), row({ name: "ok", value: true, dataType: "boolean" }),
    row({ name: "tone", value: "warm", dataType: "categorical" }), row({ name: "tone", value: "warm", dataType: "categorical" }), row({ name: "tone", value: "cold", dataType: "categorical" }),
  ];
  const byName = Object.fromEntries(summariseByName(rows, NOW).map((s) => [s.name, s]));
  assert.equal(byName.helpfulness.average, 0.4);
  assert.equal(byName.helpfulness.min, 0.2);
  assert.equal(byName.helpfulness.max, 0.6);
  assert.equal(byName.helpfulness.trend.length, 14);
  assert.equal(byName.helpfulness.trend[13], 0.2);
  assert.equal(byName.helpfulness.trend[12], 0.6);
  assert.equal(byName.helpfulness.trend[0], null);
  assert.ok(Math.abs((byName.ok.passRate ?? 0) - 2 / 3) < 1e-9);
  assert.deepEqual(byName.tone.top, [{ value: "warm", count: 2 }, { value: "cold", count: 1 }]);
});

test("a name used with two types is flagged as mixed", () => {
  const [s] = summariseByName([row({}), row({ value: "x", dataType: "text" }), row({})], NOW);
  assert.equal(s.mixed, true);
  assert.equal(s.dataType, "numeric");
});

test("parseScoreInput accepts what people type and explains what it cannot use", () => {
  assert.deepEqual(parseScoreInput("numeric", " 0.75 "), { value: 0.75 });
  assert.deepEqual(parseScoreInput("numeric", "abc"), { error: "That is not a number." });
  assert.deepEqual(parseScoreInput("boolean", "Yes"), { value: true });
  assert.deepEqual(parseScoreInput("boolean", "maybe"), { error: "Choose true or false." });
  assert.deepEqual(parseScoreInput("categorical", " "), { error: "Enter a category." });
  assert.equal(formatScoreValue(0.5), "0.5");
  assert.equal(formatScoreValue(3), "3");
  assert.equal(formatScoreValue(1 / 3), "0.333");
});
