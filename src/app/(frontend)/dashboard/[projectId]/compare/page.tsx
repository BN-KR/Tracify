"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CompareRun = {
  _id: Id<"agentRuns">;
  runId: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  totalCostUsd: number;
  spanCount: number;
  primaryModel?: string;
  environment?: string;
  release?: string;
};

type SpanRow = { spanType: string; modelId?: string; toolName?: string; errorType?: string; errorMessage?: string };
type SpanResponse = { spans?: SpanRow[]; unavailable?: boolean };

const statusStyles: Record<string, string> = {
  completed: "border-emerald-400/35 bg-emerald-400/5 text-emerald-300",
  failed: "border-red-400/35 bg-red-400/5 text-red-300",
  running: "border-sky-300/35 bg-sky-300/5 text-sky-200",
  cancelled: "border-zinc-700 bg-zinc-900 text-zinc-300",
};

function observed(spans: SpanRow[]) {
  return Array.from(new Set(spans.map((span) => span.modelId || span.toolName || span.spanType).filter(Boolean))).slice(0, 6).join(", ") || "None recorded";
}

function errors(spans: SpanRow[]) {
  const found = spans.map((span) => span.errorType || span.errorMessage).filter(Boolean).slice(0, 3).join(", ");
  return found || "None recorded";
}

export default function ComparePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const runs = useQuery(api.agentRuns.listByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");

  const [leftId, setLeftId] = useState(searchParams.get("left") ?? "");
  const [rightId, setRightId] = useState(searchParams.get("right") ?? "");
  const [leftSpan, setLeftSpan] = useState<SpanRow[]>([]);
  const [rightSpan, setRightSpan] = useState<SpanRow[]>([]);
  const [loadingSpan, setLoadingSpan] = useState(false);
  const [spanError, setSpanError] = useState("");

  const defaultLeftId = runs?.length ? (runs.find((run) => run.runId === leftId)?.runId ?? runs.find((run) => run.status === "failed")?.runId ?? runs[0].runId) : "";
  const defaultRightId = runs?.length ? (runs.find((run) => run.runId === rightId)?.runId ?? runs.find((run) => run.status === "completed" && run.runId !== defaultLeftId)?.runId ?? runs[1]?.runId ?? "") : "";
  const effectiveLeftId = leftId && runs?.some((run) => run.runId === leftId) ? leftId : defaultLeftId;
  const effectiveRightId = rightId && runs?.some((run) => run.runId === rightId) ? rightId : defaultRightId;

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (effectiveLeftId) next.set("left", effectiveLeftId); else next.delete("left");
    if (effectiveRightId) next.set("right", effectiveRightId); else next.delete("right");
    const target = `${pathname}?${next.toString()}`;
    if (target !== `${pathname}?${searchParams.toString()}`) router.replace(target, { scroll: false });
  }, [effectiveLeftId, effectiveRightId, pathname, router, searchParams]);

  useEffect(() => {
    if (!effectiveLeftId || !effectiveRightId) return;
    let cancelled = false;
    setTimeout(() => {
      if (!cancelled) {
        setLoadingSpan(true);
        setSpanError("");
      }
    }, 0);
    Promise.all([
      fetch(`/api/projects/${projectId}/runs/${encodeURIComponent(effectiveLeftId)}/spans`).then((response) => response.json() as Promise<SpanResponse>),
      fetch(`/api/projects/${projectId}/runs/${encodeURIComponent(effectiveRightId)}/spans`).then((response) => response.json() as Promise<SpanResponse>),
    ])
      .then(([first, second]) => {
        if (cancelled) return;
        setLeftSpan(first.spans ?? []);
        setRightSpan(second.spans ?? []);
        if (first.unavailable || second.unavailable) setSpanError("One or both span timelines are temporarily unavailable. Run metadata remains comparable.");
      })
      .catch(() => {
        if (!cancelled) setSpanError("Span comparison could not be loaded. Run metadata remains available.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSpan(false);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveLeftId, effectiveRightId, projectId]);

  const left = runs?.find((run) => run.runId === effectiveLeftId) ?? null;
  const right = runs?.find((run) => run.runId === effectiveRightId) ?? null;

  const differences = useMemo(() => {
    if (!left || !right) return [];
    const duration = (run: CompareRun) => (run.finishedAt ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime() : null);
    const entries: Array<[string, string, string]> = [
      ["Status", left.status, right.status],
      ["Duration", duration(left) === null ? "Running" : `${duration(left)} ms`, duration(right) === null ? "Running" : `${duration(right)} ms`],
      ["Cost", `$${left.totalCostUsd.toFixed(4)}`, `$${right.totalCostUsd.toFixed(4)}`],
      ["Spans", String(left.spanCount), String(right.spanCount)],
      ["Primary model", left.primaryModel || "Not recorded", right.primaryModel || "Not recorded"],
      ["Environment", left.environment || "Not recorded", right.environment || "Not recorded"],
      ["Release", left.release || "Not recorded", right.release || "Not recorded"],
      ["Tools / models observed", observed(leftSpan), observed(rightSpan)],
      ["Errors", errors(leftSpan), errors(rightSpan)],
    ];
    return entries.map(([label, first, second]) => ({ label, first, second, changed: first !== second }));
  }, [left, right, leftSpan, rightSpan]);

  if (!runs) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 sm:p-6">
        <Card className="border-zinc-800 bg-[#111418] p-6 shadow-none">
          <p className="flex items-center gap-3 font-mono text-xs text-zinc-400"><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading live runs…</p>
          <SkeletonBar />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Improve / trace compare</p>
          <h1 className="mt-2 font-pixel text-3xl leading-[0.9] tracking-tight text-zinc-100">Trace Compare</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Compare a failed or surprising run against a healthy baseline. Differences are evidence from the selected runs, not a generated diagnosis.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          <span className="border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">{runs.length} recent runs</span>
          <span className="inline-flex min-h-8 items-center gap-2 border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300">
            <Scale className="size-3" aria-hidden="true" /> Evidence comparison
          </span>
        </div>
      </header>

      <Card className="border-zinc-800 bg-[#111418] p-0 shadow-none">
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <label className="block min-w-0">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Run A · investigate</span>
            <select value={leftId} onChange={(event) => setLeftId(event.target.value)} className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
              {runs.map((run: CompareRun) => (
                <option key={run.runId} value={run.runId}>{run.status.toUpperCase()} · {run.runId} · {run.primaryModel || "model unknown"}</option>
              ))}
            </select>
          </label>
          <ArrowRight className="hidden size-5 text-zinc-500 lg:block" aria-hidden="true" />
          <label className="block min-w-0">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Run B · baseline</span>
            <select value={rightId} onChange={(event) => setRightId(event.target.value)} className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
              {runs.map((run: CompareRun) => (
                <option key={run.runId} value={run.runId}>{run.status.toUpperCase()} · {run.runId} · {run.primaryModel || "model unknown"}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {spanError ? (
        <p role="alert" className="border border-amber-400/30 bg-amber-400/5 p-4 font-mono text-xs text-amber-300">{spanError}</p>
      ) : null}

      {left && right ? (
        <>
          <Card className="overflow-hidden border-zinc-800 bg-[#111418] p-0 shadow-none">
            <div className="grid grid-cols-[minmax(160px,1.1fr)_1fr_1fr] border-b border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              <span>Signal</span>
              <span className="break-all text-zinc-400">{left.runId}</span>
              <span className="break-all text-zinc-400">{right.runId}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <tbody className="divide-y divide-zinc-800">
                  {differences.map((difference) => (
                    <tr key={difference.label} className={difference.changed ? "bg-zinc-900/40" : undefined}>
                      <th scope="row" className="px-4 py-3 align-top font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
                        {difference.label}
                        {difference.changed ? <span className="ml-2 text-amber-300">changed</span> : null}
                      </th>
                      <td className="break-words px-4 py-3 font-mono text-xs text-zinc-200">{difference.first}</td>
                      <td className="break-words px-4 py-3 font-mono text-xs text-zinc-200">{difference.second}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2">
            {[left, right].map((run) => (
              <div key={run.runId} className="flex items-center justify-between gap-3 bg-[#111418] p-4">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-zinc-200">{run.runId}</p>
                  <p className="mt-1 font-mono text-[10px] text-zinc-500">{run.spanCount} spans · ${run.totalCostUsd.toFixed(4)}</p>
                </div>
                <span className={cn("shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest", statusStyles[run.status] ?? statusStyles.cancelled)}>{run.status}</span>
                <Link href={`/dashboard/${projectId}/runs/${run.runId}`} className="shrink-0 inline-flex min-h-8 items-center gap-1.5 border border-zinc-700 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white">
                  <ExternalLink className="size-3" aria-hidden="true" /> Trace
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="border border-dashed border-zinc-700 bg-[#111418] p-6 text-sm text-zinc-400">Select two runs to build an evidence comparison.</div>
      )}

      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        {loadingSpan ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="size-3" aria-hidden="true" />}
        {loadingSpan ? "Loading span timelines…" : "Confirm differences in the trace viewer before changing a prompt or release."}
      </p>
    </div>
  );
}

function SkeletonBar() {
  return <div className="mt-4 h-16 w-full border border-zinc-800 bg-zinc-900/60" aria-hidden="true" />;
}
