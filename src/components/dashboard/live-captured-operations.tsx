"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedLoadState } from "./live-captured-home";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";
import { Activity, AlertCircle, ArrowUpRight, CheckCircle2, Shield, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function LiveCapturedOperations({ projectId }: { projectId: string }) {
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const summary = useQuery(
    api.projects.getProjectManagementSummary,
    projectId ? { projectId: projectId as Id<"projects">, days: 30 } : "skip"
  );
  const alerts = useQuery(
    api.alerts.listByProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const automations = useQuery(
    api.automations.list,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const updateAlertState = useMutation(api.alerts.updateState);

  const [filterState, setFilterState] = useState<"all" | "active" | "resolved">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (project === null) return <CapturedLoadState missing />;
  if (
    project === undefined ||
    summary === undefined ||
    summary === null ||
    alerts === undefined ||
    automations === undefined
  ) {
    return <CapturedLoadState label="Loading operations telemetry…" />;
  }

  const workspace = createLiveWorkspace(
    { id: projectId, name: project.name, organizationName: "Workspace" },
    {
      metrics: {
        traces: summary.totals.totalRuns,
        observations: summary.totals.totalSpans,
        totalCost: summary.totals.totalCostUsd,
      },
    }
  );

  async function handleToggleAlert(alertId: string, currentState?: string) {
    const nextState = currentState === "resolved" ? "active" : "resolved";
    setUpdatingId(alertId);
    try {
      await updateAlertState({
        alertId: alertId as Id<"alerts">,
        state: nextState,
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredAlerts = alerts.filter((alert) =>
    filterState === "all" ? true : (alert.state ?? "active") === filterState
  );

  const activeAlertsCount = alerts.filter((a) => (a.state ?? "active") === "active").length;
  const activeAutomationsCount = automations.filter((a) => a.active).length;

  return (
    <CapturedWorkspace
      workspace={workspace}
      toolbarTitle="Operations"
      childrenOnly
      segments={["settings"]}
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-none border-black/15 bg-white p-5 shadow-none">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/55">
                Active Runs
              </span>
              <Activity className="size-4 text-black/40" />
            </div>
            <div className="mt-3 font-mono text-3xl font-light text-black">
              {summary.totals.activeRuns}
            </div>
            <div className="mt-2 font-mono text-[11px] text-black/55">
              {summary.totals.totalRuns} total runs (30d)
            </div>
          </Card>

          <Card className="rounded-none border-black/15 bg-white p-5 shadow-none">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/55">
                System Failures
              </span>
              <AlertCircle className="size-4 text-black/40" />
            </div>
            <div className="mt-3 font-mono text-3xl font-light text-black">
              {summary.totals.failedRuns}
            </div>
            <div className="mt-2 font-mono text-[11px] text-black/55">
              {summary.totals.totalRuns > 0
                ? `${((summary.totals.failedRuns / summary.totals.totalRuns) * 100).toFixed(1)}% failure rate`
                : "No run history"}
            </div>
          </Card>

          <Card className="rounded-none border-black/15 bg-white p-5 shadow-none">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/55">
                Active Alerts
              </span>
              <AlertCircle className="size-4 text-black/40" />
            </div>
            <div className="mt-3 font-mono text-3xl font-light text-black">
              {activeAlertsCount}
            </div>
            <div className="mt-2 font-mono text-[11px] text-black/55">
              {alerts.length} operational incidents
            </div>
          </Card>

          <Card className="rounded-none border-black/15 bg-white p-5 shadow-none">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/55">
                Automations
              </span>
              <Zap className="size-4 text-black/40" />
            </div>
            <div className="mt-3 font-mono text-3xl font-light text-black">
              {activeAutomationsCount}
            </div>
            <div className="mt-2 font-mono text-[11px] text-black/55">
              {automations.length} configured triggers
            </div>
          </Card>
        </div>

        {/* Operational Panels */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Runs Telemetry */}
          <Card className="rounded-none border-black/15 bg-white p-6 shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-mono text-[13px] uppercase tracking-wider text-black">
                  Agent Execution Telemetry
                </h2>
                <p className="mt-1 font-mono text-[11px] text-black/55">
                  Latest executed agent runs and operational status.
                </p>
              </div>
              <Link
                href={`/dashboard/${projectId}/tracing`}
                className="inline-flex items-center gap-1 font-mono text-[11px] text-black/70 hover:text-black"
              >
                Traces <ArrowUpRight className="size-3" />
              </Link>
            </div>

            {summary.recentRuns.length ? (
              <div className="divide-y divide-black/10 border-t border-black/10">
                {summary.recentRuns.slice(0, 6).map((run) => (
                  <div
                    key={run._id}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-2 shrink-0 ${
                          run.status === "completed"
                            ? "bg-black"
                            : run.status === "running"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <Link
                          href={`/dashboard/${projectId}/runs/${run.runId}`}
                          className="font-mono font-medium hover:underline"
                        >
                          {run.runId}
                        </Link>
                        <div className="font-mono text-[10px] text-black/45">
                          {run.primaryModel ?? "default model"} · {run.spanCount} spans
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{formatCurrency(run.totalCostUsd)}</div>
                      <div className="font-mono text-[10px] uppercase text-black/45">
                        {run.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center border border-dashed border-black/15 bg-black/[0.01] p-6 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-black/50">
                  No execution runs recorded
                </p>
                <Link
                  href={`/dashboard/${projectId}/quickstart`}
                  className="mt-3 font-mono text-[11px] underline"
                >
                  Send your first trace
                </Link>
              </div>
            )}
          </Card>

          {/* Operational Alerts & Interventions */}
          <Card className="rounded-none border-black/15 bg-white p-6 shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-mono text-[13px] uppercase tracking-wider text-black">
                  Alerts & Signals
                </h2>
                <p className="mt-1 font-mono text-[11px] text-black/55">
                  Live operational threshold breaches and intervention signals.
                </p>
              </div>
              <div className="flex gap-1">
                {(["all", "active", "resolved"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterState(mode)}
                    className={`h-7 px-2.5 font-mono text-[10px] uppercase tracking-wider ${
                      filterState === mode
                        ? "border border-black bg-black text-white"
                        : "border border-black/15 bg-white text-black/55 hover:text-black"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {filteredAlerts.length ? (
              <div className="divide-y divide-black/10 border-t border-black/10">
                {filteredAlerts.slice(0, 6).map((alert) => (
                  <div
                    key={alert._id}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{alert.type}</span>
                        <span className="font-mono text-[10px] text-black/45">
                          {new Date(alert.triggeredAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="truncate font-mono text-[11px] text-black/65">
                        {alert.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={updatingId === alert._id}
                      onClick={() => void handleToggleAlert(alert._id, alert.state)}
                      className={`h-7 shrink-0 border px-3 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                        (alert.state ?? "active") === "active"
                          ? "border-black bg-black text-white hover:bg-black/80"
                          : "border-black/20 bg-white text-black/60 hover:border-black hover:text-black"
                      }`}
                    >
                      {updatingId === alert._id
                        ? "Saving…"
                        : (alert.state ?? "active") === "active"
                        ? "Resolve"
                        : "Reopen"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center border border-dashed border-black/15 bg-black/[0.01] p-6 text-center">
                <CheckCircle2 className="size-6 text-black/30" />
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-black/50">
                  {filterState === "active"
                    ? "No active alert conditions"
                    : "No alerts match the filter"}
                </p>
                <Link
                  href={`/dashboard/${projectId}/alerts`}
                  className="mt-3 font-mono text-[11px] underline"
                >
                  Configure alert rules
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Operational Guardrails & Quick Navigation */}
        <Card className="rounded-none border-black/15 bg-white p-6 shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Shield className="size-5 text-black/60" />
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-black">
                  Runtime Policies & Guardrails
                </h3>
                <p className="font-mono text-[11px] text-black/55">
                  Automated retry chains, fallback models, and operational budget guardrails.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/${projectId}/control`}
                className="border border-black bg-black px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white hover:bg-black/80"
              >
                Runtime Policy
              </Link>
              <Link
                href={`/dashboard/${projectId}/resilience`}
                className="border border-black/20 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-black hover:border-black"
              >
                Resilience Tests
              </Link>
              <Link
                href={`/dashboard/${projectId}/automations`}
                className="border border-black/20 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-black hover:border-black"
              >
                Automations
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </CapturedWorkspace>
  );
}
