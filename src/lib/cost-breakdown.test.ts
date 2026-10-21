import { describe, expect, it } from "vitest";
import { changePercent, costPerThousandTokens, cumulative, stackSeries } from "./cost-breakdown";

const HOUR = 3600;
const at = (hour: number) => `2026-10-20 ${String(hour).padStart(2, "0")}:00:00`;
const start = (hour: number) => Date.UTC(2026, 9, 20, hour);

describe("cost breakdown helpers", () => {
  it("keeps the top models and groups the rest as Other", () => {
    const rows = [
      { bucket: at(1), model: "a", costUsd: 5 }, { bucket: at(1), model: "b", costUsd: 3 }, { bucket: at(1), model: "c", costUsd: 1 },
      { bucket: at(2), model: "c", costUsd: 2 }, { bucket: at(2), model: "", costUsd: 0.5 },
    ];
    const series = stackSeries(rows, HOUR, { from: start(1), to: start(2) }, 2);
    expect(series.models).toEqual(["a", "b", "Other"]);
    expect(series.buckets.map((bucket) => bucket.parts)).toEqual([[5, 3, 1], [0, 0, 2.5]]);
    expect(series.buckets.map((bucket) => bucket.total)).toEqual([9, 2.5]);
  });

  it("fills quiet buckets with zeros", () => {
    const series = stackSeries([{ bucket: at(1), model: "a", costUsd: 1 }, { bucket: at(4), model: "a", costUsd: 2 }], HOUR, { from: start(1), to: start(4) });
    expect(series.buckets.map((bucket) => bucket.total)).toEqual([1, 0, 0, 2]);
  });

  it("labels steps without a model", () => {
    expect(stackSeries([{ bucket: at(1), model: "", costUsd: 1 }], HOUR, { from: start(1), to: start(1) }).models).toEqual(["No model"]);
  });

  it("adds up a running total", () => expect(cumulative([1, 0, 2.5])).toEqual([1, 1, 3.5]));

  it("compares with the previous period only when it had spend", () => {
    expect(changePercent(150, 100)).toBe(50);
    expect(changePercent(50, 100)).toBe(-50);
    expect(changePercent(10, 0)).toBeNull();
  });

  it("prices a thousand tokens", () => {
    expect(costPerThousandTokens(0.5, 250_000)).toBeCloseTo(0.002);
    expect(costPerThousandTokens(1, 0)).toBeNull();
  });
});
