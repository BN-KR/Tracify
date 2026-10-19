import assert from "node:assert/strict";
import test from "node:test";
import { isGroupKind, parseGroupFilters } from "./group-filters.ts";

const NOW = Date.UTC(2026, 9, 19, 12, 0, 0);

test("defaults to the last day, newest activity first, 50 per page", () => {
  const f = parseGroupFilters(new URLSearchParams(), NOW);
  assert.equal(f.toMs, NOW);
  assert.equal(f.fromMs, NOW - 86_400_000);
  assert.deepEqual([f.sort, f.direction, f.page, f.pageSize, f.status], ["lastSeenAt", "desc", 0, 50, "all"]);
});

test("time is capped at 90 days and never in the future", () => {
  const f = parseGroupFilters(new URLSearchParams({ from: "0", to: String(NOW + 10_000_000) }), NOW);
  assert.equal(f.toMs, NOW);
  assert.equal(f.fromMs, NOW - 90 * 86_400_000);
});

test("an empty or inverted window still spans at least a minute", () => {
  const f = parseGroupFilters(new URLSearchParams({ from: String(NOW), to: String(NOW) }), NOW);
  assert.equal(f.toMs - f.fromMs, 60_000);
});

test("unknown sort, status and junk numbers fall back safely", () => {
  const f = parseGroupFilters(new URLSearchParams({ sort: "id; DROP TABLE", status: "weird", page: "-4", pageSize: "100000", from: "abc" }), NOW);
  assert.equal(f.sort, "lastSeenAt");
  assert.equal(f.status, "all");
  assert.equal(f.page, 0);
  assert.equal(f.pageSize, 100);
  assert.equal(f.fromMs, NOW - 86_400_000);
});

test("known sorts, status, direction and trimmed text pass through", () => {
  const f = parseGroupFilters(new URLSearchParams({ sort: "totalCostUsd", dir: "asc", status: "error", q: "  anna  ", environment: "prod" }), NOW);
  assert.deepEqual([f.sort, f.direction, f.status, f.query, f.environment], ["totalCostUsd", "asc", "error", "anna", "prod"]);
});

test("only sessions and users are valid kinds", () => {
  assert.ok(isGroupKind("session") && isGroupKind("user"));
  assert.ok(!isGroupKind("runs") && !isGroupKind(""));
});
