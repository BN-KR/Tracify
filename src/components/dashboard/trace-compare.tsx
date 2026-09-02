"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type Run = {
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

type Span = { spanType: string; modelId?: string; toolName?: string; errorType?: string; errorMessage?: string };
type SpanResponse = { spans?: Span[]; unavailable?: boolean };

export function TraceCompare({ projectId }: { projectId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const runs = useQuery(api.agentRuns.listByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip") as Run[] | undefined;
  const [leftId, setLeftId] = useState(searchParams.get("left") ?? "");
  const [rightId, setRightId] = useState(searchParams.get("right") ?? "");
  const [leftSpans, setLeftSpans] = useState<Span[]>([]);
  const [rightSpans, setRightSpans] = useState<Span[]>([]);
  const [loadingSpans, setLoadingSpans] = useState(false);
  const [spanError, setSpanError] = useState("");

  const left = runs?.find((run) => run.runId === leftId);
  const right = runs?.find((run) => run.runId === rightId);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!runs?.length) return;
    if (!leftId) setLeftId(runs.find((run) => run.status === "failed")?.runId ?? runs[0].runId);
    if (!rightId) setRightId(runs.find((run) => run.status === "completed" && run.runId !== leftId)?.runId ?? runs[1]?.runId ?? "");
  }, [leftId, rightId, runs]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (leftId) params.set("left", leftId); else params.delete("left");
    if (rightId) params.set("right", rightId); else params.delete("right");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [leftId, pathname, rightId, router, searchParams]);

  useEffect(() => {
    if (!leftId || !rightId) return;
    let cancelled = false;
    setLoadingSpans(true);
    setSpanError("");
    Promise.all([
      fetch(`/api/projects/${projectId}/runs/${encodeURIComponent(leftId)}/spans`).then((response) => response.json() as Promise<SpanResponse>),
      fetch(`/api/projects/${projectId}/runs/${encodeURIComponent(rightId)}/spans`).then((response) => response.json() as Promise<SpanResponse>),
    ])
      .then(([nextLeft, nextRight]) => {
        if (cancelled) return;
        setLeftSpans(nextLeft.spans ?? []);
        setRightSpans(nextRight.spans ?? []);
        if (nextLeft.unavailable || nextRight.unavailable) setSpanError("One or both span timelines are temporarily unavailable. Run metadata remains comparable.");
      })
      .catch(() => {
        if (!cancelled) setSpanError("Span comparison could not be loaded. Run metadata remains available.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSpans(false);
      });
    return () => { cancelled = true; };
  }, [leftId, projectId, rightId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const differences = useMemo(() => {
    if (!left || !right) return [];
    const duration = (run: Run) => run.finishedAt ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime() : null;
    const observed = (spans: Span[]) => Array.from(new Set(spans.map((span) => span.modelId || span.toolName || span.spanType).filter(Boolean))).slice(0, 6).join(", ") || "None recorded";
    const errors = (spans: Span[]) => spans.map((span) => span.errorType || span.errorMessage).filter(Boolean).slice(0, 3).join(", ") || "None recorded";
    return [
      ["Status", left.status, right.status],
      ["Duration", duration(left) === null ? "Running" : `${duration(left)} ms`, duration(right) === null ? "Running" : `${duration(right)} ms`],
      ["Cost", `$${left.totalCostUsd.toFixed(4)}`, `$${right.totalCostUsd.toFixed(4)}`],
      ["Spans", String(left.spanCount), String(right.spanCount)],
      ["Primary model", left.primaryModel || "Not recorded", right.primaryModel || "Not recorded"],
      ["Environment", left.environment || "Not recorded", right.environment || "Not recorded"],
      ["Release", left.release || "Not recorded", right.release || "Not recorded"],
      ["Tools / models observed", observed(leftSpans), observed(rightSpans)],
      ["Errors", errors(leftSpans), errors(rightSpans)],
    ].map(([label, first, second]) => ({ label, first, second, changed: first !== second }));
  }, [left, leftSpans, right, rightSpans]);

  if (!runs) return <div className="flex items-center gap-2 border border-black/15 bg-white p-6 font-mono text-sm text-black/55"><Loader2 className="size-4 animate-spin" /> Loading runs</div>;

  return <div className="space-y-6">
    <section className="border border-black/15 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/15 pb-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/50">Improve / evidence comparison</p><h1 className="mt-3 font-pixel text-5xl leading-[0.84] tracking-[-0.07em]">Trace Compare</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-black/60">Compare a failed or surprising run with a healthy baseline. Differences are evidence from the selected runs, not a generated diagnosis.</p></div><span className="border border-black/15 bg-[#f3f2ed] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-black/55">{runs.length} recent runs</span></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end"><RunSelect label="Run A · investigate" value={leftId} runs={runs} onChange={setLeftId} /><ArrowRight className="hidden size-5 text-black/40 lg:block" aria-hidden="true" /><RunSelect label="Run B · baseline" value={rightId} runs={runs} onChange={setRightId} /></div>
    </section>
    {spanError ? <div className="border border-[#92400E]/30 bg-[#fff7ed] p-4 text-sm leading-6 text-[#92400E]">{spanError}</div> : null}
    {left && right ? <section className="overflow-hidden border border-black/15 bg-white"><div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-black/15 bg-[#f3f2ed] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-black/55"><span>Signal</span><span className="break-all">{left.runId}</span><span className="break-all">{right.runId}</span></div>{differences.map((difference) => <div key={difference.label} className={`grid grid-cols-[1.1fr_1fr_1fr] border-b border-black/10 px-4 py-4 text-sm last:border-b-0 ${difference.changed ? "bg-[#fffdf0]" : ""}`}><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-black/55">{difference.label}{difference.changed ? <span className="ml-2 text-[#92400E]">changed</span> : null}</span><span className="break-words pr-3 text-black/75">{difference.first}</span><span className="break-words text-black/75">{difference.second}</span></div>)}</section> : <div className="border border-black/15 bg-white p-6 text-sm text-black/55">Select two runs to build an evidence comparison.</div>}
    {loadingSpans ? <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-black/45"><Loader2 className="size-3 animate-spin" /> Loading span timelines</p> : null}
    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-black/45"><CheckCircle2 className="size-3" /> Confirm differences in the trace viewer before changing a prompt or release.</p>
  </div>;
}

function RunSelect({ label, value, runs, onChange }: { label: string; value: string; runs: Run[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-black/55">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full border border-black/20 bg-white px-3 font-mono text-xs text-black outline-none focus:border-black">{runs.map((run) => <option key={run.runId} value={run.runId}>{run.status.toUpperCase()} · {run.runId} · {run.primaryModel || "model unknown"}</option>)}</select></label>;
}
