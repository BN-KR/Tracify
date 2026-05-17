"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

export function CostDashboard({ projectId }: { projectId: string }) {
  const summary = useQuery(api.projects.getProjectManagementSummary, {
    projectId: projectId as Id<"projects">,
  });
  const [range, setRange] = useState(30);
  const liveRefreshKey =
    summary?.latestActivityAt ??
    summary?.totals.totalRuns ??
    summary?.totals.totalSpans ??
    null;
  const { stats, loading: loadingStats } = useProjectStats({
    projectId,
    range,
    liveRefreshKey,
  });

  const totalSpend = useMemo(() => {
    const tinybirdTotal =
      stats?.dailyCosts.reduce((sum, day) => sum + day.totalCostUsd, 0) ?? 0;
    return stats?.unavailable ? summary?.totals.totalCostUsd || 0 : tinybirdTotal;
  }, [stats, summary]);

  const costImpact = useMemo(() => {
    const dailyCosts = stats?.dailyCosts ?? [];
    const peakSpend = Math.max(
      ...dailyCosts.map((day) => day.totalCostUsd),
      0,
    );
    const chartData = dailyCosts.map((day) => ({
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
  }, [stats]);

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
      <div className="border border-[#2A2A2A] bg-[#111111] p-6 font-mono text-sm text-[#999999]">
        Project not found or access denied.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-6 shadow-none">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#666666]">
              total spend
            </div>
            <div className="mt-2 font-mono text-4xl text-white">
              {formatCurrency(totalSpend)}
            </div>
            <p className="mt-2 font-mono text-[11px] text-[#777777]">
              {stats?.unavailable
                ? "Using saved Convex run summaries until Tinybird analytics are available."
                : "Live analytics plus saved run summaries."}
            </p>
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
              sublabel={costImpact.peakDay?.day ?? "No data"}
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
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRange(days)}
                className={
                  range === days
                    ? "h-8 border border-white bg-white px-3 font-mono text-[11px] text-black"
                    : "h-8 border border-[#2A2A2A] bg-black px-3 font-mono text-[11px] text-[#777777] hover:text-white"
                }
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-6 shadow-none">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-mono text-[14px] uppercase tracking-widest text-white">
                Savings Impact
              </h2>
              <p className="mt-1 font-mono text-[11px] text-[#666666]">
                Spend compared with a peak-day baseline.
              </p>
            </div>
            <div className="border border-[#2A2A2A] bg-black px-3 py-2 font-mono text-[11px] text-[#999999]">
              shaded area = estimated avoided spend
            </div>
          </div>
          {costImpact.chartData.length ? (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costImpact.chartData}>
                  <defs>
                    <linearGradient id="avoidedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#242424" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#666666"
                    fontSize={10}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    stroke="#666666"
                    fontSize={10}
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
                      backgroundColor: "#0A0A0A",
                      border: "1px solid #2A2A2A",
                      borderRadius: "0px",
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avoidedUsd"
                    stroke="#555555"
                    strokeWidth={1}
                    fill="url(#avoidedGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalCostUsd"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    fill="url(#spendGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="baselineUsd"
                    stroke="#71717A"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyCostState projectId={projectId} />
          )}
        </Card>

        <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-6 shadow-none">
          <div className="mb-6">
            <h2 className="font-mono text-[14px] uppercase tracking-widest text-white">
              Cost By Model
            </h2>
            <p className="mt-1 font-mono text-[11px] text-[#666666]">
              LLM calls grouped by model.
            </p>
          </div>
          {stats?.modelCosts.length ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.modelCosts} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="modelId"
                    type="category"
                    stroke="#666666"
                    fontSize={10}
                    width={96}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0A0A",
                      border: "1px solid #2A2A2A",
                      borderRadius: "0px",
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "#161616" }}
                  />
                  <Bar dataKey="totalCostUsd" barSize={12}>
                    {stats.modelCosts.map((_, index) => (
                      <Cell
                        key={index}
                        fill={index === 0 ? "#FFFFFF" : "#555555"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="border border-dashed border-[#2A2A2A] p-6 font-mono text-[12px] text-[#666666]">
              No model cost data for this period.
            </div>
          )}
        </Card>
      </div>

      <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-6 shadow-none">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-mono text-[14px] uppercase tracking-widest text-white">
              Most Expensive Saved Runs
            </h2>
            <p className="mt-1 font-mono text-[11px] text-[#666666]">
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
        <div className="divide-y divide-[#222222] border border-[#222222]">
          {[...summary.recentRuns]
            .sort((a, b) => b.totalCostUsd - a.totalCostUsd)
            .slice(0, 10)
            .map((run) => (
              <Link
                key={run._id}
                href={`/dashboard/${projectId}/runs/${run.runId}`}
                className="grid gap-3 px-4 py-3 font-mono text-[12px] text-[#999999] transition-colors hover:bg-[#161616] sm:grid-cols-[minmax(0,1fr)_120px_100px]"
              >
                <span className="truncate text-white">{run.runId}</span>
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
    <div className="border border-[#2A2A2A] bg-black p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#666666]">
        {label}
      </div>
      <div className="mt-2 font-mono text-lg text-white">{value}</div>
      <div className="mt-1 truncate font-mono text-[10px] text-[#777777]">
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
    <div className="border border-[#242424] bg-black px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#666666]">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm text-white">{value}</div>
      <div className="mt-0.5 font-mono text-[10px] text-[#777777]">
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

function EmptyCostState({ projectId }: { projectId: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-[#2A2A2A] p-6 text-center">
      <div className="font-mono text-sm uppercase tracking-widest text-white">
        No cost data for this period.
      </div>
      <Link
        href={`/dashboard/${projectId}/quickstart`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "mt-4 text-[11px] uppercase",
        })}
      >
        View quickstart
      </Link>
    </div>
  );
}
