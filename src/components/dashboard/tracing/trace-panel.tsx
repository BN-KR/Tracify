"use client";

import { useEffect, useMemo, useState } from "react";
import { buildSpanTree, type SpanTreeNode } from "@/lib/tracify-ports/treeBuilding";
import { chatMessages, compactNumber, formatCost, formatDuration, formatTime, parsePayload } from "./format";

type Span = {
  spanId: string; parentSpanId: string; spanType: string; createdAt: string; latencyMs: number; costUsd: number;
  modelId?: string; toolName?: string; traceName?: string; input?: string; output?: string; metadata?: string;
  inputTokens?: number; outputTokens?: number; ttftMs?: number; retryCount?: number; errorType?: string; errorMessage?: string;
  environment?: string; release?: string; promptVersionId?: string; endUserId?: string; sessionId?: string; tags?: string[];
  stackTrace?: string; timedOut?: boolean;
};
type Summary = { traceName: string; durationMs: number; totalCostUsd: number; inputTokens: number; outputTokens: number; endUserId: string; sessionId: string; tags: string[]; errorCount: number } | undefined;

const TYPE_STYLE: Record<string, string> = {
  llm: "bg-[#F4D44D] text-[#0B0D10]", generation: "bg-[#F4D44D] text-[#0B0D10]",
  tool: "bg-[#8AB4FF] text-[#0B0D10]", retrieval: "bg-[#7CF5C8] text-[#0B0D10]",
  error: "bg-[#FF6B6B] text-[#0B0D10]", agent: "bg-[#C9CED6] text-[#0B0D10]",
};

function spanName(span: Span) {
  return span.toolName || span.modelId || span.traceName || span.spanType || "span";
}

export function TracePanel({ projectId, runId, summary, onClose, onFilter, onStep }: {
  projectId: string; runId: string; summary: Summary;
  onClose: () => void; onFilter: (key: string, value: string) => void; onStep: (delta: number) => void;
}) {
  const [spans, setSpans] = useState<Span[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    fetch(`/api/projects/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(runId)}/spans${attempt ? "?refresh=manual" : ""}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
        return body as { spans: Span[]; unavailable?: boolean };
      })
      .then((body) => {
        if (!live) return;
        if (body.unavailable && !body.spans.length) throw new Error("Step data is temporarily unavailable.");
        setSpans(body.spans);
        setSelectedId((current) => current ?? body.spans[0]?.spanId ?? null);
      })
      .catch((reason: unknown) => live && setError(reason instanceof Error ? reason.message : "Could not load this trace"));
    return () => { live = false; };
  }, [projectId, runId, attempt]);

  const bySpanId = useMemo(() => new Map((spans ?? []).map((span) => [span.spanId, span])), [spans]);
  const tree = useMemo(() => buildSpanTree((spans ?? []).map((span) => ({
    spanId: span.spanId, parentSpanId: span.parentSpanId && bySpanId.has(span.parentSpanId) ? span.parentSpanId : "",
    spanType: span.spanType, name: spanName(span), createdAt: toIso(span.createdAt), latencyMs: Number(span.latencyMs ?? 0),
    costUsd: Number(span.costUsd ?? 0), modelId: span.modelId, toolName: span.toolName,
  }))), [spans, bySpanId]);

  const rows = useMemo(() => {
    const out: SpanTreeNode[] = [];
    const stack = [...tree.roots].reverse();
    while (stack.length) {
      const node = stack.pop()!;
      out.push(node);
      if (!collapsed.has(node.id)) for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]!);
    }
    return out;
  }, [tree, collapsed]);

  const totalMs = Math.max(1, ...tree.roots.map((root) => root.subtreeWallClockDurationMs));
  const selected = selectedId ? bySpanId.get(selectedId) : undefined;
  const name = summary?.traceName || spans?.find((span) => span.traceName)?.traceName || "Trace";
  const tokens = summary ? Number(summary.inputTokens) + Number(summary.outputTokens) : (spans ?? []).reduce((sum, span) => sum + Number(span.inputTokens ?? 0) + Number(span.outputTokens ?? 0), 0);
  const cost = summary?.totalCostUsd ?? (spans ?? []).reduce((sum, span) => sum + Number(span.costUsd ?? 0), 0);
  const firstWithUser = spans?.find((span) => span.endUserId);
  const firstWithSession = spans?.find((span) => span.sessionId);
  const user = summary?.endUserId || firstWithUser?.endUserId || "";
  const session = summary?.sessionId || firstWithSession?.sessionId || "";

  function toggle(id: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <aside aria-label="Trace detail" className="flex w-full min-w-0 flex-col border-l border-[#1F242C] bg-[#0E1115] lg:w-[min(760px,55vw)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-4 py-3">
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold">{name}</h2>
        <button type="button" aria-label="Previous trace" onClick={() => onStep(-1)} className="h-8 w-8 rounded-md border border-[#262C35] hover:border-[#4A5260]">↑</button>
        <button type="button" aria-label="Next trace" onClick={() => onStep(1)} className="h-8 w-8 rounded-md border border-[#262C35] hover:border-[#4A5260]">↓</button>
        <button type="button" aria-label="Close trace" onClick={onClose} className="h-8 w-8 rounded-md border border-[#262C35] hover:border-[#4A5260]">✕</button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#1F242C] px-4 py-3 font-mono text-xs text-[#C9CED6]">
        <button type="button" className="text-[#8B93A1] hover:text-white" onClick={() => { void navigator.clipboard?.writeText(runId); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>
          {copied ? "copied ✓" : `${runId.slice(0, 16)}… copy`}
        </button>
        <span>{formatDuration(summary?.durationMs ?? totalMs)}</span>
        <span>{formatCost(cost)}</span>
        <span>{compactNumber(tokens)} tokens</span>
        {user ? <button type="button" className="text-[#8AB4FF] hover:underline" onClick={() => onFilter("endUserId", user)}>user: {user}</button> : null}
        {session ? <button type="button" className="text-[#8AB4FF] hover:underline" onClick={() => onFilter("sessionId", session)}>session: {session}</button> : null}
        {(summary?.tags ?? []).map((tag) => <button key={tag} type="button" className="rounded bg-[#1A1F27] px-1.5 py-0.5 hover:bg-[#232A34]" onClick={() => onFilter("tag", tag)}>{tag}</button>)}
      </div>

      {error ? (
        <div role="alert" className="m-4 rounded-lg border border-[#5A2A2A] bg-[#1E1314] p-4 text-sm">
          <p className="text-[#FF8A8A]">{error}</p>
          <button type="button" className="mt-3 rounded-md border border-[#5A2A2A] px-3 py-1.5 text-xs" onClick={() => { setError(null); setSpans(null); setAttempt((value) => value + 1); }}>Try again</button>
        </div>
      ) : spans === null ? (
        <p className="p-4 text-sm text-[#8B93A1]">Loading steps…</p>
      ) : spans.length === 0 ? (
        <p className="p-4 text-sm text-[#8B93A1]">This trace has no recorded steps yet.</p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-wrap">
          <ol aria-label="Steps" className="max-h-[70vh] w-full overflow-auto border-b border-[#1F242C] py-2 md:max-h-none md:w-[44%] md:border-b-0 md:border-r">
            {rows.map((node) => {
              const span = bySpanId.get(node.id)!;
              const failed = span.spanType === "error" || Boolean(span.errorType);
              const type = (span.spanType || "span").toLowerCase();
              return (
                <li key={node.id}>
                  <div className={`flex items-center gap-1 pr-2 ${selectedId === node.id ? "bg-[#161B22] shadow-[inset_3px_0_0_#F4D44D]" : "hover:bg-[#12161C]"}`} style={{ paddingLeft: 8 + node.depth * 16 }}>
                    {node.children.length ? (
                      <button type="button" aria-label={collapsed.has(node.id) ? "Expand" : "Collapse"} aria-expanded={!collapsed.has(node.id)} onClick={() => toggle(node.id)} className="h-7 w-5 text-[#8B93A1] hover:text-white">{collapsed.has(node.id) ? "▸" : "▾"}</button>
                    ) : <span className="w-5" />}
                    <button type="button" onClick={() => setSelectedId(node.id)} className="flex min-w-0 flex-1 flex-col py-1.5 text-left">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${failed ? TYPE_STYLE.error : TYPE_STYLE[type] ?? "bg-[#2A303A] text-[#E6E9EE]"}`}>{type}</span>
                        <span className={`truncate text-sm ${failed ? "text-[#FF8A8A]" : ""}`}>{node.name}</span>
                      </span>
                      <span className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[#8B93A1]">
                        {formatDuration(span.latencyMs)}{Number(span.costUsd) ? ` · ${formatCost(Number(span.costUsd))}` : ""}{Number(span.inputTokens) + Number(span.outputTokens) ? ` · ${compactNumber(Number(span.inputTokens) + Number(span.outputTokens))} tok` : ""}
                      </span>
                      <span className="mt-1 h-1 rounded bg-[#1A1F27]" aria-hidden="true">
                        <span className={`block h-1 rounded ${failed ? "bg-[#FF6B6B]" : "bg-[#F4D44D]"}`} style={{ marginLeft: `${(node.startTimeSinceRootMs / totalMs) * 100}%`, width: `${Math.max(1.5, (Number(span.latencyMs) / totalMs) * 100)}%` }} />
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="min-w-0 flex-1 overflow-auto p-4">{selected ? <StepDetail span={selected} /> : null}</div>
        </div>
      )}
    </aside>
  );
}

function toIso(value: string) {
  return value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
}

function StepDetail({ span }: { span: Span }) {
  const [raw, setRaw] = useState(false);
  const failed = span.spanType === "error" || Boolean(span.errorType);
  const attributes: Array<[string, string]> = [
    ["Type", span.spanType], ["Started", formatTime(span.createdAt)], ["Latency", formatDuration(span.latencyMs)],
    ["Time to first token", span.ttftMs ? formatDuration(span.ttftMs) : ""], ["Model", span.modelId ?? ""], ["Tool", span.toolName ?? ""],
    ["Input tokens", span.inputTokens ? String(span.inputTokens) : ""], ["Output tokens", span.outputTokens ? String(span.outputTokens) : ""],
    ["Cost", Number(span.costUsd) ? formatCost(Number(span.costUsd)) : ""], ["Retries", span.retryCount ? String(span.retryCount) : ""],
    ["Prompt version", span.promptVersionId ?? ""], ["Environment", span.environment ?? ""], ["Release", span.release ?? ""], ["Span id", span.spanId],
  ].filter(([, value]) => value) as Array<[string, string]>;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="truncate text-sm font-semibold">{spanName(span)}</h3>
        <div role="group" aria-label="Display" className="flex rounded-md border border-[#262C35] p-0.5 text-xs">
          <button type="button" aria-pressed={!raw} onClick={() => setRaw(false)} className={`rounded px-2 py-1 ${!raw ? "bg-[#232A34] text-white" : "text-[#8B93A1]"}`}>Formatted</button>
          <button type="button" aria-pressed={raw} onClick={() => setRaw(true)} className={`rounded px-2 py-1 ${raw ? "bg-[#232A34] text-white" : "text-[#8B93A1]"}`}>Raw</button>
        </div>
      </div>
      {failed ? (
        <div role="alert" className="rounded-lg border border-[#5A2A2A] bg-[#1E1314] p-3 text-sm">
          <p className="font-medium text-[#FF8A8A]">{span.errorType || "Error"}{span.timedOut ? " · timed out" : ""}</p>
          {span.errorMessage ? <p className="mt-1 text-[#E6C3C3]">{span.errorMessage}</p> : null}
          {span.stackTrace ? <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-[#C9A0A0]">{span.stackTrace}</pre> : null}
        </div>
      ) : null}
      <Payload title="Input" raw={raw} value={span.input} />
      <Payload title="Output" raw={raw} value={span.output} />
      <section>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8B93A1]">Attributes</h4>
        <dl className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
          {attributes.map(([key, value]) => <div key={key} className="contents"><dt className="text-[#8B93A1]">{key}</dt><dd className="truncate font-mono text-xs leading-5">{value}</dd></div>)}
        </dl>
      </section>
      {span.metadata && span.metadata !== "{}" ? <Payload title="Metadata" raw={raw} value={span.metadata} /> : null}
    </div>
  );
}

function Payload({ title, value, raw }: { title: string; value?: string; raw: boolean }) {
  const parsed = parsePayload(value);
  const messages = raw ? null : chatMessages(parsed);
  const empty = parsed === "" || parsed === null || (typeof parsed === "object" && parsed !== null && !Object.keys(parsed).length);
  return (
    <section>
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8B93A1]">{title}</h4>
      {empty ? <p className="text-sm text-[#4A5260]">Nothing recorded</p> : messages ? (
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <div key={index} className={`rounded-lg border p-3 ${message.role === "assistant" ? "border-[#3A3420] bg-[#16140C]" : "border-[#1F242C] bg-[#111418]"}`}>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-[#8B93A1]">{message.role}</p>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-[#1F242C] bg-[#111418] p-3 font-mono text-xs leading-5 text-[#C9CED6]">
          {raw ? value : typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </section>
  );
}
