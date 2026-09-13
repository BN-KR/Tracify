"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ExploreClient } from "@/components/dashboard/explore/explore-client";
import type { ExploreSpan, ExploreTrace, TraceStatus } from "@/components/dashboard/explore/types";

function statusFromRun(status: string): TraceStatus {
  if (status === "failed" || status === "cancelled") return "error";
  if (status === "running") return "running";
  return "success";
}

/**
 * Real-project explore surface: pulls this project's runs from Convex and
 * projects them into the same `ExploreTrace` shape the demo view uses.
 *
 * NOTE: full per-span trees (tool calls / generations / retrievals) live in
 * `runSpanCache` / Tinybird rather than on the run summary doc, so for now
 * each trace renders as a single root span sized to the run's overall
 * duration/cost. Wiring the detailed span tree in is tracked as a follow-up
 * — the filter bar, table, and trace map all already support arbitrarily
 * deep trees, so that follow-up is additive.
 */
export function ProjectExploreClient({ projectId }: { projectId: string }) {
  const [startedAtAfter] = useState(() => new Date(Date.now() - 30 * 86_400_000).toISOString());
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const runs = usePaginatedQuery(
    api.agentRuns.getRunsPageByProject,
    projectId ? { projectId: projectId as Id<"projects">, status: "all", startedAtAfter } : "skip",
    { initialNumItems: 100 },
  );

  const traces: ExploreTrace[] = useMemo(() => {
    if (!runs.results) return [];
    return runs.results.map((run): ExploreTrace => {
      const started = new Date(run.startedAt).getTime();
      const finished = run.finishedAt ? new Date(run.finishedAt).getTime() : started;
      const durationMs = Math.max(0, finished - started);
      const status = statusFromRun(run.status);
      const rootSpan: ExploreSpan = {
        id: run.runId,
        parentId: null,
        name: run.runId,
        kind: status === "error" ? "error" : "agent",
        startOffsetMs: 0,
        durationMs: durationMs || 1,
        status: status === "error" ? "error" : "ok",
        model: run.primaryModel,
        costUsd: run.totalCostUsd,
        children: [],
      };

      return {
        id: run.runId,
        name: run.runId,
        status,
        startedAt: run.startedAt,
        durationMs: durationMs,
        costUsd: run.totalCostUsd,
        inputTokens: 0,
        outputTokens: 0,
        model: run.primaryModel ?? "unknown",
        user: run.sessionId ?? "anonymous",
        tags: [run.environment ?? "default"],
        spans: [rootSpan],
      };
    });
  }, [runs.results]);

  if (project === undefined || runs.status === "LoadingFirstPage") {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-sm">Loading traces…</div>;
  }

  if (project === null) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-sm">Project not found.</div>;
  }

  return <ExploreClient traces={traces} projectLabel={project.name} />;
}
