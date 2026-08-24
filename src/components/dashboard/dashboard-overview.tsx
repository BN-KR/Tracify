"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Activity, DollarSign, Zap, AlertTriangle, ArrowUpRight, CircleCheck, Clock3, Gauge, Percent } from "lucide-react";
import { RunsTable } from "./runs-table";
import { OrchestrationSavings } from "./orchestration-savings";
import { FailOpenAlert } from "./fail-open-alert";
import { useProjectStats } from "@/hooks/use-project-stats";
import { AnalyticsRefreshControl } from "./analytics-refresh-control";
import { AttentionItem, DashboardMetric, SignalBadge } from "./dashboard-primitives";

interface DashboardOverviewProps {
  projectId: string;
}

export function DashboardOverview({ projectId }: DashboardOverviewProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requestedRange = Number(searchParams.get("range"));
  const range = useMemo(
    () => ([1, 7, 30, 90].includes(requestedRange) ? requestedRange : 7),
    [requestedRange],
  );
  const recentRuns = useQuery(
    api.agentRuns.getRecentRunsByProject, 
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const summary = useQuery(
    api.projects.getProjectManagementSummary,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const evaluationOverview = useQuery(
    api.evaluationEngine.overview,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const liveRefreshKey =
    summary?.latestActivityAt ??
    summary?.totals.totalRuns ??
    summary?.totals.totalSpans ??
    null;
  const { stats, loading, refreshing, refreshStats } = useProjectStats({
    projectId,
    range,
    liveRefreshKey,
  });

  if (loading || recentRuns === undefined || summary === undefined || evaluationOverview === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-none" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-none" />
      </div>
    );
  }

  const analyticsSpend =
    stats?.dailyCosts.reduce((acc, curr) => acc + curr.totalCostUsd, 0) || 0;
  const analyticsSpans =
    stats?.dailyCosts.reduce((acc, curr) => acc + curr.spanCount, 0) || 0;
  const savedSpend = summary?.totals.totalCostUsd || 0;
  const savedSpans = summary?.totals.totalSpans || 0;
  const useSavedFallback = stats?.unavailable;
  const totalSpend = useSavedFallback ? savedSpend : analyticsSpend;
  const totalSpans = useSavedFallback ? savedSpans : analyticsSpans;
  const analyticsDailyCosts = stats?.dailyCosts ?? [];
  const dailyCosts = analyticsDailyCosts.length
    ? analyticsDailyCosts
    : buildDailyCostSeries(range, recentRuns);
  const latestDailySpend = dailyCosts.at(-1)?.totalCostUsd ?? 0;
  const couldHaveSavedUsd = dailyCosts.reduce(
    (sum, day) => sum + Math.max(day.totalCostUsd - latestDailySpend, 0),
    0,
  );
  const activeRuns =
    summary?.totals.activeRuns ?? recentRuns.filter(r => r.status === "running").length;
  const failedRuns =
    summary?.totals.failedRuns ?? recentRuns.filter(r => r.status === "failed").length;
  const recentFailureRate = recentRuns.length ? (recentRuns.filter((run) => run.status === "failed").length / recentRuns.length) * 100 : 0;
  const recentDurations = recentRuns
    .map((run) => run.finishedAt ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime() : null)
    .filter((duration): duration is number => duration !== null && Number.isFinite(duration) && duration >= 0)
    .sort((left, right) => left - right);
  const p95Duration = recentDurations.length ? recentDurations[Math.min(recentDurations.length - 1, Math.ceil(recentDurations.length * 0.95) - 1)] : 0;
  const runTrend = buildRunTrendSeries(range, recentRuns);
  const qualityTrend = buildQualityTrendSeries(range, evaluationOverview?.recentResults ?? []);
  const runsWindow = `days=${range}`;
  const launchPlan = [
    {
      label: "Capture a first trace",
      complete: recentRuns.length > 0,
      href: `/dashboard/${projectId}/runs?${runsWindow}`,
    },
    {
      label: "Review runtime cost",
      complete: totalSpend > 0,
      href: `/dashboard/${projectId}/costs`,
    },
    {
      label: "Add an evaluation",
      complete: Boolean(evaluationOverview?.resultCount),
      href: `/dashboard/${projectId}/evaluation`,
    },
    {
      label: "Set alert coverage",
      complete: Boolean(summary?.totals.alertCount),
      href: `/dashboard/${projectId}/settings`,
    },
  ];

  return (
    <div className="dashboard-grid flex flex-col gap-8 p-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-pixel text-xl uppercase tracking-wide text-black">
            Workspace health
          </h2>
          <p className="mt-1 font-mono text-[11px] text-black/55">
            Find the next failure worth investigating.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
          <div className="flex gap-2">
            {[
              { label: "1d", value: 1 },
              { label: "7d", value: 7 },
              { label: "30d", value: 30 },
              { label: "90d", value: 90 },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={range === option.value}
                aria-label={`Show workspace health for ${option.label}`}
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams.toString());
                  nextParams.set("range", String(option.value));
                  router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
                }}
                className={
                  range === option.value
                    ? "h-8 border border-black bg-black px-3 font-mono text-[11px] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    : "h-8 border border-black/15 bg-white px-3 font-mono text-[11px] text-black/55 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          <AnalyticsRefreshControl
            stats={stats}
            refreshing={refreshing}
            onRefresh={refreshStats}
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <DashboardMetric
          label="Spend"
          value={formatGraphCurrency(totalSpend)} 
          icon={DollarSign}
          href={`/dashboard/${projectId}/costs`}
          detail={useSavedFallback ? "Saved summary" : `Could save ${formatGraphCurrency(couldHaveSavedUsd)}`}
        />
        <DashboardMetric
          label="Spans"
          value={totalSpans.toLocaleString()} 
          icon={Zap} 
          detail={`Observed in last ${range} days`}
          href={`/dashboard/${projectId}/runs?${runsWindow}`}
        />
        <DashboardMetric
          label="Active Runs" 
          value={activeRuns.toString()} 
          icon={Activity} 
          signal="info"
          detail="Currently running"
          href={`/dashboard/${projectId}/runs?status=running&${runsWindow}`}
        />
        <DashboardMetric
          label="Failed Runs" 
          value={failedRuns.toString()} 
          icon={AlertTriangle} 
          signal={failedRuns > 0 ? "danger" : "success"}
          detail={failedRuns > 0 ? "Needs attention" : "No failures detected"}
          href={`/dashboard/${projectId}/runs?status=failed&${runsWindow}`}
        />
        <DashboardMetric
          label="Failure Rate"
          value={`${recentFailureRate.toFixed(1)}%`}
          icon={Percent}
          signal={recentFailureRate > 0 ? "warning" : "success"}
          detail={recentRuns.length ? `Recent ${recentRuns.length}-run sample` : "No recent runs"}
          href={`/dashboard/${projectId}/runs?status=failed&${runsWindow}`}
        />
        <DashboardMetric
          label="p95 Latency"
          value={p95Duration ? formatDuration(p95Duration) : "—"}
          icon={Gauge}
          signal={p95Duration > 10000 ? "warning" : "neutral"}
          detail={recentDurations.length ? "Recent completed runs" : "No completed runs"}
          href={`/dashboard/${projectId}/runs?sort=duration&${runsWindow}`}
        />
        <DashboardMetric
          label="Evaluation Quality"
          value={evaluationOverview?.passRate === null || evaluationOverview?.passRate === undefined ? "—" : `${Math.round(evaluationOverview.passRate * 100)}%`}
          icon={CircleCheck}
          signal={evaluationOverview?.passRate === null || evaluationOverview?.passRate === undefined ? "neutral" : evaluationOverview.passRate >= 0.9 ? "success" : "warning"}
          detail={evaluationOverview?.resultCount ? `${evaluationOverview.resultCount} evaluation results` : "No evaluation results"}
          href={`/dashboard/${projectId}/evaluation`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <Card className="border-black/15 bg-white p-0 shadow-none">
          <div className="flex items-start justify-between gap-4 border-b border-black/15 p-5">
            <div>
              <h3 className="font-mono text-sm uppercase tracking-widest text-black">Attention queue</h3>
              <p className="mt-1 font-mono text-[10px] text-black/55">The fastest path to your next useful action.</p>
            </div>
            <SignalBadge signal={failedRuns > 0 ? "danger" : "success"}>{failedRuns > 0 ? `${failedRuns} open` : "Clear"}</SignalBadge>
          </div>
          {failedRuns > 0 ? (
            <div>
              <AttentionItem label={`${failedRuns} failed run${failedRuns === 1 ? "" : "s"} need review`} detail="Open the failed-runs view to inspect the latest error." signal="danger" href={`/dashboard/${projectId}/runs?status=failed&${runsWindow}`} />
              <AttentionItem label="Review recent activity" detail="Compare the newest traces against successful runs." signal="info" href={`/dashboard/${projectId}/runs?${runsWindow}`} />
            </div>
          ) : (
            <div className="flex items-start gap-3 p-5">
              <CircleCheck className="mt-0.5 size-4 text-emerald-300" aria-hidden="true" />
              <div>
                <p className="font-mono text-xs text-black">No failures in the current window.</p>
                <p className="mt-1 font-mono text-[10px] text-black/55">Keep an eye on latency and spend as traffic grows.</p>
              </div>
            </div>
          )}
        </Card>
        <Card className="border-black/15 bg-white p-0 shadow-none">
          <div className="border-b border-black/15 p-5">
          <h3 className="font-mono text-sm uppercase tracking-widest text-black">Launch plan</h3>
          <p className="mt-1 font-mono text-[10px] text-black/55">A lightweight path to a more useful workspace.</p>
          </div>
          <ol className="space-y-2 p-4">
            {launchPlan.map((item, index) => (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center gap-3 border border-black/15 p-3 font-mono text-xs text-black/70 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
                  <span className={item.complete ? "flex size-5 shrink-0 items-center justify-center bg-emerald-600 text-white" : "flex size-5 shrink-0 items-center justify-center border border-black/30 text-black/55"}>
                    {item.complete ? <CircleCheck className="size-3" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={item.complete ? "line-through decoration-black/75 text-black/55" : "flex-1"}>{item.label}</span>
                  <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Orchestration Savings */}
      <OrchestrationSavings projectId={projectId} range={range} />

      {/* Fail-open Alert */}
      <FailOpenAlert projectId={projectId} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 rounded-none border-border bg-white shadow-none">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-mono text-[14px] text-black">Run Volume &amp; Failure Rate</h3>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-black/55">
                {recentRuns.length ? `Recent ${recentRuns.length}-run sample · selected ${range}-day window` : "No run summaries in the selected window"}
              </p>
            </div>
            <Activity className="size-4 text-black/55" aria-hidden="true" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={runTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(0,0,0,0.6)" fontSize={10} tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis yAxisId="runs" stroke="rgba(0,0,0,0.6)" fontSize={10} allowDecimals={false} />
                <YAxis yAxisId="failure" orientation="right" stroke="rgba(0,0,0,0.6)" fontSize={10} tickFormatter={(value) => `${value}%`} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "0px", fontSize: "12px", fontFamily: "var(--font-geist-mono)" }} />
                <Bar yAxisId="runs" dataKey="runs" fill="#000000" barSize={18} name="Runs" />
                <Line yAxisId="failure" type="monotone" dataKey="failureRate" stroke="#B45309" strokeWidth={2} dot={false} name="Failure rate" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 rounded-none border-border bg-white shadow-none">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-mono text-[14px] text-black">Quality Score Trend</h3>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-black/55">
                {evaluationOverview?.resultCount ? `${evaluationOverview.resultCount} recent evaluation results` : "No evaluation results in the selected window"}
              </p>
            </div>
            <CircleCheck className="size-4 text-black/55" aria-hidden="true" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(0,0,0,0.6)" fontSize={10} tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis stroke="rgba(0,0,0,0.6)" fontSize={10} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(0)}%`} contentStyle={{ backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "0px", fontSize: "12px", fontFamily: "var(--font-geist-mono)" }} />
                <Line type="monotone" dataKey="passRate" stroke="#000000" strokeWidth={2} dot={{ r: 2, fill: "#000000" }} name="Pass rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 rounded-none border-border bg-white shadow-none">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-mono text-[14px] text-black">Spend Over Time</h3>
              <Clock3 className="size-4 text-black/55" aria-hidden="true" />
            </div>
            <p className="text-[11px] text-black/55 uppercase tracking-widest mt-1">
              {analyticsDailyCosts.length
                ? `LLM infrastructure costs, last ${range} day${range === 1 ? "" : "s"}`
                : `Saved run summaries, last ${range} day${range === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(0,0,0,0.45)"
                  fontSize={10} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis
                  stroke="rgba(0,0,0,0.45)"
                  fontSize={10}
                  tickFormatter={(val) => formatGraphCurrency(Number(val))}
                />
                <Tooltip 
                  formatter={(value) => formatGraphCurrency(Number(value))}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "0px", fontSize: "12px", fontFamily: "var(--font-geist-mono)" }}
                  itemStyle={{ color: "#000000" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalCostUsd" 
                  stroke="#000000"
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: "#FFFFFF", stroke: "#000000", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Runs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[14px] text-black uppercase tracking-widest">Recent Activity</h3>
          <Link
            href={`/dashboard/${projectId}/manage`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "text-[11px] uppercase",
            })}
          >
            Manage Project
          </Link>
        </div>
        <RunsTable projectId={projectId} />
      </div>
    </div>
  );
}

type CostSeriesRun = {
  startedAt: string;
  totalCostUsd: number;
  spanCount: number;
};

function buildDailyCostSeries(range: number, runs: CostSeriesRun[]) {
  const today = new Date();
  const days = Array.from({ length: range }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (range - 1 - index));
    return date.toISOString().slice(0, 10);
  });
  const byDay = new Map(
    days.map((day) => [day, { day, totalCostUsd: 0, spanCount: 0 }]),
  );

  for (const run of runs) {
    const day = new Date(run.startedAt).toISOString().slice(0, 10);
    const bucket = byDay.get(day);
    if (!bucket) continue;
    bucket.totalCostUsd += run.totalCostUsd;
    bucket.spanCount += run.spanCount;
  }

  return days.map((day) => byDay.get(day)!);
}

function buildRunTrendSeries(range: number, runs: Array<{ startedAt: string; status: string }>) {
  const today = new Date();
  const days = Array.from({ length: range }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (range - 1 - index));
    return date.toISOString().slice(0, 10);
  });
  return days.map((day) => {
    const dayRuns = runs.filter((run) => run.startedAt.slice(0, 10) === day);
    return {
      day,
      runs: dayRuns.length,
      failureRate: dayRuns.length ? Math.round((dayRuns.filter((run) => run.status === "failed").length / dayRuns.length) * 100) : 0,
    };
  });
}

function buildQualityTrendSeries(range: number, results: Array<{ createdAt?: number; status: string }>) {
  const today = new Date();
  const days = Array.from({ length: range }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (range - 1 - index));
    return date.toISOString().slice(0, 10);
  });
  return days.map((day) => {
    const dayResults = results.filter((result) => result.createdAt !== undefined && new Date(result.createdAt).toISOString().slice(0, 10) === day);
    return { day, passRate: dayResults.length ? (dayResults.filter((result) => result.status === "passed").length / dayResults.length) * 100 : 0 };
  });
}

function formatGraphCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
