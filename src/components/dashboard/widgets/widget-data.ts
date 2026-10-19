"use client";

import { useEffect, useState } from "react";
import { readJson } from "@/lib/safe-json";

export type Bucket = { bucket: string; traces: number; errors: number; costUsd: number; tokens: number; p50DurationMs: number | null; p95DurationMs: number | null };
export type TracesData = { histogram: { bucketSeconds: number; buckets: Bucket[] }; stats: { traces: number; errors: number; p50DurationMs: number; p95DurationMs: number; totalCostUsd: number; inputTokens: number; outputTokens: number } };
export type StatsData = {
  dailyCosts: Array<{ day: string; totalCostUsd: number; spanCount: number }>;
  modelCosts: Array<{ modelId: string; totalCostUsd: number; spanCount: number }>;
  toolCosts: Array<{ toolName: string; totalCostUsd: number; spanCount: number }>;
  userCosts: Array<{ endUserId: string; totalCostUsd: number; totalTokens: number; spanCount: number }>;
  unavailable?: boolean;
};
export type Remote<T> = { state: "loading" } | { state: "ready"; data: T } | { state: "error"; message: string };

function useRemote<T extends object>(url: string | null, extract: (body: Record<string, unknown>) => T): Remote<T> {
  const [result, setResult] = useState<{ url: string; value: Remote<T> } | null>(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetch(url, { cache: "no-store" })
      .then(async (response) => {
        const body = await readJson<Record<string, unknown>>(response);
        if (!response.ok) throw new Error(body.error ?? `Could not load this data (error ${response.status}). Try again in a moment.`);
        return extract(body);
      })
      .then((data) => { if (!cancelled) setResult({ url, value: { state: "ready", data } }); })
      .catch((reason: unknown) => { if (!cancelled) setResult({ url, value: { state: "error", message: reason instanceof Error ? reason.message : "Could not load this data." } }); });
    return () => { cancelled = true; };
    // extract is a pure picker declared at module level by the callers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return url && result?.url === url ? result.value : { state: "loading" };
}

const pickTraces = (body: Record<string, unknown>) => ({ histogram: body.histogram, stats: body.stats }) as TracesData;
const pickStats = (body: Record<string, unknown>) => body as unknown as StatsData;

/** One request per source, shared by every widget on a dashboard. `needs` skips sources no widget uses. */
export function useWidgetData(projectId: string, days: number, needs: { traces: boolean; stats: boolean }, refresh: number) {
  const id = encodeURIComponent(projectId);
  // The window is read once per range change; a refresh counter re-requests it.
  const [to] = useState(() => Date.now());
  const traceUrl = needs.traces ? `/api/projects/${id}/traces?from=${to - days * 86_400_000}&to=${to + refresh}&pageSize=1` : null;
  const statsUrl = needs.stats ? `/api/projects/${id}/stats?days=${days}${refresh ? `&refresh=1&_=${refresh}` : ""}` : null;
  return { traces: useRemote<TracesData>(traceUrl, pickTraces), stats: useRemote<StatsData>(statsUrl, pickStats) };
}
