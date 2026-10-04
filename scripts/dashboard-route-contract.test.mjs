import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile("scripts/dashboard-route-contract.mjs", "utf8");

test("dashboard route contract inventories the filesystem without live probes", () => {
  assert.match(source, /src\/app\/\(frontend\)\/dashboard/);
  assert.match(source, /Live probe: skipped/);
  assert.match(source, /page\.tsx/);
  assert.doesNotMatch(source, /fetch\(|playwright|chromium|convex|tinybird|redis|inngest/);
});
