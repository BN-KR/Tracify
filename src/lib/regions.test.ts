import assert from "node:assert/strict";
import test from "node:test";
import {
  getApiKeyRegion,
  getRegionForHostname,
  getRegionalApiKeyPrefix,
  getWrongRegion,
  parseTracifyRegion,
} from "./regions.ts";

test("parses only supported regions", () => {
  assert.equal(parseTracifyRegion("EU"), "eu");
  assert.equal(parseTracifyRegion("us"), "us");
  assert.equal(parseTracifyRegion("jp"), null);
});

test("maps regional cloud hosts", () => {
  assert.equal(getRegionForHostname("eu.cloud.tracify.tech"), "eu");
  assert.equal(getRegionForHostname("us.cloud.tracify.tech:443"), "us");
  assert.equal(getRegionForHostname("www.tracify.tech"), null);
});

test("binds new keys to a region and assigns legacy keys to EU", () => {
  assert.equal(getRegionalApiKeyPrefix("eu"), "tracify_sk_live_eu_");
  assert.equal(getRegionalApiKeyPrefix("us"), "tracify_sk_live_us_");
  assert.equal(getApiKeyRegion("tracify_sk_live_eu_abc"), "eu");
  assert.equal(getApiKeyRegion("tracify_sk_live_us_abc"), "us");
  assert.equal(getApiKeyRegion("tracify_sk_live_legacy"), "eu");
});

test("detects a credential sent to the wrong regional deployment", () => {
  assert.equal(getWrongRegion("tracify_sk_live_us_abc", "eu")?.id, "us");
  assert.equal(getWrongRegion("tracify_sk_live_eu_abc", "eu"), null);
});
