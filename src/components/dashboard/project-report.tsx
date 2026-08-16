"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { AlertTriangle, ExternalLink, Printer } from "lucide-react";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStats } from "@/hooks/use-project-stats";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export function ProjectReport({ projectId }: { projectId: string }) {
  const summary = useQuery(api.projects.getProjectManagementSummary, {
    projectId: projectId as Id<"projects">,
  });
  const alerts = useQuery(api.alerts.listByProject, {
    projectId: projectId as Id<"projects">,
  });
  const liveRefreshKey =
    summary?.latestActivityAt ??
    summary?.totals.totalRuns ??
    summary?.totals.totalSpans ??
    null;
  const { stats, loading } = useProjectStats({
    projectId,
    range: 30,
    liveRefreshKey,
  });

  const failedRuns = useMemo(
    () => summary?.recentRuns.filter((run) => run.status === "failed") ?? [],
    [summary],
  );

  if (summary === undefined || alerts === undefined || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-none" />
        <Skeleton className="h-72 w-full rounded-none" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="border border-black/15 bg-white p-6 font-mono text-sm text-black/60">
        Project not found or access denied.
      </div>
    );
  }

  const topModels = stats?.modelCosts?.slice(0, 5) ?? [];
  const topTools = stats?.toolCosts?.slice(0, 5) ?? [];
  const recentAlerts = alerts.slice(0, 6);
  const reportDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 print:bg-black print:text-white">
      <Card className="rounded-none border-black/15 bg-white p-6 shadow-none print:border-black print:bg-black">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-black/55 print:text-white">
              project report
            </div>
            <h1 className="mt-2 font-mono text-3xl text-black print:text-white">
              {summary.project.clientName || summary.project.name}
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-[12px] text-black/55 print:text-white">
              {summary.project.reportNotes ||
                "Production agent activity, cost, reliability, alerts, and failed traces."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="h-9 rounded-none font-mono text-[11px] uppercase"
            >
              <Printer className="size-3" />
              Print
            </Button>
            <Link
              href={`/dashboard/${projectId}/settings`}
              className="flex h-9 items-center gap-2 border border-black/15 px-3 font-mono text-[11px] uppercase text-black/70 transition-colors hover:border-black hover:text-black"
            >
              Edit metadata
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
        <div className="mt-6 grid gap-3 border-t border-black/15 pt-5 sm:grid-cols-3 print:border-black">
          <ReportMeta label="project" value={summary.project.name} />
          <ReportMeta label="plan" value={summary.project.planTier ?? "free"} />
          <ReportMeta label="generated" value={reportDate} />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="total runs" value={summary.totals.totalRuns.toLocaleString()} />
        <Metric label="failed runs" value={summary.totals.failedRuns.toLocaleString()} />
        <Metric label="total cost" value={formatCurrency(summary.totals.totalCostUsd)} />
        <Metric label="span count" value={summary.totals.totalSpans.toLocaleString()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportList
          title="Top Models"
          empty="No model data available for the last 30 days."
          rows={topModels.map((model) => ({
            key: model.modelId,
            label: model.modelId,
            meta: `${model.spanCount.toLocaleString()} spans`,
            value: formatCurrency(model.totalCostUsd),
          }))}
        />
        <ReportList
          title="Top Tools"
          empty="No tool-call data available for the last 30 days."
          rows={topTools.map((tool) => ({
            key: tool.toolName,
            label: tool.toolName,
            meta: `${tool.spanCount.toLocaleString()} spans`,
            value: formatCurrency(tool.totalCostUsd),
          }))}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-none border-black/15 bg-white p-6 shadow-none print:border-black print:bg-black">
          <SectionTitle title="Recent Alerts" />
          {recentAlerts.length ? (
            <div className="mt-5 divide-y divide-black/15 border border-black/15 print:divide-black print:border-black">
              {recentAlerts.map((alert) => (
                <Link
                  key={alert._id}
                  href={`/dashboard/${projectId}/runs/${alert.runId}`}
                  className="block p-4 transition-colors hover:bg-[#f3f2ed] print:text-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-black print:text-white">
                      {alert.type.replace("_", " ")}
                    </span>
                    <span className="font-mono text-[10px] text-black/55 print:text-white">
                      {formatRelativeTime(alert.triggeredAt)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-black/70 print:text-white">
                    {alert.message}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyReportState>No alerts triggered.</EmptyReportState>
          )}
        </Card>

        <Card className="rounded-none border-black/15 bg-white p-6 shadow-none print:border-black print:bg-black">
          <SectionTitle title="Notable Failed Traces" />
          {failedRuns.length ? (
            <div className="mt-5 divide-y divide-black/15 border border-black/15 print:divide-black print:border-black">
              {failedRuns.map((run) => (
                <Link
                  key={run._id}
                  href={`/dashboard/${projectId}/runs/${run.runId}`}
                  className="grid gap-3 p-4 font-mono text-[12px] text-black/60 transition-colors hover:bg-[#f3f2ed] sm:grid-cols-[minmax(0,1fr)_90px_90px] print:text-white"
                >
                  <span className="truncate text-black print:text-white">
                    {run.runId}
                  </span>
                  <span>{run.spanCount} spans</span>
                  <span className="sm:text-right">
                    {formatCurrency(run.totalCostUsd)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyReportState>No failed runs in recent saved summaries.</EmptyReportState>
          )}
        </Card>
      </div>

      {stats?.unavailable ? (
        <div className="flex items-center gap-2 border border-black/15 bg-white p-4 font-mono text-[11px] text-black/60 print:border-black print:bg-black print:text-white">
          <AlertTriangle className="size-4" />
          Analytics are unavailable. This report is using Convex saved summaries where possible.
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-none border-black/15 bg-white p-5 shadow-none print:border-black print:bg-black">
      <div className="font-mono text-[10px] uppercase tracking-widest text-black/55 print:text-white">
        {label}
      </div>
      <div className="mt-3 font-mono text-2xl text-black print:text-white">
        {value}
      </div>
    </Card>
  );
}

function ReportMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-black/55 print:text-white">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-[12px] text-black print:text-white">
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="font-mono text-[14px] uppercase tracking-widest text-black print:text-white">
      {title}
    </h2>
  );
}

function ReportList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<{ key: string; label: string; meta: string; value: string }>;
  empty: string;
}) {
  return (
    <Card className="rounded-none border-black/15 bg-white p-6 shadow-none print:border-black print:bg-black">
      <SectionTitle title={title} />
      {rows.length ? (
        <div className="mt-5 divide-y divide-black/15 border border-black/15 print:divide-black print:border-black">
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid gap-3 p-4 font-mono text-[12px] sm:grid-cols-[minmax(0,1fr)_100px_100px]"
            >
              <span className="truncate text-black print:text-white">{row.label}</span>
              <span className="text-black/55 print:text-white">{row.meta}</span>
              <span className="text-black sm:text-right print:text-white">{row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyReportState>{empty}</EmptyReportState>
      )}
    </Card>
  );
}

function EmptyReportState({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 border border-dashed border-black/15 p-6 font-mono text-[12px] text-black/55 print:border-black print:text-white">
      {children}
    </div>
  );
}
