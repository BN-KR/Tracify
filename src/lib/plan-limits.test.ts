import assert from "node:assert/strict";
import test from "node:test";
import { enforcedSpanLimit, monthKey, planLimitMessage, secondsUntilNextMonth } from "./plan-limits.ts";

test("only the free plan is blocked at its limit", () => {
  assert.equal(enforcedSpanLimit("free"), 25_000);
  for (const tier of ["pro", "team", "enterprise", undefined, "unknown"]) assert.equal(enforcedSpanLimit(tier), null);
});

test("month key uses UTC and pads the month", () => {
  assert.equal(monthKey(new Date("2026-01-31T23:59:59Z")), "2026-01");
  assert.equal(monthKey(new Date("2026-12-01T00:00:00Z")), "2026-12");
});

test("seconds until reset count to the first of next month, across year end", () => {
  assert.equal(secondsUntilNextMonth(new Date("2026-10-31T23:59:00Z")), 60);
  assert.equal(secondsUntilNextMonth(new Date("2026-12-31T23:00:00Z")), 3600);
  assert.equal(secondsUntilNextMonth(new Date("2026-10-01T00:00:00Z")), 31 * 86400);
});

test("message names the limit", () => {
  assert.match(planLimitMessage(25_000), /25,000 free spans/);
});
