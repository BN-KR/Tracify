"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStats } from "@/hooks/use-project-stats";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsRefreshControl } from "./analytics-refresh-control";

export function CostDashboard({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const summary = useQuery(api.projects.getProjectManagementSummary, {
    projectId: projectId as Id<"projects">,
  });
  const [range, setRange] = useState(() => Number(searchParams.get("days")) || 30);
  const liveRefreshKey =
    summary?.latestActivityAt ??
    summary?.totals.totalRuns ??
    summary?.totals.totalSpans ??
    null;
  const {
    stats,
    loading: loadingStats,
    refreshing,
    refreshStats,
  } = useProjectStats({
    projectId,
    range,
    liveRefreshKey,
  });

  const totalSpend = useMemo(() => {
    const analyticsTotal =
      stats?.dailyCosts.reduce((sum, day) => sum + day.totalCostUsd, 0) ?? 0;
    return stats?.unavailable ? summary?.totals.totalCostUsd || 0 : analyticsTotal;
  }, [stats, summary]);

  const chartDailyCosts = useMemo(() => {
    const analyticsDailyCosts = stats?.dailyCosts ?? [];
    return analyticsDailyCosts.length
      ? analyticsDailyCosts
      : buildDailyCostSeries(range, summary?.recentRuns ?? []);
  }, [range, stats, summary]);

  const costImpact = useMemo(() => {
    const peakSpend = Math.max(
      ...chartDailyCosts.map((day) => day.totalCostUsd),
      0,
    );
    const chartData = chartDailyCosts.map((day) => ({
      ...day,
      baselineUsd: peakSpend,
      avoidedUsd: Math.max(peakSpend - day.totalCostUsd, 0),
    }));
    const avoidedUsd = chartData.reduce((sum, day) => sum + day.avoidedUsd, 0);
    const latestSpend = chartData.at(-1)?.totalCostUsd ?? 0;
    const couldHaveSavedUsd = chartData.reduce(
      (sum, day) => sum + Math.max(day.totalCostUsd - latestSpend, 0),
      0,
    );
    const couldSaveDailyUsd = Math.max(peakSpend - latestSpend, 0);
    const peakDay = chartData.find((day) => day.totalCostUsd === peakSpend);

    return {
      chartData,
      avoidedUsd,
      couldHaveSavedUsd,
      couldSaveDailyUsd,
      latestSpend,
      peakDay,
      peakSpend,
    };
  }, [chartDailyCosts]);

  function changeRange(days: number) {
    setRange(days);
    router.replace(`/dashboard/${projectId}/costs?days=${days}`, { scroll: false });
  }

  if (summary === undefined || loadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-none" />
        <Skeleton className="h-80 w-full rounded-none" />
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

  return (
    <div className="space-y-6">
      <Card className="rounded-none border-black/15 bg-white p-6 shadow-none">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-black/55">
                total spend
              </div>
              <div className="mt-2 font-mono text-4xl text-black">
                {formatCurrency(totalSpend)}
              </div>
              <p className="mt-2 font-mono text-[11px] text-black/55">
                {chartDailyCosts.some((day) => day.totalCostUsd > 0)
                  ? "Live analytics plus saved run summaries."
                  : "Saved run summaries will appear here as runs arrive."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 lg:ml-auto">
              <div className="flex gap-2">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => changeRange(days)}
                    className={
                      range === days
                        ? "h-8 border border-black bg-black px-3 font-mono text-[11px] text-white"
                        : "h-8 border border-black/15 bg-white px-3 font-mono text-[11px] text-black/55 hover:text-black"
                    }
                  >
                {days}d
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
            <div className="mt-4 grid max-w-xl gap-2 sm:grid-cols-2">
              <InlineSavingsMetric
                label="could have saved"
                value={formatGraphCurrency(costImpact.couldHaveSavedUsd)}
                sublabel="selected period"
              />
              <InlineSavingsMetric
                label="could save"
                value={`${formatGraphCurrency(costImpact.couldSaveDailyUsd)}/day`}
                sublabel="versus peak day"
              />
            </div>
          </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <ImpactMetric
                label="peak day"
                value={formatCurrency(costImpact.peakSpend)}
                sublabel={costImpact.peakDay?.day ?? "Current range"}
              />
              <ImpactMetric
                label="latest day"
                value={formatCurrency(costImpact.latestSpend)}
                sublabel="current run-rate"
              />
              <ImpactMetric
                label="could save"
                value={formatGraphCurrency(costImpact.couldSaveDailyUsd)}
                sublabel="per day vs peak"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/15 pt-4 font-mono text-[10px] text-black/55">
            <span>Measured span spend · selected period · {stats?.unavailable ? "saved-summary fallback" : "analytics-backed"}</span>
            <Link href={`/dashboard/${projectId}/runs`} className="text-black/70 underline-offset-4 hover:text-black hover:underline">Open runs →</Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-none border-black/15 bg-white p-6 shadow-none">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-mono text-[14px] uppercase tracking-widest text-black">
                Savings Impact
              </h2>
              <p className="mt-1 font-mono text-[11px] text-black/55">
                Spend compared with a peak-day baseline.
              </p>
            </div>
            <div className="border border-black/15 bg-white px-3 py-2 font-mono text-[11px] text-black/60">
              shaded area = estimated avoided spend
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costImpact.chartData}>
                <defs>
                  <linearGradient id="avoidedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(0,0,0,0.12)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="rgba(0,0,0,0.45)"
                  fontSize={10}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  stroke="rgba(0,0,0,0.45)"
                  fontSize={10}
                  domain={[0, "auto"]}
                  tickFormatter={(value) => formatGraphCurrency(Number(value))}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatGraphCurrency(Number(value)),
                    name === "totalCostUsd"
                      ? "Spend"
                      : name === "avoidedUsd"
                        ? "Avoided"
                        : "Peak baseline",
                  ]}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.15)",
                    borderRadius: "0px",
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avoidedUsd"
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth={1}
                  fill="url(#avoidedGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="totalCostUsd"
                  stroke="#000000"
                  strokeWidth={2}
                  fill="url(#spendGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="baselineUsd"
                  stroke="rgba(0,0,0,0.45)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-none border-black/15 bg-white p-6 shadow-none">
          <div className="mb-6">
            <h2 className="font-mono text-[14px] uppercase tracking-widest text-black">
              Cost By Model
            </h2>
            <p className="mt-1 font-mono text-[11px] text-black/55">
              LLM calls grouped by model.
            </p>
          </div>
          {stats?.modelCosts.length ? (
            <>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.modelCosts} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="modelId"
                    type="category"
                    stroke="rgba(0,0,0,0.45)"
                    fontSize={10}
                    width={96}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.15)",
                      borderRadius: "0px",
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  />
                  <Bar dataKey="totalCostUsd" barSize={12}>
                    {stats.modelCosts.map((_, index) => (
                      <Cell
                        key={index}
                        fill={index === 0 ? "#000000" : "rgba(0,0,0,0.35)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-1 border-t border-black/15 pt-3">
              {stats.modelCosts.slice(0, 6).map((model) => (
                <Link key={model.modelId} href={`/dashboard/${projectId}/runs?model=${encodeURIComponent(model.modelId)}&sort=cost`} className="flex items-center justify-between gap-3 px-2 py-2 font-mono text-[10px] text-black/60 transition-colors hover:bg-[#f3f2ed] hover:text-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black">
                  <span className="truncate">Inspect {model.modelId}</span>
                  <span className="shrink-0">{formatCurrency(model.totalCostUsd)} →</span>
                </Link>
              ))}
            </div>
            </>
          ) : (
            <div className="border border-dashed border-black/15 p-6 font-mono text-[12px] text-black/55">
              No model cost data for this period.
            </div>
          )}
        </Card>
      </div>

      <Card className="rounded-none border-black/15 bg-white p-6 shadow-none">
        <div className="mb-6">
          <h2 className="font-mono text-[14px] uppercase tracking-widest text-black">Cost By End User</h2>
          <p className="mt-1 font-mono text-[11px] text-black/55">Per-user spend and token usage from trace context.</p>
        </div>
        {stats?.userCosts?.length ? (
          <div className="divide-y divide-black/15 border border-black/15">
            {stats.userCosts.slice(0, 10).map((user) => (
              <div key={user.endUserId} className="grid gap-2 px-4 py-3 font-mono text-[11px] sm:grid-cols-[minmax(0,1fr)_120px_120px_80px]">
                <span className="truncate text-black">{user.endUserId}</span>
                <span className="text-black/60">{user.totalTokens.toLocaleString()} tokens</span>
                <span className="text-black/70">{formatCurrency(user.totalCostUsd)}</span>
                <span className="text-right text-black/55">{user.spanCount} spans</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-black/15 p-6 font-mono text-[12px] text-black/55">No end-user identifiers captured for this period.</div>
        )}
      </Card>

      <Card className="rounded-none border-black/15 bg-white p-6 shadow-none">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-mono text-[14px] uppercase tracking-widest text-black">
              Most Expensive Saved Runs
            </h2>
            <p className="mt-1 font-mono text-[11px] text-black/55">
              Convex summaries, sorted by total run cost.
            </p>
          </div>
          <Link
            href={`/dashboard/${projectId}/settings`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "text-[11px] uppercase",
            })}
          >
            Set threshold
          </Link>
        </div>
        <div className="divide-y divide-black/15 border border-black/15">
          {[...summary.recentRuns]
            .sort((a, b) => b.totalCostUsd - a.totalCostUsd)
            .slice(0, 10)
            .map((run) => (
              <Link
                key={run._id}
                href={`/dashboard/${projectId}/runs/${run.runId}`}
                className="grid gap-3 px-4 py-3 font-mono text-[12px] text-black/60 transition-colors hover:bg-[#f3f2ed] sm:grid-cols-[minmax(0,1fr)_120px_100px]"
              >
                <span className="truncate text-black">{run.runId}</span>
                <span>{run.spanCount} spans</span>
                <span className="text-right">{formatCurrency(run.totalCostUsd)}</span>
              </Link>
            ))}
        </div>
      </Card>
    </div>
  );
}

function ImpactMetric({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="border border-black/15 bg-white p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-black/55">
        {label}
      </div>
      <div className="mt-2 font-mono text-lg text-black">{value}</div>
      <div className="mt-1 truncate font-mono text-[10px] text-black/55">
        {sublabel}
      </div>
    </div>
  );
}

function InlineSavingsMetric({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="border border-black/15 bg-white px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-black/55">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm text-black">{value}</div>
      <div className="mt-0.5 font-mono text-[10px] text-black/55">
        {sublabel}
      </div>
    </div>
  );
}

function formatGraphCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
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
