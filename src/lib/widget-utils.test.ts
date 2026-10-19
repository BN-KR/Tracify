import assert from "node:assert/strict";
import test from "node:test";
import { bucketLabel, compactCost, compactNumber, duration, errorShare, moveWidget, widgetInfo, WIDGETS } from "./widget-utils.ts";

test("widgets are found by id and ids are unique", () => {
  assert.equal(widgetInfo("cost_daily")?.title, "Cost per day");
  assert.equal(widgetInfo("nope"), null);
  assert.equal(new Set(WIDGETS.map((widget) => widget.id)).size, WIDGETS.length);
});

test("moving a widget swaps neighbours and stops at the ends", () => {
  assert.deepEqual(moveWidget(["a", "b", "c"], "b", -1), ["b", "a", "c"]);
  assert.deepEqual(moveWidget(["a", "b", "c"], "b", 1), ["a", "c", "b"]);
  const same = ["a", "b"];
  assert.equal(moveWidget(same, "a", -1), same);
  assert.equal(moveWidget(same, "b", 1), same);
  assert.equal(moveWidget(same, "z", 1), same);
});

test("error share handles no traces and clamps", () => {
  assert.equal(errorShare(0, 0), null);
  assert.equal(errorShare(10, 2), 0.2);
  assert.equal(errorShare(1, 5), 1);
});

test("numbers, costs and durations read compactly", () => {
  assert.equal(compactNumber(999), "999"); assert.equal(compactNumber(1500), "1.5k"); assert.equal(compactNumber(2_000_000), "2M");
  assert.equal(compactCost(0), "$0"); assert.equal(compactCost(0.0042), "$0.0042"); assert.equal(compactCost(12.345), "$12.35"); assert.equal(compactCost(2500), "$2.5k");
  assert.equal(duration(420), "420ms"); assert.equal(duration(2300), "2.3s"); assert.equal(duration(125_000), "2m 5s");
});

test("bucket labels fall back to the raw text when the date is invalid", () => {
  assert.equal(bucketLabel("garbage", 3600), "garbage");
  assert.ok(bucketLabel("2026-10-19 14:00:00", 3600).length > 0);
});
