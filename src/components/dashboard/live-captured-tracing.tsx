"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedLoadState } from "./live-captured-home";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";
import { LiveWorkspaceIdentityProvider } from "@/features/dashboard-workspace/live-workspace-context";

export function LiveCapturedTracing({ projectId, runId }: { projectId: string; runId?: string }) {
  const [startedAtAfter] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString());
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const runs = usePaginatedQuery(
    api.agentRuns.getRunsPageByProject,
    projectId ? { projectId: projectId as Id<"projects">, status: "all", startedAtAfter } : "skip",
    { initialNumItems: 50 },
  );

  if (project === null) return <CapturedLoadState missing />;
  if (project === undefined || runs.status === "LoadingFirstPage") {
    return <CapturedLoadState label="Loading traces…" />;
  }

  const records = runs.results.map((run) => ({
    id: run.runId,
    name: run.runId,
    status: run.status,
    environment: run.environment ?? "default",
    timestamp: new Date(run.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    latency: run.finishedAt ? `${((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(2)}s` : "running",
    cost: `$${run.totalCostUsd.toFixed(5)}`,
    model: run.primaryModel,
    sessionId: run.sessionId,
  }));
  const environments = ["all", ...Array.from(new Set(records.map((record) => record.environment).filter(Boolean)))];
  const models = Array.from(new Set(records.map((record) => record.model).filter((model): model is string => Boolean(model))));
  const workspace = createLiveWorkspace(
    { id: projectId, name: project.name, organizationName: "Workspace" },
    {
    environments,
    ...(models.length ? { models } : {}),
    collections: {
      tracing: { description: "Inspect every trace and observation emitted by instrumented agents.", records },
    },
    metrics: { traces: records.length, observations: records.length },
    },
  );

  return (
    <LiveWorkspaceIdentityProvider project={workspace.project}>
      <CapturedWorkspace workspace={workspace} segments={runId ? ["tracing", runId] : ["tracing"]} />
    </LiveWorkspaceIdentityProvider>
  );
}
