import assert from "node:assert/strict";
import test from "node:test";
import { isGoogleAnalyticsMeasurementId } from "./google-analytics.ts";

test("accepts GA4 measurement IDs", () => {
  assert.equal(isGoogleAnalyticsMeasurementId("G-ABC123XYZ9"), true);
});

test("rejects missing and non-GA4 IDs", () => {
  assert.equal(isGoogleAnalyticsMeasurementId(undefined), false);
  assert.equal(isGoogleAnalyticsMeasurementId("UA-123456-1"), false);
  assert.equal(isGoogleAnalyticsMeasurementId("G-ABC 123"), false);
});
