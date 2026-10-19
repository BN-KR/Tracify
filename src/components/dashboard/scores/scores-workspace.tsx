"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { filterScores, formatScoreValue, parseScoreInput, SCORE_RANGES, summariseByName, type NameSummary, type ScoreRow } from "@/lib/score-utils";
import { downloadFile, toCsv } from "../tracing/format";

type Query = Record<string, string>;
type SortKey = "createdAt" | "name" | "value";
const LOADED = 1000;
const control = "h-7 rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#C9CED6] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]";
const field = "w-full rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#E6E9EE] placeholder:text-[#6B7380] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]";
const SOURCE_TEXT: Record<string, string> = { human: "Human", llm: "AI judge", code: "Code rule", user: "App / API" };

function ago(timestamp: number, now: number) {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { dateStyle: "medium" });
}
function readUrl(initial: Query): Query {
  if (typeof window === "undefined") return initial;
  const query: Query = {};
  for (const [key, value] of new URLSearchParams(window.location.search)) if (value) query[key] = value.slice(0, 200);
  return query;
}
const percent = (value: number) => `${Math.round(value * 100)}%`;

function Sparkline({ values }: { values: Array<number | null> }) {
  const present = values.filter((value): value is number => value !== null);
  if (present.length < 2) return <span className="text-[10px] text-[#6B7380]">not enough days</span>;
  const lo = Math.min(...present); const hi = Math.max(...present); const span = hi - lo || 1;
  const points = values.map((value, index) => (value === null ? null : `${(index / 13) * 80},${22 - ((value - lo) / span) * 20}`)).filter(Boolean).join(" ");
  return <svg width="80" height="24" viewBox="0 0 80 24" role="img" aria-label="Trend over the last 14 days"><polyline points={points} fill="none" stroke="#F4D44D" strokeWidth="1.5" /></svg>;
}

function headline(summary: NameSummary) {
  if (summary.dataType === "numeric" && summary.average !== null) return { big: formatScoreValue(summary.average), small: `average · ${formatScoreValue(summary.min ?? 0)} to ${formatScoreValue(summary.max ?? 0)}` };
  if (summary.dataType === "boolean" && summary.passRate !== null) return { big: percent(summary.passRate), small: "true" };
  if (summary.top.length) return { big: summary.top[0].value.length > 14 ? `${summary.top[0].value.slice(0, 13)}…` : summary.top[0].value, small: summary.top.map((item) => `${item.value.slice(0, 12)} ${item.count}`).join(" · ") };
  return { big: "–", small: "" };
}

export function ScoresWorkspace({ projectId, initialQuery }: { projectId: string; initialQuery: Query }) {
  const typedProjectId = projectId as Id<"projects">;
  const scores = useQuery(api.evaluation.listScores, { projectId: typedProjectId, limit: LOADED }) as ScoreRow[] | undefined;
  const createScore = useMutation(api.evaluation.createScore);
  const [query, setQuery] = useState<Query>(() => ({ range: "30d", ...readUrl(initialQuery) }));
  const [draft, setDraft] = useState(query.q ?? "");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "createdAt", dir: "desc" });
  const [adding, setAdding] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedId = query.id ?? null;

  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer); }, []);
  const update = useCallback((patch: Query) => setQuery((current) => {
    const next = { ...current, ...patch };
    for (const key of Object.keys(next)) if (next[key] === "") delete next[key];
    return next;
  }), []);
  useEffect(() => {
    const params = new URLSearchParams(query);
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
  }, [query]);

  const range = SCORE_RANGES.find((item) => item.id === query.range) ?? SCORE_RANGES[2];
  const since = range.ms ? now - range.ms : undefined;
  const inRange = useMemo(() => (scores ?? []).filter((row) => !since || row.createdAt >= since), [scores, since]);
  const filtered = useMemo(() => filterScores(inRange, { q: query.q, name: query.name, source: query.source, type: query.type }), [inRange, query.q, query.name, query.source, query.type]);
  const summaries = useMemo(() => summariseByName(inRange, now), [inRange, now]);
  const rows = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === "name") return factor * a.name.localeCompare(b.name);
      if (sort.key === "value") return factor * ((typeof a.value === "number" ? a.value : typeof a.value === "boolean" ? Number(a.value) : -Infinity) - (typeof b.value === "number" ? b.value : typeof b.value === "boolean" ? Number(b.value) : -Infinity));
      return factor * (a.createdAt - b.createdAt);
    });
  }, [filtered, sort]);
  const selected = selectedId ? (scores ?? []).find((row) => row._id === selectedId) ?? null : null;
  const stats = useMemo(() => {
    const humans = inRange.filter((row) => row.source === "human").length;
    const bools = inRange.flatMap((row) => (typeof row.value === "boolean" ? [row.value] : []));
    return { total: inRange.length, names: summaries.length, humanShare: inRange.length ? humans / inRange.length : null, passRate: bools.length ? bools.filter(Boolean).length / bools.length : null };
  }, [inRange, summaries.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if (event.key === "/" && !typing) { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === "Escape" && !typing) { if (adding) setAdding(false); else if (selectedId) update({ id: "" }); }
      if ((event.key === "j" || event.key === "k" || event.key === "ArrowDown" || event.key === "ArrowUp") && !typing && rows.length) {
        event.preventDefault();
        const index = rows.findIndex((row) => row._id === selectedId);
        const next = event.key === "j" || event.key === "ArrowDown" ? Math.min(index + 1, rows.length - 1) : Math.max(index - 1, 0);
        update({ id: rows[next]._id });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adding, rows, selectedId, update]);

  function exportCsv() {
    downloadFile(`scores-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(["time", "name", "value", "type", "source", "trace", "span", "comment"], rows.map((row) => [new Date(row.createdAt).toISOString(), row.name, String(row.value), row.dataType, row.source, row.traceId ?? "", row.spanId ?? "", row.comment ?? ""])), "text/csv");
  }
  const sortBy = (key: SortKey) => setSort((current) => ({ key, dir: current.key === key && current.dir === "desc" ? "asc" : "desc" }));
  const th = (key: SortKey, label: string, className = "") => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={`px-3 py-2 font-medium ${className}`}>
      <button type="button" onClick={() => sortBy(key)} className="uppercase tracking-wider hover:text-white">{label}{sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}</button>
    </th>
  );
  const chips = [
    query.q && { key: "q", label: `“${query.q}”` }, query.name && { key: "name", label: `name ${query.name}` },
    query.source && { key: "source", label: `source ${SOURCE_TEXT[query.source] ?? query.source}` }, query.type && { key: "type", label: `type ${query.type}` },
  ].filter(Boolean) as Array<{ key: string; label: string }>;
  const loadedAll = (scores?.length ?? 0) < LOADED;

  return (
    <div className="flex min-h-svh min-w-0 flex-col bg-[#0B0D10] font-[family-name:var(--font-geist-sans)] text-[13px] text-[#E6E9EE]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-4 py-2">
        <h1 className="mr-2 text-base font-semibold tracking-tight">Scores</h1>
        <form className="min-w-[180px] flex-1" onSubmit={(event) => { event.preventDefault(); update({ q: draft.trim() }); }}>
          <label htmlFor="score-search" className="sr-only">Search scores</label>
          <input id="score-search" ref={searchRef} value={draft} onChange={(event) => { setDraft(event.target.value); if (!event.target.value) update({ q: "" }); }} placeholder="Search name, trace, comment or value ( / )" className="h-8 w-full rounded border border-[#262C35] bg-[#0E1115] px-3 font-mono text-xs placeholder:text-[#6B7380] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]" />
        </form>
        <label className="sr-only" htmlFor="score-source">Source</label>
        <select id="score-source" className={control} value={query.source ?? ""} onChange={(event) => update({ source: event.target.value })}><option value="">All sources</option>{Object.entries(SOURCE_TEXT).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
        <label className="sr-only" htmlFor="score-type">Type</label>
        <select id="score-type" className={control} value={query.type ?? ""} onChange={(event) => update({ type: event.target.value })}><option value="">All types</option>{["numeric", "boolean", "categorical", "text"].map((id) => <option key={id} value={id}>{id}</option>)}</select>
        <label className="sr-only" htmlFor="score-range">Time range</label>
        <select id="score-range" className={control} value={range.id} onChange={(event) => update({ range: event.target.value })}>{SCORE_RANGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#8B93A1]"><span className="size-1.5 animate-pulse rounded-full bg-[#5BE3A0]" />Live</span>
        <button type="button" onClick={exportCsv} disabled={!rows.length} className={`${control} disabled:opacity-40`}>Export CSV</button>
        <button type="button" onClick={() => { setAdding(true); update({ id: "" }); }} className="h-7 rounded bg-[#F4D44D] px-3 text-xs font-medium text-[#090909] hover:bg-[#f7de70]">Add score</button>
      </header>
      {chips.length ? (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1F242C] px-4 py-1.5" aria-label="Active filters">
          {chips.map((chip) => <button key={chip.key} type="button" onClick={() => { if (chip.key === "q") setDraft(""); update({ [chip.key]: "" }); }} aria-label={`Remove filter ${chip.label}`} className="rounded border border-[#3A3420] bg-[#1A170C] px-2 py-0.5 font-mono text-[11px] text-[#F4D44D]">{chip.label} ×</button>)}
          <button type="button" onClick={() => { setDraft(""); update({ q: "", name: "", source: "", type: "" }); }} className="px-1 text-[11px] text-[#8B93A1] underline hover:text-white">Clear all</button>
        </div>
      ) : null}
      <section aria-label="Summary" className="grid grid-cols-2 gap-px border-b border-[#1F242C] bg-[#1F242C] sm:grid-cols-4">
        {[["Scores", stats.total.toLocaleString()], ["Score names", String(stats.names)], ["True rate (yes/no scores)", stats.passRate === null ? "–" : percent(stats.passRate)], ["Given by people", stats.humanShare === null ? "–" : percent(stats.humanShare)]].map(([label, value]) => (
          <div key={label} className="bg-[#0B0D10] px-4 py-2.5"><div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7380]">{label}</div><div className="mt-0.5 font-mono text-base">{scores === undefined ? "–" : value}</div></div>
        ))}
      </section>
      <div className={`grid min-h-0 flex-1 ${selected || adding ? "lg:grid-cols-[minmax(0,1fr)_minmax(380px,42%)]" : "grid-cols-1"}`}>
        <main className={`min-w-0 overflow-auto ${selected || adding ? "hidden lg:block" : ""}`}>
          {scores === undefined ? (
            <div className="grid gap-px p-4" role="status" aria-label="Loading scores">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-9 animate-pulse rounded bg-[#11151A]" />)}</div>
          ) : !scores.length ? (
            <div className="mx-auto max-w-md p-10 text-center">
              <h2 className="text-sm font-semibold">No scores yet</h2>
              <p className="mt-2 text-xs leading-5 text-[#8B93A1]">A score is a grade on a trace: a number, a yes/no or a category. They arrive from evaluators, from people reviewing traces, or from your own code. You can also add one by hand to see how it looks.</p>
              <button type="button" onClick={() => setAdding(true)} className="mt-4 h-8 rounded bg-[#F4D44D] px-3 text-xs font-medium text-[#090909]">Add the first score</button>
            </div>
          ) : (
            <>
              {summaries.length ? (
                <section aria-label="Scores by name" className="border-b border-[#1F242C] p-3">
                  <h2 className="mb-2 px-1 text-[10px] uppercase tracking-wider text-[#6B7380]">By score name · click to filter</h2>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {summaries.slice(0, 12).map((summary) => {
                      const { big, small } = headline(summary);
                      const active = query.name === summary.name;
                      return (
                        <button key={summary.name} type="button" aria-pressed={active} onClick={() => update({ name: active ? "" : summary.name })} className={`min-w-0 rounded border bg-[#0E1115] p-3 text-left hover:border-[#3A3420] ${active ? "border-[#F4D44D]" : "border-[#1F242C]"}`}>
                          <div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate font-mono text-xs font-medium">{summary.name}</span><span className="font-mono text-[10px] text-[#6B7380]">{summary.dataType}{summary.mixed ? " +" : ""}</span></div>
                          <div className="mt-1.5 flex items-end justify-between gap-2"><div className="min-w-0"><div className="font-mono text-lg leading-none">{big}</div><div className="mt-1 truncate text-[11px] text-[#8B93A1]">{small}</div></div><Sparkline values={summary.trend} /></div>
                          <div className="mt-1.5 font-mono text-[10px] text-[#6B7380]">{summary.count.toLocaleString()} score{summary.count === 1 ? "" : "s"} · {summary.sources.map((source) => SOURCE_TEXT[source]).join(", ")}{summary.mixed ? " · mixed types" : ""}</div>
                        </button>
                      );
                    })}
                  </div>
                  {summaries.length > 12 ? <p className="mt-2 px-1 text-[11px] text-[#6B7380]">Showing the 12 most recently used of {summaries.length} score names. Search to find the others.</p> : null}
                </section>
              ) : null}
              {!rows.length ? (
                <div className="p-10 text-center text-xs text-[#8B93A1]">No scores match these filters. <button type="button" onClick={() => { setDraft(""); update({ q: "", name: "", source: "", type: "" }); }} className="text-[#8AB4FF] underline">Clear filters</button></div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 bg-[#0B0D10] text-[10px] text-[#6B7380]"><tr>{th("createdAt", "Time")}{th("name", "Name")}{th("value", "Value")}<th scope="col" className="hidden px-3 py-2 font-medium uppercase tracking-wider md:table-cell">Source</th><th scope="col" className="hidden px-3 py-2 font-medium uppercase tracking-wider lg:table-cell">Trace</th></tr></thead>
                  <tbody>
                    {rows.slice(0, 200).map((row) => (
                      <tr key={row._id} onClick={() => { setAdding(false); update({ id: row._id }); }} aria-selected={row._id === selectedId} className={`cursor-pointer border-t border-[#161B21] hover:bg-[#11151A] ${row._id === selectedId ? "bg-[#11151A] shadow-[inset_2px_0_0_#F4D44D]" : ""}`}>
                        <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px] text-[#8B93A1]" title={new Date(row.createdAt).toLocaleString()}>{ago(row.createdAt, now)}</td>
                        <td className="max-w-[14rem] px-3 py-1.5"><button type="button" onClick={(event) => { event.stopPropagation(); update({ name: row.name }); }} className="block max-w-full truncate text-left font-mono text-xs text-[#8AB4FF] hover:underline" title={`Filter by ${row.name}`}>{row.name}</button></td>
                        <td className="px-3 py-1.5 font-mono text-xs"><span className={typeof row.value === "boolean" ? (row.value ? "text-[#5BE3A0]" : "text-[#FF8A8A]") : ""}>{formatScoreValue(row.value)}</span></td>
                        <td className="hidden px-3 py-1.5 text-[11px] text-[#8B93A1] md:table-cell">{SOURCE_TEXT[row.source]}</td>
                        <td className="hidden max-w-[10rem] truncate px-3 py-1.5 font-mono text-[11px] text-[#6B7380] lg:table-cell">{row.traceId ?? row.spanId ?? "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <footer className="border-t border-[#1F242C] px-4 py-2 font-mono text-[11px] text-[#6B7380]">
                {rows.length.toLocaleString()} match{rows.length === 1 ? "es" : ""}{rows.length > 200 ? ", showing the newest 200 (export for all)" : ""}.{" "}
                {loadedAll ? "Everything in this project is loaded." : `Based on the newest ${LOADED.toLocaleString()} scores in this project.`}
              </footer>
            </>
          )}
        </main>
        {adding ? <AddScore onClose={() => setAdding(false)} onSave={async (input) => { const id = await createScore({ projectId: typedProjectId, ...input }); setAdding(false); update({ id }); }} /> : selected ? <ScorePanel projectId={projectId} row={selected} onClose={() => update({ id: "" })} onFilter={(name) => update({ name })} now={now} /> : null}
      </div>
      {selectedId && scores && !selected && !adding ? <p role="alert" className="border-t border-[#5B2B2B] bg-[#1A1010] px-4 py-2 text-xs text-[#FF8A8A]">That score is not in the newest {LOADED.toLocaleString()} scores. <button type="button" onClick={() => update({ id: "" })} className="underline">Back to the list</button></p> : null}
    </div>
  );
}

function ScorePanel({ projectId, row, onClose, onFilter, now }: { projectId: string; row: ScoreRow; onClose: () => void; onFilter: (name: string) => void; now: number }) {
  const sameTrace = useQuery(api.evaluationEngine.traceQuality, row.traceId ? { projectId: projectId as Id<"projects">, traceId: row.traceId } : "skip");
  const [copied, setCopied] = useState(false);
  const others = (sameTrace?.scores ?? []).filter((score) => score._id !== row._id);
  return (
    <aside className="flex min-h-0 flex-col border-l border-[#1F242C] bg-[#0B0D10]" aria-label={`Score ${row.name}`}>
      <div className="flex items-start gap-2 border-b border-[#1F242C] px-4 py-3">
        <div className="min-w-0 flex-1"><h2 className="truncate font-mono text-sm font-semibold" title={row.name}>{row.name}</h2><p className="mt-0.5 font-mono text-[11px] text-[#6B7380]">{SOURCE_TEXT[row.source]} · {row.dataType} · {ago(row.createdAt, now)}</p></div>
        <button type="button" onClick={onClose} className="h-7 shrink-0 rounded border border-[#262C35] px-2 text-xs text-[#C9CED6] hover:text-white">Close</button>
      </div>
      <div className="grid min-h-0 flex-1 content-start gap-4 overflow-auto p-4">
        <div><div className="text-[10px] uppercase tracking-wider text-[#6B7380]">Value</div><div className={`mt-1 break-words font-mono text-2xl ${typeof row.value === "boolean" ? (row.value ? "text-[#5BE3A0]" : "text-[#FF8A8A]") : ""}`}>{typeof row.value === "string" ? row.value : formatScoreValue(row.value)}</div></div>
        {row.comment ? <div><div className="text-[10px] uppercase tracking-wider text-[#6B7380]">Reason or comment</div><p className="mt-1 whitespace-pre-wrap rounded border border-[#1F242C] bg-[#0E1115] p-3 text-xs leading-5 text-[#C9CED6]">{row.comment}</p></div> : null}
        <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-xs">
          <dt className="text-[#6B7380]">Recorded</dt><dd className="font-mono">{new Date(row.createdAt).toLocaleString()}</dd>
          <dt className="text-[#6B7380]">Given by</dt><dd className="break-all font-mono">{row.createdBy === "system" ? "Tracify (automatic)" : row.createdBy}</dd>
          {row.traceId ? <><dt className="text-[#6B7380]">Trace</dt><dd><Link href={`/dashboard/${projectId}/tracing?trace=${encodeURIComponent(row.traceId)}`} className="break-all font-mono text-[#8AB4FF] underline">{row.traceId}</Link></dd></> : null}
          {row.spanId ? <><dt className="text-[#6B7380]">Span</dt><dd className="break-all font-mono">{row.spanId}</dd></> : null}
        </dl>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => onFilter(row.name)} className={control}>Show all “{row.name.length > 24 ? `${row.name.slice(0, 23)}…` : row.name}”</button>
          <button type="button" onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}?id=${row._id}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className={control}>{copied ? "Link copied" : "Copy link"}</button>
        </div>
        {row.traceId ? (
          <div>
            <h3 className="mb-1.5 text-[10px] uppercase tracking-wider text-[#6B7380]">Other scores on this trace</h3>
            {sameTrace === undefined ? <p className="text-xs text-[#8B93A1]" role="status">Loading…</p> : !others.length ? <p className="text-xs text-[#6B7380]">This is the only score on the trace.</p> : (
              <ul className="grid gap-1">{others.map((score) => <li key={score._id} className="flex items-center gap-2 rounded border border-[#1F242C] bg-[#0E1115] px-2.5 py-1.5"><span className="min-w-0 flex-1 truncate font-mono text-xs">{score.name}</span><span className="font-mono text-xs">{formatScoreValue(score.value)}</span><span className="text-[10px] text-[#6B7380]">{SOURCE_TEXT[score.source]}</span></li>)}</ul>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function AddScore({ onClose, onSave }: { onClose: () => void; onSave: (input: { traceId: string; name: string; value: number | boolean | string; dataType: ScoreRow["dataType"]; source: "human" | "user"; comment?: string }) => Promise<void> }) {
  const [traceId, setTraceId] = useState("");
  const [name, setName] = useState("");
  const [dataType, setDataType] = useState<ScoreRow["dataType"]>("numeric");
  const [value, setValue] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!traceId.trim()) return setError("Paste the id of the trace this score is for.");
    if (!name.trim()) return setError("Give the score a name, like “helpfulness”.");
    if (name.trim().length > 100) return setError("A score name can be at most 100 characters.");
    const parsed = parseScoreInput(dataType, value);
    if ("error" in parsed) return setError(parsed.error);
    setSaving(true); setError(null);
    try { await onSave({ traceId: traceId.trim(), name: name.trim(), value: parsed.value, dataType, source: "human", comment: comment.trim() || undefined }); } catch (reason) {
      const match = (reason instanceof Error ? reason.message : "").match(/Uncaught Error: ([^\n]+)/);
      setError(match?.[1] ?? "That did not save. Check your connection and try again.");
      setSaving(false);
    }
  }
  return (
    <aside className="flex min-h-0 flex-col border-l border-[#1F242C] bg-[#0B0D10]">
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4" aria-label="Add a score">
        <h2 className="text-sm font-semibold">Add a score</h2>
        <p className="text-[11px] leading-4 text-[#6B7380]">Grade a trace by hand. It is recorded as a human score and shows up everywhere scores do.</p>
        <label className="grid gap-1 text-[11px] text-[#8B93A1]">Trace id<input value={traceId} onChange={(event) => setTraceId(event.target.value)} maxLength={200} placeholder="Paste it from the Tracing page" className={`${field} h-8 font-mono`} autoFocus /></label>
        <label className="grid gap-1 text-[11px] text-[#8B93A1]">Score name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="helpfulness" className={`${field} h-8 font-mono`} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-[11px] text-[#8B93A1]">Type<select value={dataType} onChange={(event) => { setDataType(event.target.value as ScoreRow["dataType"]); setValue(""); }} className={`${field} h-8`}><option value="numeric">Number</option><option value="boolean">Yes / no</option><option value="categorical">Category</option><option value="text">Free text</option></select></label>
          <label className="grid gap-1 text-[11px] text-[#8B93A1]">Value
            {dataType === "boolean" ? <select value={value} onChange={(event) => setValue(event.target.value)} className={`${field} h-8`}><option value="">Choose…</option><option value="true">Yes (true)</option><option value="false">No (false)</option></select>
              : <input value={value} onChange={(event) => setValue(event.target.value)} inputMode={dataType === "numeric" ? "decimal" : undefined} placeholder={dataType === "numeric" ? "0.8" : dataType === "categorical" ? "friendly" : "What you noticed"} className={`${field} h-8`} />}
          </label>
        </div>
        <label className="grid gap-1 text-[11px] text-[#8B93A1]">Comment (optional)<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={4000} rows={3} className={`${field} resize-y p-2 leading-5`} /></label>
        {error ? <p role="alert" className="rounded border border-[#5B2B2B] bg-[#1A1010] px-3 py-2 text-xs text-[#FF8A8A]">{error}</p> : null}
        <div className="flex gap-2"><button type="submit" disabled={saving} className="h-8 rounded bg-[#F4D44D] px-3 text-xs font-medium text-[#090909] disabled:opacity-50">{saving ? "Saving…" : "Save score"}</button><button type="button" onClick={onClose} disabled={saving} className="h-8 rounded border border-[#262C35] px-3 text-xs text-[#C9CED6] hover:text-white">Cancel</button></div>
      </form>
    </aside>
  );
}
