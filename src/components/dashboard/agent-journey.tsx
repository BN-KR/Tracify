"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, CircleAlert, Clock3, DollarSign, ExternalLink, Loader2, Route, Sparkles } from "lucide-react";
import type { SpanRow } from "@/lib/tinybird";

type JourneyStage = "decision" | "browser" | "tool" | "failure" | "evaluation" | "execution";

const stageStyles: Record<JourneyStage, { label: string; className: string }> = {
  decision: { label: "LLM decision", className: "border-violet-500/40 bg-violet-50" },
  browser: { label: "Browser / network", className: "border-[#b58b00]/45 bg-[#fff8d7]" },
  tool: { label: "Tool / API", className: "border-sky-700/25 bg-sky-50" },
  failure: { label: "Failure / assertion", className: "border-red-700/30 bg-red-50" },
  evaluation: { label: "Evaluation", className: "border-emerald-700/30 bg-emerald-50" },
  execution: { label: "Execution", className: "border-black/15 bg-white" },
};

function stageFor(span: SpanRow): JourneyStage {
  const haystack = `${span.spanType} ${span.modelId} ${span.toolName} ${span.errorType}`.toLowerCase();
  if (span.errorType || span.errorMessage || span.timedOut || haystack.includes("assert")) return "failure";
  if (haystack.includes("evaluation") || haystack.includes("score") || haystack.includes("judge")) return "evaluation";
  if (haystack.includes("browser") || haystack.includes("network") || haystack.includes("screenshot")) return "browser";
  if (span.toolName || haystack.includes("tool") || haystack.includes("api")) return "tool";
  if (span.modelId || haystack.includes("llm") || haystack.includes("generation") || haystack.includes("decision")) return "decision";
  return "execution";
}

function parseAttachments(value: string): Array<{ name?: string; url?: string; path?: string }> {
  try {
    const parsed = JSON.parse(value || "[]") as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is { name?: string; url?: string; path?: string } => typeof item === "object" && item !== null)
      : [];
  } catch {
    return [];
  }
}

function formatCost(value: number) {
  return `$${value.toFixed(4)}`;
}

export function AgentJourney({ projectId, runId }: { projectId: string; runId: string }) {
  const [spans, setSpans] = useState<SpanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/projects/${projectId}/runs/${encodeURIComponent(runId)}/spans`)
      .then((response) => response.json() as Promise<{ spans?: SpanRow[]; unavailable?: boolean }>)
      .then((body) => {
        if (cancelled) return;
        setSpans(body.spans ?? []);
        setUnavailable(Boolean(body.unavailable));
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [projectId, runId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const orderedSpans = useMemo(() => [...spans].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [spans]);
  const totals = useMemo(() => ({
    cost: spans.reduce((sum, span) => sum + (span.costUsd || 0), 0),
    latency: spans.reduce((sum, span) => sum + (span.latencyMs || 0), 0),
    failures: spans.filter((span) => stageFor(span) === "failure").length,
  }), [spans]);

  if (loading) return <div className="flex items-center gap-2 border border-black/15 bg-white p-6 font-mono text-sm text-black/55"><Loader2 className="size-4 animate-spin" /> Loading journey evidence</div>;

  return <div className="space-y-6">
    <section className="border border-black/15 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/15 pb-5">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/50">Observe / run journey</p><h1 className="mt-3 font-pixel text-5xl leading-[0.84] tracking-[-0.07em]">Agent Journey</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-black/60">Follow the execution record from model decision to browser action, tool call, failure, evaluation, and cost. This view joins evidence already present in the selected run.</p></div>
        <div className="flex flex-wrap gap-2"><Link href={`/dashboard/${projectId}/runs/${encodeURIComponent(runId)}`} className="inline-flex min-h-10 items-center gap-2 border border-black/15 px-4 font-mono text-[10px] uppercase tracking-[0.12em] hover:border-black">Full trace <ArrowUpRight className="size-3" /></Link><Link href={`/dashboard/${projectId}/investigate?run=${encodeURIComponent(runId)}`} className="inline-flex min-h-10 items-center gap-2 border border-black px-4 font-mono text-[10px] uppercase tracking-[0.12em] hover:bg-[#f4d44d]">Investigate <Route className="size-3" /></Link></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric icon={<DollarSign className="size-3" />} label="Observed cost" value={formatCost(totals.cost)} /><Metric icon={<Clock3 className="size-3" />} label="Span latency" value={`${totals.latency} ms`} /><Metric icon={<CircleAlert className="size-3" />} label="Failure signals" value={String(totals.failures)} /></div>
    </section>

    {unavailable ? <div className="border border-[#b58b00]/40 bg-[#fff8d7] p-4 text-sm leading-6 text-black/65">The span source is temporarily unavailable. The run link remains valid; refresh this page when analytics storage is reachable.</div> : null}
    {!orderedSpans.length && !unavailable ? <div className="border border-dashed border-black/20 bg-white p-8 text-center text-sm text-black/55">No spans are available for this run yet.</div> : null}
    <section className="space-y-3">
      {orderedSpans.map((span, index) => {
        const stage = stageFor(span);
        const style = stageStyles[stage];
        const attachments = parseAttachments(span.attachments);
        return <article key={span.spanId} className={`border p-4 ${style.className}`}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center border border-black/20 font-mono text-[10px]">{String(index + 1).padStart(2, "0")}</span><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/60">{style.label}</span><span className="font-mono text-[9px] uppercase text-black/45">{span.spanType}</span></div><h2 className="mt-2 text-base text-black">{span.toolName || span.modelId || span.traceName || span.spanType}</h2></div></div><div className="flex items-center gap-3 font-mono text-[10px] text-black/55"><span>{span.latencyMs} ms</span><span>{formatCost(span.costUsd || 0)}</span></div></div>
          <div className="mt-4 grid gap-3 border-t border-black/15 pt-3 md:grid-cols-[1fr_1fr]">{span.input ? <Evidence label="Input" value={span.input} /> : null}{span.output ? <Evidence label="Output" value={span.output} /> : null}</div>
          {span.errorMessage ? <div className="mt-3 flex gap-2 border border-red-700/25 bg-white/50 p-3 text-sm leading-6 text-red-900"><CircleAlert className="mt-1 size-3 shrink-0" />{span.errorMessage}</div> : null}
          {attachments.length ? <div className="mt-3 flex flex-wrap gap-2">{attachments.map((attachment, attachmentIndex) => attachment.url ? <a key={`${attachment.name}-${attachmentIndex}`} href={attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-black/20 bg-white px-3 py-2 font-mono text-[10px] uppercase hover:bg-[#f4d44d]">{attachment.name || "Artifact"}<ExternalLink className="size-3" /></a> : <span key={`${attachment.name}-${attachmentIndex}`} className="inline-flex items-center gap-2 border border-black/15 bg-white/60 px-3 py-2 font-mono text-[10px] uppercase text-black/55"><Sparkles className="size-3" />{attachment.name || attachment.path || "Artifact reference"}</span>)}</div> : null}
        </article>;
      })}
    </section>
  </div>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="border border-black/15 bg-[#f3f2ed] p-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-black/55">{icon}{label}</div><p className="mt-4 font-pixel text-3xl tracking-[-0.05em]">{value}</p></div>;
}

function Evidence({ label, value }: { label: string; value: string }) {
  return <div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/45">{label}</p><pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-5 text-black/65">{value}</pre></div>;
}
