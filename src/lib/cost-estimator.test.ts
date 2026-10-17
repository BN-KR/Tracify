import assert from "node:assert/strict";
import test from "node:test";
import { defaultInput, estimate, fromSearch, levers, toSearch } from "./cost-estimator.ts";

test("a simple case matches hand maths", () => {
  const r = estimate({ ...defaultInput, runsPerDay: 100, callsPerRun: 2, inputTokens: 1000, outputTokens: 500, inputPricePerM: 1, outputPricePerM: 2, retryRate: 0, successRate: 100, cachedShare: 0, toolCostPerRun: 0 });
  // per call: 1000*1/1e6 + 500*2/1e6 = 0.002; two calls = 0.004; 100 runs = 0.4/day; 30 days = 12
  assert.ok(Math.abs(r.costPerRun - 0.004) < 1e-12);
  assert.ok(Math.abs(r.perMonth - 12) < 1e-9);
  assert.equal(r.retryOverheadPerMonth, 0);
});

test("retries and failures raise the cost of a successful task", () => {
  const base = estimate({ ...defaultInput, retryRate: 0, successRate: 100 });
  const worse = estimate({ ...defaultInput, retryRate: 50, successRate: 50 });
  assert.ok(worse.costPerSuccess > base.costPerSuccess * 2.9);
  assert.ok(worse.failedSpendPerMonth > 0);
});

test("caching only reduces input cost", () => {
  const none = estimate({ ...defaultInput, cachedShare: 0 }).perMonth;
  const cached = estimate({ ...defaultInput, cachedShare: 80 }).perMonth;
  assert.ok(cached < none);
});

test("levers are sorted and never negative", () => {
  const list = levers(defaultInput);
  assert.equal(list.length, 4);
  for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].monthlySaving >= list[i].monthlySaving);
  assert.ok(list.every((l) => l.monthlySaving >= 0));
});

test("bad numbers are clamped instead of producing NaN", () => {
  const r = estimate({ ...defaultInput, runsPerDay: Number.NaN, successRate: 0, retryRate: -5 });
  assert.ok(Number.isFinite(r.perMonth) && Number.isFinite(r.costPerSuccess));
});

test("share links round trip", () => {
  const input = { ...defaultInput, runsPerDay: 777, retryRate: 12 };
  assert.deepEqual(fromSearch(toSearch(input)), input);
  assert.deepEqual(fromSearch("runsPerDay=abc"), defaultInput);
});
