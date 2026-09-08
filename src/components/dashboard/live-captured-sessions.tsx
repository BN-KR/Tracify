"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { sandboxWorkspace } from "@/features/dashboard-workspace/sandbox-data";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function LiveCapturedSessions({ projectId, sessionId }: { projectId: string; sessionId?: string }) {
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const sessions = useQuery(api.sessions.listByProject, projectId ? { projectId: projectId as Id<"projects">, limit: 100 } : "skip");
  const selected = useQuery(api.sessions.getBySessionId, sessionId ? { projectId: projectId as Id<"projects">, sessionId } : "skip");
  const runs = useQuery(api.sessions.getRecentRuns, sessionId ? { projectId: projectId as Id<"projects">, sessionId } : "skip");

  if (project === undefined || project === null || sessions === undefined || (sessionId && (selected === undefined || runs === undefined))) {
    return <div className="captured-build-loading">Loading sessions…</div>;
  }

  const sessionRecords = sessions.map((session) => ({
    id: session.sessionId,
    name: session.sessionId,
    status: session.latestStatus,
    environment: session.environment ?? "default",
    timestamp: formatTime(session.lastSeenAt),
    cost: `$${session.totalCostUsd.toFixed(5)}`,
    model: session.traceName ?? "session",
    userId: session.endUserId,
    sessionId: session.sessionId,
  }));
  const traceRecords = (runs ?? []).map((run) => ({
    id: run.runId,
    name: run.runId,
    status: run.status,
    environment: run.environment ?? "default",
    timestamp: formatTime(run.startedAt),
    latency: run.finishedAt ? `${((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(2)}s` : "running",
    cost: `$${run.totalCostUsd.toFixed(5)}`,
    model: run.primaryModel,
    sessionId: run.sessionId,
  }));
  const environments = ["all", ...Array.from(new Set(sessionRecords.map((record) => record.environment)))];
  const workspace = {
    ...sandboxWorkspace,
    mode: "live" as const,
    readOnly: false,
    dataSource: "tracify-live" as const,
    project: { id: projectId, name: project.name, organizationName: "Workspace" },
    environments,
    models: Array.from(new Set(traceRecords.map((record) => record.model).filter((model): model is string => Boolean(model)))),
    collections: {
      ...sandboxWorkspace.collections,
      sessions: { description: "Review multi-turn and multi-step agent activity grouped into a single operational view.", records: sessionRecords },
      tracing: { description: "Inspect traces linked to this session.", records: traceRecords },
    },
    metrics: { ...sandboxWorkspace.metrics, traces: traceRecords.length, observations: traceRecords.length },
  };

  return <CapturedWorkspace workspace={workspace} segments={sessionId ? ["sessions", sessionId] : ["sessions"]} />;
}
