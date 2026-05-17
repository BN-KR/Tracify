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
  unavailable?: boolean;
};

type FetchOptions = {
  showLoading?: boolean;
  force?: boolean;
};

const EMPTY_STATS: ProjectStats = {
  dailyCosts: [],
  modelCosts: [],
  unavailable: true,
};

export function useProjectStats({
  projectId,
  range,
  liveRefreshKey,
  pollMs = 4000,
}: {
  projectId: string;
  range: number;
  liveRefreshKey?: string | number | null;
  pollMs?: number;
}) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlightKeyRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);
  const hasSeenLiveKeyRef = useRef(false);
  const activeRequestKeyRef = useRef("");

  const fetchStats = useCallback(
    async ({ showLoading = false, force = false }: FetchOptions = {}) => {
      if (!projectId) return;
      if (!force && document.visibilityState === "hidden") return;

      const requestKey = `${projectId}:${range}`;
      if (inFlightKeyRef.current === requestKey) return;
      inFlightKeyRef.current = requestKey;
      if (showLoading) setLoading(true);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/stats?days=${range}`,
          { cache: "no-store" },
        );
        const data = response.ok
          ? ((await response.json()) as ProjectStats)
          : EMPTY_STATS;
        if (
          !cancelledRef.current &&
          activeRequestKeyRef.current === requestKey
        ) {
          setStats(data);
        }
      } catch (error) {
        console.error(error);
        if (
          !cancelledRef.current &&
          activeRequestKeyRef.current === requestKey
        ) {
          setStats(EMPTY_STATS);
        }
      } finally {
        if (inFlightKeyRef.current === requestKey) {
          inFlightKeyRef.current = null;
        }
        if (
          !cancelledRef.current &&
          activeRequestKeyRef.current === requestKey
        ) {
          setLoading(false);
        }
      }
    },
    [projectId, range],
  );

  useEffect(() => {
    cancelledRef.current = false;
    hasSeenLiveKeyRef.current = false;
    activeRequestKeyRef.current = `${projectId}:${range}`;

    void fetchStats({ showLoading: true, force: true });
    const intervalId = window.setInterval(() => {
      void fetchStats();
    }, pollMs);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void fetchStats({ force: true });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelledRef.current = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchStats, pollMs]);

  useEffect(() => {
    if (!liveRefreshKey) return;

    if (!hasSeenLiveKeyRef.current) {
      hasSeenLiveKeyRef.current = true;
      return;
    }

    const quickRefreshId = window.setTimeout(() => {
      void fetchStats({ force: true });
    }, 750);
    const settleRefreshId = window.setTimeout(() => {
      void fetchStats({ force: true });
    }, 2500);

    return () => {
      window.clearTimeout(quickRefreshId);
      window.clearTimeout(settleRefreshId);
    };
  }, [fetchStats, liveRefreshKey]);

  return { stats, loading, refetchStats: fetchStats };
}
