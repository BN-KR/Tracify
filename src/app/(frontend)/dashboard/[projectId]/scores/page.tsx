"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { BarChart3, CircleCheck, Percent, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ScoreRecord = {
  _id: string;
  name: string;
  value: number | boolean | string;
  dataType: "numeric" | "boolean" | "categorical" | "text";
  source: "human" | "llm" | "code" | "user";
  traceId?: string;
  spanId?: string;
  comment?: string;
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

const sources: Array<"all" | ScoreRecord["source"]> = ["all", "human", "llm", "code", "user"];
const dataTypes: Array<"all" | ScoreRecord["dataType"]> = ["all", "numeric", "boolean", "categorical", "text"];

function Section({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="border-zinc-800 bg-[#111418] p-0 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 p-5">
        <div className="min-w-0">
          <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">{title}</h2>
          {subtitle ? <p className="mt-1 font-mono text-[10px] text-zinc-500">{subtitle}</p> : null}
        </div>
        {badge}
      </div>
      {children}
    </Card>
  );
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

export default function ScoresPage() {
  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const scores = useQuery(api.evaluation.listScores, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const metrics = useQuery(api.evaluation.scoreMetrics, projectId ? { projectId: projectId as Id<"projects"> } : "skip");

  const [source, setSource] = useState<"all" | ScoreRecord["source"]>("all");
  const [dataType, setDataType] = useState<"all" | ScoreRecord["dataType"]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!scores) return [];
    const term = query.trim().toLowerCase();
    return scores.filter((score) => {
      if (source !== "all" && score.source !== source) return false;
      if (dataType !== "all" && score.dataType !== dataType) return false;
      if (term && !score.name.toLowerCase().includes(term) && !(score.traceId ?? "").toLowerCase().includes(term)) return false;
      return true;
    });
  }, [dataType, query, scores, source]);

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
        <Skeleton className="h-56 w-full rounded-none bg-zinc-800" />
      </div>
    );
  }

  const recordedCount = scores.length;
  const booleanScores = scores.filter((score) => score.dataType === "boolean" && typeof score.value === "boolean");
  const booleanPassRate = booleanScores.length ? (booleanScores.filter((score) => score.value === true).length / booleanScores.length) * 100 : null;
  const numericScores = scores.filter((score) => score.dataType === "numeric" && typeof score.value === "number");
  const numericAverage = numericScores.length ? numericScores.reduce((sum, score) => sum + Number(score.value), 0) / numericScores.length : null;
  const activeSources = new Set(scores.map((score) => score.source));

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Improve / scores</p>
          <h1 className="mt-2 font-pixel text-3xl leading-[0.9] tracking-tight text-zinc-100">Scores</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Quality records attached to traces and spans by human review, LLM judges, code evaluators, and end users.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          <span className="border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">{scores.length} recorded scores</span>
          <Link href={`/dashboard/${projectId}/scores/analytics`} className="inline-flex min-h-8 items-center border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
            Scores analytics
          </Link>
          <Link href={`/dashboard/${projectId}/evaluation/review`} className="inline-flex min-h-8 items-center border border-zinc-100 bg-zinc-100 px-3 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
            Review queue
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
        <MetricTile label="Recorded scores" value={String(recordedCount)} detail="Latest 100 retained here" />
        <MetricTile label="Metric families" value={String(metrics.length)} detail="Distinct score names" />
        <MetricTile
          label="Numeric average"
          value={numericAverage === null ? "—" : numericAverage.toFixed(3)}
          detail={numericScores.length ? `${numericScores.length} numeric samples` : "No numeric samples"}
        />
        <MetricTile
          label="Boolean pass rate"
          value={booleanPassRate === null ? "—" : `${booleanPassRate.toFixed(0)}%`}
          detail={booleanScores.length ? `${booleanScores.length} boolean samples` : "No boolean samples"}
        />
      </div>

      <Section title="Metric families" subtitle="Aggregated across the latest 1,000 scores." badge={
        activeSources.size ? (
          <span className="border border-zinc-700 bg-zinc-900 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Sources · {[...activeSources].sort().join(" · ")}</span>
        ) : undefined
      }>
        {metrics.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No score metrics yet. As evaluators, reviewers, and users score traces, families appear here with average and pass rate.</p>
        ) : (
          <div className="grid gap-px border-t border-zinc-800 bg-zinc-800 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric: ScoreMetricSummary) => (
              <div key={metric.name} className="bg-[#111418] p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="block truncate text-sm text-zinc-100">{metric.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500">{metric.count} samples</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Average</p>
                    <p className="mt-1 font-pixel text-2xl tracking-tight text-zinc-100">{metric.average === null ? "—" : metric.average.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Pass rate</p>
                    <p className={cn("mt-1 font-pixel text-2xl tracking-tight", metric.passRate === null ? "text-zinc-300" : metric.passRate >= 0.9 ? "text-emerald-300" : "text-amber-300")}>
                      {metric.passRate === null ? "—" : `${Math.round(metric.passRate * 100)}%`}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                  <CircleCheck className="size-3 shrink-0" aria-hidden="true" />
                  {metric.sources.join(" · ") || "No sources"} · {new Date(metric.latestAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Score records" subtitle={filtered.length === scores.length ? "Every recorded score in the current view." : `${filtered.length} of ${scores.length} scores match the current filters.`}>
        <div className="grid gap-4 border-b border-zinc-800 p-5 md:grid-cols-[1fr_0.7fr_0.7fr]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500"><Search className="size-3" aria-hidden="true" /> Filter by name or trace</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="quality / trace_…" className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-300" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Source</span>
            <select value={source} onChange={(event) => setSource(event.target.value as "all" | ScoreRecord["source"])} className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
              {sources.map((option) => (
                <option key={option} value={option}>{option === "all" ? "All sources" : option}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Data type</span>
            <select value={dataType} onChange={(event) => setDataType(event.target.value as "all" | ScoreRecord["dataType"])} className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
              {dataTypes.map((option) => (
                <option key={option} value={option}>{option === "all" ? "All types" : option}</option>
              ))}
            </select>
          </label>
        </div>
        {scores.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No scores recorded yet. Human reviews, evaluator runs, and user feedback attach scores to traces automatically.</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 font-mono text-xs text-zinc-500">No scores match the current filters.</p>
        ) : (
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-zinc-900">
                <tr>
                  {["Name", "Value", "Type", "Source", "Trace", "Recorded"].map((column) => (
                    <th key={column} scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map((score: ScoreRecord) => (
                  <tr key={score._id} className="transition-colors hover:bg-zinc-900/60">
                    <td className="px-4 py-3 text-sm text-zinc-100">{score.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">{String(score.value)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{score.dataType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{score.source}</td>
                    <td className="max-w-[220px] px-4 py-3 font-mono text-xs text-zinc-400">
                      <span className="block truncate">{score.traceId || score.spanId || "—"}</span>
                      {score.comment ? <span className="mt-1 block truncate text-zinc-500">{score.comment}</span> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{new Date(score.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        <Percent className="size-3" aria-hidden="true" /> Pass rate uses boolean scores only; averages use numeric samples.
        <BarChart3 className="ml-2 size-3" aria-hidden="true" />
        <Link href={`/dashboard/${projectId}/scores/analytics`} className="underline decoration-dotted hover:text-zinc-300">Open analytics</Link>
      </p>
    </div>
  );
}
