import assert from "node:assert/strict";
import test from "node:test";
import { createAnalyticsLifecycle } from "./analytics-lifecycle.ts";
function fixture() { const calls: string[] = []; return { calls, lifecycle: createAnalyticsLifecycle({ initialize: () => calls.push("init"), optIn: () => calls.push("in"), optOut: () => calls.push("out") }) }; }
test("accept initializes exactly once", () => { const { calls, lifecycle } = fixture(); lifecycle.apply({ analytics: true }); lifecycle.apply({ analytics: true }); assert.deepEqual(calls, ["init", "in", "in"]); });
test("reject does not initialize", () => { const { calls, lifecycle } = fixture(); lifecycle.apply({ analytics: false }); assert.deepEqual(calls, []); });
test("withdrawal opts out after initialization", () => { const { calls, lifecycle } = fixture(); lifecycle.apply({ analytics: true }); lifecycle.apply({ analytics: false }); assert.deepEqual(calls, ["init", "in", "out"]); });
