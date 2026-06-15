"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ProjectStats = {
  dailyCosts: Array<{ day: string; totalCostUsd: number; spanCount: number }>;
  modelCosts: Array<{
    modelId: string;
    totalCostUsd: number;
    spanCount: number;
    avgLatencyMs?: number;
  }>;
  toolCosts?: Array<{
    toolName: string;
    totalCostUsd: number;
    spanCount: number;
    avgLatencyMs?: number;
  }>;
  unavailable?: boolean;
  meta?: {
    source: string;
    cacheStatus: string;
    reason?: string | null;
    updatedAt: number | null;
    ageMs: number | null;
  };
};

type FetchOptions = {
  showLoading?: boolean;
  force?: boolean;
  refresh?: "normal" | "manual";
};

const EMPTY_STATS: ProjectStats = {
  dailyCosts: [],
  modelCosts: [],
  toolCosts: [],
  unavailable: true,
  meta: {
    source: "none",
    cacheStatus: "unavailable",
    reason: "empty",
    updatedAt: null,
    ageMs: null,
  },
};

export function useProjectStats({
  projectId,
  range,
  liveRefreshKey,
}: {
  projectId: string;
  range: number;
  liveRefreshKey?: string | number | null;
}) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const inFlightKeyRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);
  const hasSeenLiveKeyRef = useRef(false);
  const activeRequestKeyRef = useRef("");

  const fetchStats = useCallback(
    async ({
      showLoading = false,
      force = false,
      refresh = "normal",
    }: FetchOptions = {}) => {
      if (!projectId) return;
      if (!force && document.visibilityState === "hidden") return;

      const requestKey = `${projectId}:${range}:${refresh}`;
      if (inFlightKeyRef.current === requestKey) return;
      inFlightKeyRef.current = requestKey;
      if (showLoading) setLoading(true);
      if (refresh === "manual") setRefreshing(true);

      try {
        const params = new URLSearchParams({ days: range.toString() });
        if (refresh === "manual") params.set("refresh", "manual");
        const response = await fetch(
          `/api/projects/${projectId}/stats?${params.toString()}`,
          { cache: "no-store" },
        );
        const data = response.ok
          ? ((await response.json()) as ProjectStats)
          : EMPTY_STATS;
        if (
          !cancelledRef.current &&
          activeRequestKeyRef.current === `${projectId}:${range}`
        ) {
          setStats(data);
        }
      } catch (error) {
        console.error(error);
        if (
          !cancelledRef.current &&
          activeRequestKeyRef.current === `${projectId}:${range}`
        ) {
          setStats(EMPTY_STATS);
        }
      } finally {
        if (inFlightKeyRef.current === requestKey) {
          inFlightKeyRef.current = null;
        }
        if (
          !cancelledRef.current &&
          activeRequestKeyRef.current === `${projectId}:${range}`
        ) {
          setLoading(false);
        }
        if (refresh === "manual") setRefreshing(false);
      }
    },
    [projectId, range],
  );

  useEffect(() => {
    cancelledRef.current = false;
    hasSeenLiveKeyRef.current = false;
    activeRequestKeyRef.current = `${projectId}:${range}`;

    void fetchStats({ showLoading: true, force: true });

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void fetchStats({ force: true });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelledRef.current = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchStats, projectId, range]);

  useEffect(() => {
    if (!liveRefreshKey) return;

    if (!hasSeenLiveKeyRef.current) {
      hasSeenLiveKeyRef.current = true;
      return;
    }

    const staleRefreshId = window.setTimeout(() => {
      const updatedAt = stats?.meta?.updatedAt;
      const ageMs = updatedAt ? Date.now() - updatedAt : Number.POSITIVE_INFINITY;
      if (ageMs > 10 * 60 * 1000) {
        void fetchStats({ force: true });
      }
    }, 2500);

    return () => {
      window.clearTimeout(staleRefreshId);
    };
  }, [fetchStats, liveRefreshKey, stats?.meta?.updatedAt]);

  const refreshStats = useCallback(
    () => fetchStats({ force: true, refresh: "manual" }),
    [fetchStats],
  );

  return { stats, loading, refreshing, refetchStats: fetchStats, refreshStats };
}
