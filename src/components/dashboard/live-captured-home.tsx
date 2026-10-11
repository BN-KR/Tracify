"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";
import { LiveWorkspaceIdentityProvider } from "@/features/dashboard-workspace/live-workspace-context";

export function CapturedLoadState({ label = "Loading…", missing = false }: { label?: string; missing?: boolean }) {
  return (
    <div
      role={missing ? "alert" : "status"}
      aria-live={missing ? "assertive" : "polite"}
      aria-busy={!missing}
      className="captured-build-loading"
      style={{ display: "grid", placeItems: "center", gap: 8, minHeight: "50vh", padding: 24, background: "#000", color: "#fff", fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", borderRadius: 0 }}
    >
      <span>{missing ? "Project not found" : label}</span>
      {missing ? <span style={{ opacity: 0.6, textTransform: "none", letterSpacing: 0 }}>This project does not exist or you no longer have access to it.</span> : null}
    </div>
  );
}

export function LiveCapturedHome({ projectId, surface = "home" }: { projectId: string; surface?: "home" | "costs" }) {
  const [startedAtAfter] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString());
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const runs = useQuery(api.agentRuns.getRecentRunsByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const summary = useQuery(api.projects.getProjectManagementSummary, projectId ? { projectId: projectId as Id<"projects">, days: 30 } : "skip");
  if (project === null) return <CapturedLoadState missing />;
  if (project === undefined || runs === undefined || summary === undefined || summary === null) return <CapturedLoadState label="Loading dashboard…" />;

  const recent = runs.filter((run) => run.startedAt >= startedAtAfter);
  const records = recent.map((run) => ({
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
  const environments = ["all", ...Array.from(new Set(records.map((record) => record.environment)))];
  const models = Array.from(new Set(records.map((record) => record.model).filter((model): model is string => Boolean(model))));
  const workspace = createLiveWorkspace({ id: projectId, name: project.name, organizationName: "Workspace" }, {
    environments,
    ...(models.length ? { models } : {}),
    collections: { tracing: { description: "Recent traces from this Tracify project.", records } },
    metrics: { traces: summary.totals.totalRuns, observations: summary.totals.totalSpans, totalCost: summary.totals.totalCostUsd },
  });
  return (
    <LiveWorkspaceIdentityProvider project={workspace.project}>
      <CapturedWorkspace workspace={workspace} segments={[surface]} />
    </LiveWorkspaceIdentityProvider>
  );
}
