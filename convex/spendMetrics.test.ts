import { expect, test } from "vitest";
import { budgetLevel, buildWeeklySummary, periodBounds, projectSpend } from "./spendMetrics";

test("period bounds: week starts Monday, month on the 1st (UTC)", () => {
  const wed = Date.UTC(2026, 9, 14, 12);
  expect(periodBounds("week", wed).key).toBe("2026-10-12");
  expect(periodBounds("month", wed).key).toBe("2026-10");
  expect(periodBounds("week", Date.UTC(2026, 9, 18, 23)).key).toBe("2026-10-12");
});

test("levels and projection", () => {
  expect(budgetLevel(79, 100, 80)).toBe("ok");
  expect(budgetLevel(80, 100, 80)).toBe("warning");
  expect(budgetLevel(100, 100, 80)).toBe("over");
  const b = periodBounds("week", Date.UTC(2026, 9, 14));
  expect(projectSpend(10, b, b.start + 3_600_000)).toBeNull();
  expect(projectSpend(20, b, b.start + 2 * 86_400_000)).toBe(70);
});

test("weekly summary compares with the week before", () => {
  const now = Date.UTC(2026, 9, 19, 8);
  const at = (days: number) => new Date(now - days * 86_400_000).toISOString();
  const runs = [
    { status: "completed" as const, totalCostUsd: 2, startedAt: at(1), primaryModel: "a" },
    { status: "failed" as const, totalCostUsd: 1, startedAt: at(2), primaryModel: "b" },
    { status: "completed" as const, totalCostUsd: 1, startedAt: at(9), primaryModel: "a" },
  ];
  const s = buildWeeklySummary(runs, now);
  expect(s.current).toEqual({ runs: 2, failed: 1, costUsd: 3 });
  expect(s.previous.runs).toBe(1);
  expect(s.topModels[0].model).toBe("a");
});
