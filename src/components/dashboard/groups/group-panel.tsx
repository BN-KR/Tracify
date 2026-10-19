"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GroupKind } from "@/lib/group-filters";
import type { GroupRow } from "@/lib/tinybird-groups";
import { readJson } from "@/lib/safe-json";
import { compactNumber, formatCost, formatDuration, formatTime, previewText, relativeTime } from "../tracing/format";

type Detail = { row: GroupRow | null; siblings: Array<{ id: string; runs: number; failedRuns: number; totalCostUsd: number; lastSeenAt: string }>; error?: string };
type Run = { runId: string; traceName: string; startedAt: string; durationMs: number; spanCount: number; errorCount: number; totalCostUsd: number; modelId: string; inputPreview: string; outputPreview: string };
type RunsResponse = { rows: Run[]; total: number; error?: string };

const RUN_LIMIT = 100;
const DAY = 86_400_000;
const button = "h-7 rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#C9CED6] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D] disabled:opacity-40";

/** Detail for one session or user: totals, every run in order, and the opposite kind (a user's sessions, a session's users). */
export function GroupPanel({ projectId, kind, id, listRow, clock, onClose, onPrevious, onNext, onOpen }: {
  projectId: string; kind: GroupKind; id: string; listRow: GroupRow | null; clock: number;
  onClose: () => void; onPrevious: () => void; onNext: () => void; onOpen: (kind: GroupKind, id: string) => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [runs, setRuns] = useState<RunsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState("");
  const requestId = useRef(0);
  const otherKind: GroupKind = kind === "session" ? "user" : "session";
  const field = kind === "session" ? "sessionId" : "endUserId";
  const encoded = encodeURIComponent(id);
  // Tracing filters hold comma-separated, individually encoded values, so a link encodes the id twice.
  const filterValue = encodeURIComponent(encoded);
  const tracingBase = `/dashboard/${encodeURIComponent(projectId)}/tracing`;

  const load = useCallback(async (quiet: boolean) => {
    const issued = ++requestId.current;
    const to = Date.now();
    const runParams = new URLSearchParams({ from: String(to - 90 * DAY), to: String(to), [field]: encoded, sort: "startedAt", dir: "asc", pageSize: String(RUN_LIMIT) });
    try {
      const [detailResponse, runsResponse] = await Promise.all([
        fetch(`/api/projects/${encodeURIComponent(projectId)}/groups/${kind}?id=${encoded}`, { cache: "no-store" }),
        fetch(`/api/projects/${encodeURIComponent(projectId)}/traces?${runParams}`, { cache: "no-store" }),
      ]);
      const detailBody = await readJson<Detail>(detailResponse);
      const runsBody = await readJson<RunsResponse>(runsResponse);
      if (!detailResponse.ok) throw new Error(detailBody.error ?? `Could not load this ${kind} (error ${detailResponse.status}). Try again in a moment.`);
      if (!runsResponse.ok) throw new Error(runsBody.error ?? `Could not load its runs (error ${runsResponse.status}). Try again in a moment.`);
      if (issued !== requestId.current) return true;
      setDetail(detailBody);
      setRuns(runsBody);
      setError(null);
      return true;
    } catch (reason) {
      if (issued === requestId.current && !quiet) setError(reason instanceof Error ? reason.message : "Could not load this " + kind);
      return false;
    }
  }, [encoded, field, kind, projectId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(false); }, [load]);
  // Stays current while open: poll every 5s, skip hidden tabs, back off to 60s on failures.
  useEffect(() => {
    let delay = 5000;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (!document.hidden) delay = (await load(true)) ? 5000 : Math.min(delay * 2, 60_000);
      if (!stopped) timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, delay);
    return () => { stopped = true; clearTimeout(timer); };
  }, [load]);

  function copy(label: string, value: string) {
    void navigator.clipboard?.writeText(value).then(() => { setCopied(label); setTimeout(() => setCopied(""), 1500); }).catch(() => {});
  }

  const row = detail?.row ?? listRow;
  const loaded = detail !== null;
  const runRows = runs?.rows ?? [];

  return (
    <aside aria-label={`${kind === "session" ? "Session" : "User"} ${id}`} className="flex min-h-0 min-w-0 flex-col border-l border-[#1F242C] bg-[#0E1115] lg:max-h-[calc(100svh-6.5rem)] lg:sticky lg:top-0">
      <div className="flex items-center gap-2 border-b border-[#1F242C] px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7380]">{kind === "session" ? "Session" : "User"}</div>
          <div className="truncate font-mono text-sm" title={id}>{id}</div>
        </div>
        <button type="button" className={button} onClick={() => copy("id", id)}>{copied === "id" ? "Copied" : "Copy id"}</button>
        <button type="button" className={button} onClick={() => copy("link", window.location.href)}>{copied === "link" ? "Copied" : "Copy link"}</button>
        <button type="button" className={button} onClick={onPrevious} aria-label="Previous">↑</button>
        <button type="button" className={button} onClick={onNext} aria-label="Next">↓</button>
        <button type="button" className={button} onClick={onClose} aria-label="Close panel">×</button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {error ? (
          <div role="alert" className="m-3 border border-[#5B2B2B] bg-[#1A1010] p-3">
            <p className="text-[#FF8A8A]">{error}</p>
            <button type="button" className="mt-2 rounded bg-[#F4D44D] px-3 py-1.5 text-xs font-medium text-[#0B0D10]" onClick={() => void load(false)}>Try again</button>
          </div>
        ) : null}
        {!loaded && !error ? <div className="p-4 text-[#8B93A1]" role="status">Loading…</div> : null}
        {loaded && !row ? (
          <div className="p-6 text-center">
            <p className="font-medium">Nothing recorded for this {kind} in the last 90 days</p>
            <p className="mt-1 text-[#8B93A1]">The id may be misspelled, or its data has expired.</p>
            <button type="button" className="mt-3 rounded bg-[#F4D44D] px-3 py-1.5 text-xs font-medium text-[#0B0D10]" onClick={onClose}>Back to the list</button>
          </div>
        ) : null}

        {row ? (
          <>
            <dl className="grid grid-cols-3 gap-px border-b border-[#1F242C] bg-[#1F242C]">
              {([
                ["Runs", compactNumber(row.runs), ""],
                ["Failed", row.failedRuns ? compactNumber(row.failedRuns) : "–", row.failedRuns ? "text-[#FF8A8A]" : "text-[#6B7380]"],
                ["Cost", formatCost(row.totalCostUsd), ""],
                ["Tokens", compactNumber(row.inputTokens + row.outputTokens), ""],
                [kind === "session" ? "Length" : "Active for", row.spanSeconds ? formatDuration(row.spanSeconds * 1000) : "–", ""],
                ["Steps", compactNumber(row.spanCount), ""],
              ] as const).map(([label, value, tone]) => (
                <div key={label} className="bg-[#0E1115] px-3 py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-[#6B7380]">{label}</dt>
                  <dd className={`mt-0.5 font-mono text-sm ${tone}`}>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-[#1F242C] px-3 py-2 text-xs">
              <span className="text-[#6B7380]">First seen</span><span className="font-mono text-[#C9CED6]">{formatTime(row.firstSeenAt)}</span>
              <span className="text-[#6B7380]">Last seen</span><span className="font-mono text-[#C9CED6]" title={formatTime(row.lastSeenAt)}>{relativeTime(row.lastSeenAt, clock)}</span>
              <span className="text-[#6B7380]">Environment</span><span className="font-mono text-[#C9CED6]">{row.environment || "–"}</span>
              <span className="text-[#6B7380]">Top model</span><span className="font-mono text-[#C9CED6]">{row.topModel || "–"}</span>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-[#1F242C] px-3 py-2">
              <a className={`${button} inline-flex items-center`} href={`${tracingBase}?${field}=${filterValue}&range=90d`}>Open all in Tracing</a>
              {row.failedRuns ? <a className={`${button} inline-flex items-center`} href={`${tracingBase}?${field}=${filterValue}&status=error&range=90d`}>Only failed runs</a> : null}
            </div>
          </>
        ) : null}

        {row ? (
          <section aria-label="Runs" className="border-b border-[#1F242C]">
            <h2 className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-[#6B7380]">
              {kind === "session" ? "Conversation, oldest first" : "Runs, oldest first"}{runs && runs.total > runRows.length ? ` · first ${runRows.length} of ${compactNumber(runs.total)}` : ""}
            </h2>
            {!runs ? <p className="px-3 pb-3 text-[#8B93A1]">Loading runs…</p> : null}
            {runs && !runRows.length ? <p className="px-3 pb-3 text-[#8B93A1]">No runs in the last 90 days.</p> : null}
            <ol>
              {runRows.map((run) => {
                const prompt = previewText(run.inputPreview), answer = previewText(run.outputPreview);
                return (
                  <li key={run.runId} className="border-t border-[#14181E]">
                    <a href={`${tracingBase}?trace=${encodeURIComponent(run.runId)}&range=90d`} className="block px-3 py-2 hover:bg-[#12161C] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className={`size-1.5 shrink-0 rounded-full ${run.errorCount ? "bg-[#FF6B6B]" : "bg-[#5BE3A0]"}`} aria-label={run.errorCount ? "Failed" : "Succeeded"} />
                        <span className="truncate text-[#E6E9EE]">{run.traceName || run.runId}</span>
                        <span className="ml-auto shrink-0 text-[#8B93A1]" title={formatTime(run.startedAt)}>{relativeTime(run.startedAt, clock)}</span>
                      </div>
                      {prompt ? <p className="mt-1 line-clamp-2 text-xs text-[#C9CED6]"><span className="text-[#6B7380]">In </span>{prompt}</p> : null}
                      {answer ? <p className="mt-0.5 line-clamp-2 text-xs text-[#8B93A1]"><span className="text-[#6B7380]">Out </span>{answer}</p> : null}
                      <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px] text-[#6B7380]">
                        <span>{formatDuration(run.durationMs)}</span><span>{formatCost(run.totalCostUsd)}</span><span>{run.spanCount} steps</span>
                        {run.errorCount ? <span className="text-[#FF8A8A]">{run.errorCount} errors</span> : null}
                        {run.modelId ? <span>{run.modelId}</span> : null}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        {row && detail?.siblings.length ? (
          <section aria-label={kind === "session" ? "Users" : "Sessions"}>
            <h2 className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-[#6B7380]">{kind === "session" ? "Users in this session" : "Sessions, newest first"}</h2>
            <ul>
              {detail.siblings.map((item) => (
                <li key={item.id} className="border-t border-[#14181E]">
                  <button type="button" onClick={() => onOpen(otherKind, item.id)} className="flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-[#12161C]">
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-[#8AB4FF]">{item.id}</span>
                    <span className="font-mono text-[11px] text-[#8B93A1]">{item.runs} runs</span>
                    {item.failedRuns ? <span className="font-mono text-[11px] text-[#FF8A8A]">{item.failedRuns} failed</span> : null}
                    <span className="font-mono text-[11px] text-[#8B93A1]">{formatCost(item.totalCostUsd)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
