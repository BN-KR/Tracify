import { describe, expect, it } from "vitest";
import { validTraceSort, TRACE_SORT_FIELDS } from "./trace-sort";
import { COLUMN_DEFS } from "./trace-columns";
describe("trace sorting allow-list", () => {
 it("accepts all 32 built-in columns", () => {for (const c of COLUMN_DEFS) expect(validTraceSort(c.id)).toBe(c.id)});
 it("accepts metadata names without treating them as SQL", () => {expect(validTraceSort("meta:finishReason")).toBe("meta:finishReason");expect(validTraceSort("meta:mission.branch-name")).toBe("meta:mission.branch-name")});
 it("rejects unknown columns, SQL punctuation and overlong keys", () => {for(const c of [null,"unknown","name DESC; DROP TABLE spans","meta:x' OR 1=1","meta:"+"x".repeat(61)]) expect(validTraceSort(c)).toBe("startedAt")});
 it("sorts numeric fields numerically and status as a failure flag", () => {expect(TRACE_SORT_FIELDS.tokens).toBe("inputTokens + outputTokens");expect(TRACE_SORT_FIELDS.status).toBe("toUInt8(errorCount > 0)")});
});
