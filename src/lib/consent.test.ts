import assert from "node:assert/strict";
import test from "node:test";
import { CONSENT_KEY, CONSENT_VERSION, defaultConsent, hasCurrentConsent, readConsent } from "./consent.ts";

function installStorage(value: string | null, throwing = false) {
  const store = new Map<string, string>();
  if (value !== null) store.set(CONSENT_KEY, value);
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    localStorage: { getItem: () => { if (throwing) throw new Error("blocked"); return store.get(CONSENT_KEY) ?? null; } },
  } });
}

test("analytics is on by default and marketing is opt-in", () => { delete (globalThis as { window?: unknown }).window; assert.deepEqual(defaultConsent, { version: CONSENT_VERSION, analytics: true, marketing: false }); assert.deepEqual(readConsent(), defaultConsent); });
test("malformed and old storage fall back safely", () => { installStorage("not-json"); assert.equal(hasCurrentConsent(), false); assert.deepEqual(readConsent(), defaultConsent); installStorage(JSON.stringify({ version: "old", analytics: false, marketing: false })); assert.equal(hasCurrentConsent(), false); assert.equal(readConsent().analytics, true); });
test("unavailable storage never crashes", () => { installStorage(null, true); assert.equal(hasCurrentConsent(), false); assert.deepEqual(readConsent(), defaultConsent); });
