import assert from "node:assert/strict";
import test from "node:test";
import {
  getApiKeyRegion,
  getRegionForHostname,
  getRegionalApiKeyPrefix,
  getWrongRegion,
  getAvailableRegions,
  isRegionAvailable,
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

test("offers only EU publicly while US stays dormant", () => {
  assert.equal(isRegionAvailable("eu"), true);
  assert.equal(isRegionAvailable("us"), false);
  assert.deepEqual(getAvailableRegions().map((region) => region.id), ["eu"]);
});

test("keeps the dormant US region routable for existing accounts and keys", () => {
  // Availability gates what is advertised, not what resolves. US hostname mapping and
  // key-region binding must keep working so a US credential is still identified as
  // US (and rejected as wrong-region) rather than silently treated as EU.
  assert.equal(getRegionForHostname("us.cloud.tracify.tech"), "us");
  assert.equal(getApiKeyRegion("tracify_sk_live_us_abc"), "us");
  assert.equal(getWrongRegion("tracify_sk_live_us_abc", "eu")?.id, "us");
});
