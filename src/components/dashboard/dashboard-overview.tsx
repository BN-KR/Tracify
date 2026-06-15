"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Activity, DollarSign, Zap, AlertTriangle } from "lucide-react";
import { RunsTable } from "./runs-table";
import { useProjectStats } from "@/hooks/use-project-stats";
import { AnalyticsRefreshControl } from "./analytics-refresh-control";

interface DashboardOverviewProps {
  projectId: string;
}

export function DashboardOverview({ projectId }: DashboardOverviewProps) {
  const [range, setRange] = useState(7);
  const recentRuns = useQuery(
    api.agentRuns.getRecentRunsByProject, 
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const summary = useQuery(
    api.projects.getProjectManagementSummary,
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

  if (loading || recentRuns === undefined || summary === undefined) {
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-mono text-[14px] uppercase tracking-widest text-white">
            Overview
          </h2>
          <p className="mt-1 font-mono text-[11px] text-[#666666]">
            Spend, savings, and recent run health.
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
                onClick={() => setRange(option.value)}
                className={
                  range === option.value
                    ? "h-8 border border-white bg-white px-3 font-mono text-[11px] text-black"
                    : "h-8 border border-[#2A2A2A] bg-black px-3 font-mono text-[11px] text-[#777777] hover:text-white"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <OverviewCard 
          label="Spend"
          value={formatGraphCurrency(totalSpend)} 
          icon={DollarSign}
          trend={
            useSavedFallback
              ? "Saved total fallback"
              : `Could have saved ${formatGraphCurrency(couldHaveSavedUsd)}`
          }
        />
        <OverviewCard 
          label="Spans"
          value={totalSpans.toLocaleString()} 
          icon={Zap} 
        />
        <OverviewCard 
          label="Active Runs" 
          value={activeRuns.toString()} 
          icon={Activity} 
          status="live"
        />
        <OverviewCard 
          label="Failed Runs" 
          value={failedRuns.toString()} 
          icon={AlertTriangle} 
          status={failedRuns > 0 ? "warning" : "stable"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 rounded-none border-border bg-[#111111] shadow-none">
          <div className="mb-6">
            <h3 className="font-mono text-[14px] text-white">Spend Over Time</h3>
            <p className="text-[11px] text-[#666666] uppercase tracking-widest mt-1">
              {analyticsDailyCosts.length
                ? `LLM infrastructure costs, last ${range} day${range === 1 ? "" : "s"}`
                : `Saved run summaries, last ${range} day${range === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#666666" 
                  fontSize={10} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis
                  stroke="#666666"
                  fontSize={10}
                  tickFormatter={(val) => formatGraphCurrency(Number(val))}
                />
                <Tooltip 
                  formatter={(value) => formatGraphCurrency(Number(value))}
                  contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: "0px", fontSize: "12px", fontFamily: "var(--font-geist-mono)" }}
                  itemStyle={{ color: "#FFFFFF" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalCostUsd" 
                  stroke="#FFFFFF" 
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
          <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">Recent Activity</h3>
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

function formatGraphCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function OverviewCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  status 
}: { 
  label: string; 
  value: string; 
  icon: any; 
  trend?: string;
  status?: "live" | "warning" | "stable"
}) {
  return (
    <Card className="p-5 rounded-none border-border bg-[#111111] shadow-none group hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{label}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-mono text-white">{value}</h4>
            {status === "live" && <div className="size-2 bg-white animate-pulse" />}
          </div>
          {trend && <p className="text-[10px] text-zinc-600 font-mono">{trend}</p>}
        </div>
        <div className="p-2 border border-border group-hover:border-zinc-700 transition-colors">
          <Icon className={cn("size-4", status === "warning" ? "text-amber-500" : "text-zinc-500")} />
        </div>
      </div>
    </Card>
  );
}
