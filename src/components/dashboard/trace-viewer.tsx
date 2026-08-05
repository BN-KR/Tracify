"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect, useCallback } from "react";
import { SpanRow } from "@/lib/tinybird";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronDown, 
  Cpu, 
  Wrench, 
  Lightbulb, 
  AlertCircle, 
  Flag,
  Clock,
  DollarSign,
  Activity,
  MessageSquare,
  Send,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CancelRunButton } from "./cancel-run-button";
import { useNow } from "@/hooks/use-now";

interface TraceViewerProps {
  projectId: string;
  runId: string;
}

export function TraceViewer({ projectId, runId }: TraceViewerProps) {
  const now = useNow(1000);
  const run = useQuery(
    api.agentRuns.getByRunIdForViewer,
    projectId ? { runId, projectId: projectId as Id<"projects"> } : "skip"
  );

  const [spans, setSpans] = useState<SpanRow[] | null>(null);
  const [loadingSpans, setLoadingSpans] = useState(true);
  const [refreshingSpans, setRefreshingSpans] = useState(false);
  const [spansMessage, setSpansMessage] = useState("Cached spans");
  const [spansError, setSpansError] = useState<string | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  async function copyShareLink() {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1600);
  }

  const fetchSpans = useCallback(
    async (refresh: "normal" | "manual" = "normal") => {
      if (refresh === "manual") setRefreshingSpans(true);
      setSpansError(null);
      try {
        const params = new URLSearchParams();
        if (refresh === "manual") params.set("refresh", "manual");
        const query = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(
          `/api/projects/${projectId}/runs/${runId}/spans${query}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Failed to fetch spans");
        const data = await res.json();
        setSpans(data.spans);
        setSpansMessage(formatSpanCacheMessage(data.meta));
      } catch (err) {
        console.error(err);
        setSpansError("Span refresh failed. Showing the latest available trace data.");
      } finally {
        setLoadingSpans(false);
        if (refresh === "manual") setRefreshingSpans(false);
      }
    },
    [projectId, runId],
  );

  useEffect(() => {
    // Fetching remote trace data is the synchronization this effect is responsible for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSpans();
  }, [fetchSpans]);

  useEffect(() => {
    if (run?.status !== "running") return;
    const interval = window.setInterval(() => void fetchSpans(), 3000);
    return () => window.clearInterval(interval);
  }, [run?.status, fetchSpans]);

  if (run === undefined || (loadingSpans && !spans)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-none" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Run not found</p>
      </div>
    );
  }

  const durationMs = run.finishedAt
    ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
    : now - new Date(run.startedAt).getTime();
  const safeSpans = spans ?? [];
  const spanSummary = buildSpanSummary(safeSpans);
  const activeReplayIndex = Math.min(replayIndex, Math.max(0, safeSpans.length - 1));
  const replaySpan = safeSpans[activeReplayIndex];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-8">
      {/* Run Header Stats */}
      <div className="border border-border bg-muted/10 p-5">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Run control
            </div>
            <div className="mt-1 font-mono text-sm text-white">
              {run.status === "running"
                ? "This only marks the observed run as cancelled."
                : "Run is no longer active."}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => void copyShareLink()}
              className="flex h-8 items-center gap-2 border border-[#2A2A2A] bg-black px-3 font-mono text-[11px] uppercase text-[#999999] hover:border-white hover:text-white"
            >
              {shareCopied ? <Check className="size-3" /> : <Share2 className="size-3" />}
              {shareCopied ? "Link copied" : "Share trace"}
            </button>
            {run.status === "running" && (
              <button
                type="button"
                onClick={() => void fetchSpans("manual")}
                disabled={refreshingSpans}
                className="h-8 border border-[#2A2A2A] bg-black px-3 font-mono text-[11px] uppercase text-[#999999] hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refreshingSpans ? "Refreshing" : "Refresh spans"}
              </button>
            )}
            {run.status === "running" && (
              <CancelRunButton projectId={projectId} runId={run.runId} />
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatItem label="Status" value={<span className="capitalize">{run.status}</span>} />
          <StatItem label="Total Cost" value={formatCurrency(run.totalCostUsd)} />
          <StatItem label="Span Count" value={run.spanCount.toString()} />
          <StatItem label="Duration" value={formatDuration(durationMs)} />
        </div>
        <div className="mt-4 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          {run.status === "running" ? "Live trace · polling every 3s · " : ""}{spansMessage}
        </div>
        {spansError ? (
          <div className="mt-3 border border-red-900/40 bg-red-950/10 p-3 font-mono text-[11px] text-red-300">
            {spansError}
          </div>
        ) : null}
      </div>

      <SpanOverview spans={safeSpans} />
      <TraceQualityPanel projectId={projectId} runId={runId} />
      <LatencyWaterfall spans={safeSpans} />

      <div className="border border-border bg-muted/10 p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Session replay</div>
            <div className="mt-1 font-mono text-[11px] text-zinc-400">Scrub the trace one span at a time like a debugger.</div>
          </div>
          <div className="font-mono text-[10px] uppercase text-zinc-600">{safeSpans.length ? `${activeReplayIndex + 1}/${safeSpans.length}` : "0/0"}</div>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, safeSpans.length - 1)}
          value={activeReplayIndex}
          onChange={(event) => setReplayIndex(Number(event.target.value))}
          disabled={!safeSpans.length}
          className="w-full accent-white"
        />
        {replaySpan ? (
          <div className="border border-white/20 bg-black/30 p-3 font-mono text-[11px] text-zinc-300">
            <span className="text-white">{replaySpan.spanType}</span> · {replaySpan.modelId || replaySpan.toolName || "span"} · {formatDuration(replaySpan.latencyMs)}
          </div>
        ) : null}
      </div>

      <SpanGraph spans={safeSpans} />

      {/* Timeline */}
      <div className="relative pl-8 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
        {safeSpans.length === 0 && run.status !== "running" ? (
          <div className="border border-dashed border-border p-8 text-center">
            <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              No spans found for this run
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              The run summary exists, but no span timeline is available yet.
            </p>
          </div>
        ) : null}

        {safeSpans.map((span, index) => (
          <SpanCard key={span.spanId} span={span} index={index} projectId={projectId} replayActive={index === activeReplayIndex} />
        ))}
        
        {run.status === "running" && (
          <div className="relative flex items-center gap-4 text-zinc-500">
            <div className="absolute -left-[23px] size-4 rounded-full border border-border bg-black flex items-center justify-center">
              <div className="size-1.5 bg-white animate-pulse" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest animate-pulse">
              Agent is thinking...
            </span>
          </div>
        )}
      </div>
      </div>

      <TraceSummaryPanel summary={spanSummary} durationMs={durationMs} />
    </div>
  );
}

function TraceQualityPanel({ projectId, runId }: { projectId: string; runId: string }) {
  const quality = useQuery(api.evaluationEngine.traceQuality, { projectId: projectId as Id<"projects">, traceId: runId });
  const recordFeedback = useMutation(api.evaluationEngine.recordFeedback);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState("");
  const scoreCount = (quality?.scores.length ?? 0) + (quality?.results.length ?? 0);
  async function submitFeedback(value: boolean) {
    await recordFeedback({ projectId: projectId as Id<"projects">, traceId: runId, kind: "thumb", value, comment: feedbackNote.trim() || undefined });
    setFeedbackSent(true);
    setFeedbackNote("");
  }
  return <section className="border border-white/20 bg-white/[0.03] p-4">
    <div className="flex items-center justify-between gap-3"><div><div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Quality</div><div className="mt-1 text-sm text-white">Evaluation evidence attached to this trace</div></div><span className="font-mono text-[10px] uppercase text-zinc-600">{scoreCount} signals</span></div>
    {scoreCount ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{quality?.scores.slice(0, 8).map((score) => <div key={score._id} className="border border-zinc-800 bg-black/40 p-3"><div className="flex justify-between text-xs text-white"><span>{score.name}</span><span className="font-mono text-zinc-300">{String(score.value)}</span></div><p className="mt-1 font-mono text-[9px] uppercase text-zinc-600">{score.source} · {score.dataType}</p></div>)}{quality?.results.slice(0, 8).map((result) => <div key={result._id} className="border border-zinc-800 bg-black/40 p-3"><div className="flex justify-between text-xs text-white"><span>Evaluator result</span><span className={result.status === "passed" ? "font-mono text-emerald-300" : "font-mono text-red-300"}>{result.status}</span></div><p className="mt-1 truncate text-xs text-zinc-500">{result.explanation || String(result.value)}</p></div>)}</div> : <p className="mt-4 text-xs text-zinc-600">No evaluator results yet. Use Evaluation Engine to enable a live evaluator or queue this trace for review.</p>}
    <div className="mt-4 border-t border-zinc-800 pt-4"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Human feedback</p><div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => void submitFeedback(true)}>Helpful</Button><Button size="sm" variant="outline" onClick={() => void submitFeedback(false)}>Needs review</Button>{feedbackSent ? <span className="self-center font-mono text-[10px] uppercase text-emerald-400">Feedback recorded</span> : null}</div><Input className="mt-2" value={feedbackNote} onChange={(event) => setFeedbackNote(event.target.value)} placeholder="Optional reviewer note" /></div>
    {quality?.feedback.length ? <p className="mt-3 font-mono text-[10px] uppercase text-zinc-500">{quality.feedback.length} user feedback item{quality.feedback.length === 1 ? "" : "s"} linked</p> : null}
  </section>;
}

function formatSpanCacheMessage(meta?: {
  cacheStatus?: string;
  reason?: string | null;
  updatedAt?: number | null;
}) {
  if (!meta) return "Cached spans";
  if (meta.reason === "rate_limited") return "Span refresh cooling down";
  if (meta.reason === "running_manual_only") return "Cached spans; refresh manually while running";
  if (meta.reason === "budget_low" || meta.reason === "budget_hard_limit") {
    return "Analytics refresh limit reached; showing cached spans";
  }
  if (meta.reason === "tinybird_error") {
    return meta.updatedAt
      ? `Spans updated ${formatAge(Date.now() - meta.updatedAt)} ago`
      : "Cached spans";
  }
  if (meta.updatedAt) return `Spans updated ${formatAge(Date.now() - meta.updatedAt)} ago`;
  return "Cached spans";
}

function formatAge(ageMs: number) {
  const seconds = Math.max(0, Math.floor(ageMs / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function StatItem({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{label}</div>
      <div className="text-sm font-mono text-white">{value}</div>
    </div>
  );
}

function SpanOverview({ spans }: { spans: SpanRow[] }) {
  const totalLatency = spans.reduce((sum, span) => sum + Math.max(0, span.latencyMs), 0);

  return (
    <div className="border border-border bg-muted/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Span latency overview
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          {spans.length} spans
        </div>
      </div>
      {spans.length === 0 ? (
        <div className="h-12 border border-dashed border-border bg-black/30" />
      ) : (
        <div className="flex h-12 overflow-hidden border border-border bg-black">
          {spans.map((span) => {
            const config = getSpanTypeConfig(span.spanType);
            const width =
              totalLatency > 0
                ? Math.max(3, (Math.max(0, span.latencyMs) / totalLatency) * 100)
                : 100 / spans.length;

            return (
              <div
                key={span.spanId}
                className={cn("h-full border-r border-black/60 last:border-r-0", config.segment)}
                style={{ width: `${width}%` }}
                title={`${span.spanType} - ${formatDuration(span.latencyMs)}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function LatencyWaterfall({ spans }: { spans: SpanRow[] }) {
  if (!spans.length) return null;
  const start = Math.min(...spans.map((span) => Date.parse(span.createdAt)).filter(Number.isFinite));
  const end = Math.max(...spans.map((span) => Date.parse(span.createdAt) + Math.max(0, span.latencyMs)).filter(Number.isFinite));
  const total = Math.max(1, end - start);
  return (
    <div className="border border-border bg-muted/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Latency waterfall</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">wall-clock span overlap</div>
      </div>
      <div className="space-y-1.5">
        {spans.map((span) => {
          const created = Date.parse(span.createdAt);
          const left = Number.isFinite(created) ? ((created - start) / total) * 100 : 0;
          const width = Math.max(1.5, (Math.max(0, span.latencyMs) / total) * 100);
          return (
            <div key={span.spanId} className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2">
              <span className="truncate font-mono text-[9px] text-zinc-500">{span.modelId || span.toolName || span.spanType}</span>
              <div className="relative h-3 bg-black/50">
                <div className={cn("absolute h-full", getSpanTypeConfig(span.spanType).segment)} style={{ left: `${left}%`, width: `${width}%` }} title={`${formatDuration(span.latencyMs)} from ${span.createdAt}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TraceSummaryPanel({
  summary,
  durationMs,
}: {
  summary: ReturnType<typeof buildSpanSummary>;
  durationMs: number;
}) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
      <div className="border border-border bg-muted/10 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Trace summary
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniMetric label="Cost" value={formatCurrency(summary.totalCost)} />
          <MiniMetric label="Latency" value={formatDuration(durationMs)} />
          <MiniMetric label="LLM" value={summary.typeCounts.llm_call?.toString() ?? "0"} />
          <MiniMetric label="Tools" value={summary.typeCounts.tool_call?.toString() ?? "0"} />
          <MiniMetric label="Tokens" value={summary.totalTokens.toLocaleString()} />
          <MiniMetric label="TTFT" value={summary.ttftMs ? formatDuration(summary.ttftMs) : "—"} />
        </div>
      </div>

      <SummaryList title="Models" rows={summary.models} empty="No model spans" />
      <SummaryList title="Tools" rows={summary.tools} empty="No tool spans" />
    </aside>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-black/30 p-3">
      <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-xs text-white">{value}</div>
    </div>
  );
}

function SummaryList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<{ label: string; count: number; cost: number; latencyMs: number }>;
  empty: string;
}) {
  const maxCost = Math.max(...rows.map((row) => row.cost), 0);

  return (
    <div className="border border-border bg-muted/10 p-4">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="border border-dashed border-border p-4 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          {empty}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-mono text-[11px] text-white">
                  {row.label}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                  {row.count}x
                </span>
              </div>
              <div className="h-1 bg-zinc-900">
                <div
                  className="h-full bg-white"
                  style={{
                    width: `${maxCost > 0 ? Math.max(4, (row.cost / maxCost) * 100) : 4}%`,
                  }}
                />
              </div>
              <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                <span>{formatCurrency(row.cost)}</span>
                <span>{formatDuration(row.latencyMs)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpanCard({ span, index, projectId, replayActive }: { span: SpanRow, index: number, projectId: string, replayActive?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(index === 0 || span.spanType === "error");
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState<"input" | "output" | null>(null);

  const comments = useQuery(api.comments.listBySpan, {
    spanId: span.spanId,
    projectId: projectId as Id<"projects">,
  });
  const createComment = useMutation(api.comments.create);

  async function handleAddComment() {
    if (!commentContent.trim()) return;
    setIsCommenting(true);
    try {
      await createComment({
        spanId: span.spanId,
        projectId: projectId as Id<"projects">,
        runId: span.runId,
        content: commentContent,
      });
      setCommentContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  }

  async function handleCopyPayload(kind: "input" | "output") {
    const payload = kind === "input" ? formatJson(span.input) : formatJson(span.output);
    await navigator.clipboard.writeText(payload);
    setCopiedPayload(kind);
    window.setTimeout(() => setCopiedPayload(null), 1200);
  }

  const typeConfig = getSpanTypeConfig(span.spanType);

  const Icon = typeConfig.icon;

  return (
    <div className="relative">
      {/* Timeline Node */}
      <div className={cn(
        "absolute -left-[23px] top-4 size-4 rounded-full border bg-black flex items-center justify-center z-10",
        typeConfig.border
      )}>
        <Icon className={cn("size-2.5", typeConfig.color)} />
      </div>

      {/* Card */}
      <div className={cn(
        "border transition-all duration-200",
        replayActive ? "border-white bg-white/5 shadow-lg" : isExpanded ? "border-zinc-700 bg-muted/20 shadow-lg" : "border-border bg-transparent hover:border-zinc-700 hover:bg-muted/5"
      )}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-4 min-w-0">
            <Badge variant="outline" className={cn("rounded-none border-0 px-0 font-mono", typeConfig.color)}>
              {span.spanType.replace("_", " ")}
            </Badge>
            <div className="truncate font-mono text-xs text-white max-w-[200px] md:max-w-md">
              {span.modelId || span.toolName || "Processing..."}
            </div>
            {span.retryCount > 0 ? <Badge variant="outline" className="rounded-none border-amber-400/40 px-1.5 font-mono text-[9px] text-amber-300">retry ×{span.retryCount}</Badge> : null}
            {span.errorType || span.errorMessage || span.stackTrace ? <Badge variant="outline" className="rounded-none border-red-400/40 px-1.5 font-mono text-[9px] text-red-300">error</Badge> : null}
            {span.timedOut ? <Badge variant="outline" className="rounded-none border-amber-400/40 px-1.5 font-mono text-[9px] text-amber-300">timeout</Badge> : null}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
              <span className="flex items-center gap-1"><Clock className="size-3" /> {formatDuration(span.latencyMs)}</span>
              <span className="flex items-center gap-1"><DollarSign className="size-3" /> {formatCurrency(span.costUsd)}</span>
            </div>
            {isExpanded ? <ChevronDown className="size-4 text-zinc-500" /> : <ChevronRight className="size-4 text-zinc-500" />}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4 border-t border-border/50">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <PayloadHeader
                      label="Input"
                      copied={copiedPayload === "input"}
                      onCopy={() => void handleCopyPayload("input")}
                    />
                    <pre className="p-3 bg-black/40 border border-border/30 text-[11px] font-mono overflow-auto max-h-[300px] text-zinc-300">
                      {formatJson(span.input)}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <PayloadHeader
                      label="Output"
                      copied={copiedPayload === "output"}
                      onCopy={() => void handleCopyPayload("output")}
                    />
                    <pre className="p-3 bg-black/40 border border-border/30 text-[11px] font-mono overflow-auto max-h-[300px] text-zinc-300">
                      {formatJson(span.output)}
                    </pre>
                  </div>
                </div>
                {(span.errorType || span.errorMessage || span.stackTrace || span.timedOut || span.isStreamChunk || span.payloadFormat !== "json") ? (
                  <div className="flex flex-wrap gap-2 border-t border-border/30 pt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {span.errorType ? <span className="border border-red-400/30 px-2 py-1 text-red-300">{span.errorType}</span> : null}
                    {span.errorMessage ? <span className="max-w-full truncate border border-red-400/30 px-2 py-1 text-red-300">{span.errorMessage}</span> : null}
                    {span.timedOut ? <span className="border border-amber-400/30 px-2 py-1 text-amber-300">timeout {span.timeoutMs ? `${span.timeoutMs}ms` : ""}</span> : null}
                    {span.isStreamChunk ? <span className="border border-indigo-400/30 px-2 py-1 text-indigo-300">stream chunk #{span.streamSequence}</span> : null}
                    {span.payloadFormat !== "json" ? <span className="border border-zinc-700 px-2 py-1">{span.payloadFormat}</span> : null}
                  </div>
                ) : null}
                {span.stackTrace ? <pre className="max-h-48 overflow-auto border border-red-400/20 bg-black/40 p-3 font-mono text-[10px] text-red-200">{span.stackTrace}</pre> : null}
                {span.attachments && span.attachments !== "[]" ? <pre className="max-h-40 overflow-auto border border-indigo-400/20 bg-black/40 p-3 font-mono text-[10px] text-indigo-200">attachments · {formatJson(span.attachments)}</pre> : null}

                {/* Comments Section */}
                <div className="pt-4 border-t border-border/30 space-y-4">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    <MessageSquare className="size-3" />
                    Human-in-the-loop Comments
                  </div>
                  
                  {comments && comments.length > 0 && (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment._id} className="bg-black/20 p-3 border border-border/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">{comment.userName}</span>
                            <span className="text-[9px] font-mono text-zinc-600">{formatRelativeTime(comment.createdAt.toString())}</span>
                          </div>
                          <p className="text-[11px] font-mono text-zinc-300">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input 
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Add an annotation or correction..."
                      className="rounded-none border-zinc-800 bg-black/40 text-[11px] font-mono h-9"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleAddComment}
                      disabled={isCommenting || !commentContent.trim()}
                      className="size-9 rounded-none bg-zinc-800 hover:bg-white hover:text-black shrink-0"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SpanGraph({ spans }: { spans: SpanRow[] }) {
  const byId = new Map(spans.map((span) => [span.spanId, span]));
  const edges = spans.filter((span) => span.parentSpanId && byId.has(span.parentSpanId));
  const roots = spans.filter((span) => !span.parentSpanId || !byId.has(span.parentSpanId));
  return (
    <div className="border border-border bg-muted/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Agent handoff graph</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">{spans.length} nodes · {Math.max(0, spans.length - roots.length)} edges</div>
      </div>
      {spans.length === 0 ? <div className="border border-dashed border-border p-4 text-center font-mono text-[10px] uppercase text-zinc-600">No handoffs captured</div> : (
        <div className="space-y-2">
          {edges.map((span) => {
            const parent = byId.get(span.parentSpanId);
            return (
              <div key={span.spanId} className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                <span className="border border-zinc-700 px-2 py-1 text-zinc-400">{parent?.modelId || parent?.toolName || parent?.spanType}</span>
                <span className="text-indigo-300">→ handoff →</span>
                <span className="border border-indigo-400/40 px-2 py-1 text-indigo-300">{span.modelId || span.toolName || span.spanType}</span>
              </div>
            );
          })}
          {roots.map((span) => <span key={span.spanId} className="mr-2 inline-block border border-zinc-700 px-2 py-1 font-mono text-[10px] text-zinc-300">root · {span.modelId || span.toolName || span.spanType}</span>)}
        </div>
      )}
    </div>
  );
}

function PayloadHeader({
  label,
  copied,
  onCopy,
}: {
  label: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        {label}
      </label>
      <button
        type="button"
        onClick={onCopy}
        className="flex h-6 items-center gap-1 border border-zinc-800 px-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500 transition-colors hover:border-white hover:text-white"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function formatJson(str: string) {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
}

function getSpanTypeConfig(spanType: string) {
  return {
    llm_call: {
      icon: Cpu,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      border: "border-indigo-400/20",
      segment: "bg-indigo-400",
    },
    tool_call: {
      icon: Wrench,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
      segment: "bg-emerald-400",
    },
    decision: {
      icon: Lightbulb,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
      segment: "bg-amber-400",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/20",
      segment: "bg-red-400",
    },
    run_end: {
      icon: Flag,
      color: "text-zinc-400",
      bg: "bg-zinc-400/10",
      border: "border-zinc-400/20",
      segment: "bg-zinc-500",
    },
  }[spanType] || {
    icon: Activity,
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    border: "border-zinc-400/20",
    segment: "bg-zinc-500",
  };
}

function buildSpanSummary(spans: SpanRow[]) {
  const typeCounts: Record<string, number> = {};
  const models = new Map<string, { label: string; count: number; cost: number; latencyMs: number }>();
  const tools = new Map<string, { label: string; count: number; cost: number; latencyMs: number }>();
  let totalCost = 0;
  let totalTokens = 0;
  let ttftMs = 0;

  for (const span of spans) {
    totalCost += span.costUsd;
    totalTokens += Number(span.metadata?.totalTokens ?? Number(span.metadata?.inputTokens ?? 0) + Number(span.metadata?.outputTokens ?? 0)) || 0;
    const candidateTtft = Number(span.metadata?.ttftMs ?? span.metadata?.timeToFirstTokenMs ?? 0);
    if (candidateTtft > 0 && (ttftMs === 0 || candidateTtft < ttftMs)) ttftMs = candidateTtft;
    typeCounts[span.spanType] = (typeCounts[span.spanType] ?? 0) + 1;

    if (span.modelId) {
      const current = models.get(span.modelId) ?? {
        label: span.modelId,
        count: 0,
        cost: 0,
        latencyMs: 0,
      };
      current.count += 1;
      current.cost += span.costUsd;
      current.latencyMs += span.latencyMs;
      models.set(span.modelId, current);
    }

    if (span.toolName) {
      const current = tools.get(span.toolName) ?? {
        label: span.toolName,
        count: 0,
        cost: 0,
        latencyMs: 0,
      };
      current.count += 1;
      current.cost += span.costUsd;
      current.latencyMs += span.latencyMs;
      tools.set(span.toolName, current);
    }
  }

  const sortRows = (
    rows: Map<string, { label: string; count: number; cost: number; latencyMs: number }>,
  ) => Array.from(rows.values()).sort((a, b) => b.cost - a.cost || b.count - a.count);

  return {
    totalCost,
    totalTokens,
    ttftMs,
    typeCounts,
    models: sortRows(models),
    tools: sortRows(tools),
  };
}
