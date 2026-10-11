"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BarChart3, CircleCheck, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ScoreRecord = {
  _id: string;
  name: string;
  value: number | boolean | string;
  dataType: "numeric" | "boolean" | "categorical" | "text";
  source: "human" | "llm" | "code" | "user";
  createdAt: number;
};

type ScoreMetricSummary = {
  name: string;
  count: number;
  average: number | null;
  passRate: number | null;
  latestAt: number;
  sources: string[];
};

function buildDailySeries(scores: ScoreRecord[], days = 30) {
  const today = new Date();
  const buckets = new Map<string, { day: string; count: number; numericTotal: number; numericCount: number; booleanPass: number; booleanCount: number }>();
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, { day: key, count: 0, numericTotal: 0, numericCount: 0, booleanPass: 0, booleanCount: 0 });
  }
  for (const score of scores) {
    const key = new Date(score.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.count += 1;
    if (score.dataType === "numeric" && typeof score.value === "number") {
      bucket.numericTotal += score.value;
      bucket.numericCount += 1;
    }
    if (score.dataType === "boolean" && typeof score.value === "boolean") {
      bucket.booleanCount += 1;
      if (score.value) bucket.booleanPass += 1;
    }
  }
  return [...buckets.values()].map((bucket) => ({
    ...bucket,
    average: bucket.numericCount ? bucket.numericTotal / bucket.numericCount : null,
    passRate: bucket.booleanCount ? (bucket.booleanPass / bucket.booleanCount) * 100 : null,
  }));
}

function MetricTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="min-h-[132px] justify-between p-5 shadow-none">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      </div>
      <div>
        <div className="font-pixel text-3xl tracking-tight text-zinc-100">{value}</div>
        <div className="mt-2 font-mono text-[10px] text-zinc-500">{detail}</div>
      </div>
    </Card>
  );
}

const tooltipStyle = {
  backgroundColor: "#111418",
  border: "1px solid rgba(63,63,68,0.95)",
  borderRadius: "0px",
  fontSize: "12px",
  fontFamily: "var(--font-geist-mono, monospace)",
} as const;

export default function ScoreAnalyticsPage() {
  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const scores = useQuery(api.evaluation.listScores, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const metrics = useQuery(api.evaluation.scoreMetrics, projectId ? { projectId: projectId as Id<"projects"> } : "skip");

  const daily = useMemo(() => (scores ? buildDailySeries(scores) : []), [scores]);

  if (project === null) {
    return (
      <div className="min-h-full bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
        <div role="alert" className="border border-zinc-800 bg-[#111418] p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Project unavailable</p>
          <h1 className="mt-3 font-pixel text-3xl tracking-tight text-zinc-100">This project could not be loaded.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">The selected project may have been deleted, or your session may not have access to it.</p>
        </div>
      </div>
    );
  }
  if (project === undefined || scores === undefined || metrics === undefined) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 sm:p-6">
        <Skeleton className="h-24 w-full rounded-none bg-zinc-800" />
        <div className="grid grid-cols-2 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[132px] rounded-none bg-zinc-800" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-none bg-zinc-800" />
      </div>
    );
  }

  const numericScores = scores.filter((score: ScoreRecord) => score.dataType === "numeric" && typeof score.value === "number");
  const booleanScores = scores.filter((score: ScoreRecord) => score.dataType === "boolean" && typeof score.value === "boolean");
  const overallAverage = numericScores.length ? numericScores.reduce((sum, score) => sum + Number(score.value), 0) / numericScores.length : null;
  const overallPass = booleanScores.length ? (booleanScores.filter((score) => score.value === true).length / booleanScores.length) * 100 : null;
  const withActivity = daily.filter((entry) => entry.count > 0);

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Improve / scores / analytics</p>
          <h1 className="mt-2 font-pixel text-3xl leading-[0.9] tracking-tight text-zinc-100">Scores analytics</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Aggregate score activity from human review, LLM judges, code evaluators, and user feedback.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          <span className="border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">{scores.length} scores · {metrics.length} families</span>
          <Link href={`/dashboard/${projectId}/scores`} className="inline-flex min-h-8 items-center border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
            Score records
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
        <MetricTile label="Scores analyzed" value={String(scores.length)} detail="Latest recorded window" />
        <MetricTile label="Overall numeric avg" value={overallAverage === null ? "—" : overallAverage.toFixed(3)} detail={numericScores.length ? `${numericScores.length} numeric samples` : "No numeric samples"} />
        <MetricTile label="Overall pass rate" value={overallPass === null ? "—" : `${overallPass.toFixed(0)}%`} detail={booleanScores.length ? `${booleanScores.length} boolean samples` : "No boolean samples"} />
        <MetricTile label="Active days" value={String(withActivity.length)} detail="Days with score activity" />
      </div>

      <Card className="border-zinc-800 bg-[#111418] p-0 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 p-5">
          <div>
            <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">Daily score activity</h2>
            <p className="mt-1 font-mono text-[10px] text-zinc-500">Recorded scores per day, last 30 days, with numeric average overlay.</p>
          </div>
          <Activity className="size-4 text-zinc-500" aria-hidden="true" />
        </div>
        <div className="h-[260px] w-full p-4 pb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" fontSize={10} tickFormatter={(value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
              <YAxis yAxisId="count" stroke="rgba(255,255,255,0.35)" fontSize={10} allowDecimals={false} />
              <YAxis yAxisId="quality" orientation="right" domain={[0, 1]} stroke="rgba(255,255,255,0.35)" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#e4e4e7" }} labelStyle={{ color: "#a1a1aa" }} />
              <Bar yAxisId="count" dataKey="count" fill="#d4d4d8" barSize={14} name="Scores" />
              <Line yAxisId="quality" type="monotone" dataKey="average" stroke="#f4d44d" strokeWidth={2} dot={false} connectNulls name="Numeric avg" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-zinc-800 bg-[#111418] p-0 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 p-5">
          <div>
            <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">Boolean pass rate trend</h2>
            <p className="mt-1 font-mono text-[10px] text-zinc-500">Share of true-scores among boolean gates, last 30 days.</p>
          </div>
          <CircleCheck className="size-4 text-zinc-500" aria-hidden="true" />
        </div>
        <div className="h-[220px] w-full p-4 pb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" fontSize={10} tickFormatter={(value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.35)" fontSize={10} tickFormatter={(value: number) => `${value}%`} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#e4e4e7" }} labelStyle={{ color: "#a1a1aa" }} />
              <Line type="monotone" dataKey="passRate" stroke="#34d399" strokeWidth={2} dot={false} connectNulls name="Pass rate" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-zinc-800 bg-[#111418] p-0 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 p-5">
          <div>
            <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">By metric family</h2>
            <p className="mt-1 font-mono text-[10px] text-zinc-500">Averages, pass rates, and source lineage per score name.</p>
          </div>
          <BarChart3 className="size-4 text-zinc-500" aria-hidden="true" />
        </div>
        {metrics.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No score metrics yet. Record scores through evaluators, review queues, or user feedback.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Metric", "Samples", "Average", "Pass rate", "Sources", "Last recorded"].map((column) => (
                    <th key={column} scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {metrics.map((metric: ScoreMetricSummary) => (
                  <tr key={metric.name} className="transition-colors hover:bg-zinc-900/60">
                    <td className="px-4 py-3 text-sm text-zinc-100">{metric.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">{metric.count}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">{metric.average === null ? "—" : metric.average.toFixed(3)}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <span className={cn(metric.passRate === null ? "text-zinc-500" : metric.passRate >= 0.9 ? "text-emerald-300" : "text-amber-300")}>
                        {metric.passRate === null ? "—" : `${Math.round(metric.passRate * 100)}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{metric.sources.join(" · ") || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{new Date(metric.latestAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="flex items-center gap-2 border-t border-zinc-800 p-5 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          <Target className="size-3" aria-hidden="true" /> Averages and pass rates derive solely from recorded score values.
        </p>
      </Card>
    </div>
  );
}
