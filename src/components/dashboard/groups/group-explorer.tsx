"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GROUP_SORTS, type GroupKind } from "@/lib/group-filters";
import type { GroupRow, GroupStats } from "@/lib/tinybird-groups";
import { RANGES, TimeRangePicker } from "../tracing/time-range-picker";
import { compactNumber, downloadFile, formatCost, formatDuration, formatTime, relativeTime, toCsv } from "../tracing/format";
import { readJson } from "@/lib/safe-json";
import { GroupPanel } from "./group-panel";

type ListResponse = {
  rows: GroupRow[]; total: number; page: number; pageSize: number; stats: GroupStats;
  environments: Array<{ value: string; groups: number }>; error?: string;
};
type Query = Record<string, string>;

const LIVE_STORAGE = "tracify.groups.live";
/** URL keys that choose the view, not the data, so they are not sent to the list request. */
const VIEW_KEYS = ["range", "from", "to", "id"];

export const KIND_TEXT = {
  session: { title: "Sessions", one: "session", many: "sessions", other: "User", otherPlural: "users", route: "sessions", otherRoute: "users", search: "Search sessions or users", blurb: "A session groups one conversation's runs together." },
  user: { title: "Users", one: "user", many: "users", other: "Sessions", otherPlural: "sessions", route: "users", otherRoute: "sessions", search: "Search users or sessions", blurb: "Everything one end user did across all their sessions." },
} as const;

function currentUrlQuery(): Query {
  if (typeof window === "undefined") return {};
  const query: Query = {};
  for (const [key, value] of new URLSearchParams(window.location.search)) if (value) query[key] = value.slice(0, key === "q" || key === "id" ? 200 : 4096);
  return query;
}

const control = "h-7 rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#C9CED6] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]";

export function GroupExplorer({ projectId, kind, initialQuery }: { projectId: string; kind: GroupKind; initialQuery: Query }) {
  const text = KIND_TEXT[kind];
  const [query, setQuery] = useState<Query>(() => ({ range: "30d", ...(typeof window === "undefined" ? initialQuery : currentUrlQuery()) }));
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [clock, setClock] = useState(() => Date.now());
  const [live, setLive] = useState(true);
  const [draft, setDraft] = useState(query.q ?? "");
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const selected = query.id ?? null;

  // The live/paused choice is remembered per browser, which only exists after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { try { if (window.localStorage.getItem(LIVE_STORAGE) === "paused") setLive(false); } catch {} }, []);
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 10_000); return () => clearInterval(timer); }, []);

  const update = useCallback((patch: Query, resetPage = true) => {
    setQuery((current) => {
      const next: Query = { ...current, ...patch };
      if (resetPage && !("page" in patch)) delete next.page;
      for (const key of Object.keys(next)) if (next[key] === "") delete next[key];
      return next;
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(query);
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
  }, [query]);

  const apiParams = useMemo(() => {
    const params = new URLSearchParams();
    const range = RANGES.find((item) => item.id === query.range);
    const to = query.to ? Number(query.to) : now;
    params.set("to", String(to));
    params.set("from", query.from ?? String(to - (range?.ms ?? 2_592_000_000)));
    for (const [key, value] of Object.entries(query)) if (!VIEW_KEYS.includes(key)) params.set(key, value);
    return params;
  }, [query, now]);
  const requestKey = apiParams.toString();
  const loading = settledKey !== requestKey;
  const base = `/api/projects/${encodeURIComponent(projectId)}/groups/${kind}`;

  const load = useCallback(() => {
    const id = ++requestId.current;
    fetch(`${base}?${apiParams}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await readJson<ListResponse>(response);
        if (!response.ok) throw new Error(body.error ?? `Could not load ${text.many} (error ${response.status}). Try again in a moment.`);
        return body;
      })
      .then((body) => { if (id !== requestId.current) return; setData(body); setError(null); setSettledKey(requestKey); })
      .catch((reason: unknown) => {
        if (id !== requestId.current) return;
        setError(reason instanceof Error ? reason.message : `Could not load ${text.many}`);
        setSettledKey(requestKey);
      });
  }, [apiParams, base, requestKey, text.many]);
  useEffect(() => { load(); }, [load]);

  const isLive = live && !query.from && !query.to;
  // Live updates move the window forward on relative ranges. Paused, fixed windows and hidden tabs do not poll; a
  // successful poll clears an earlier error and failures back off from 5s to 60s.
  useEffect(() => {
    if (!isLive) return;
    const rangeMs = RANGES.find((item) => item.id === query.range)?.ms ?? 2_592_000_000;
    let delay = 5000;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const tick = async () => {
      if (!document.hidden && settledKey === requestKey) {
        const issued = requestId.current;
        const params = new URLSearchParams(apiParams);
        const to = Date.now();
        params.set("to", String(to));
        params.set("from", String(to - rangeMs));
        try {
          const response = await fetch(`${base}?${params}`, { cache: "no-store" });
          if (!response.ok) throw new Error(`poll ${response.status}`);
          const body = await readJson<ListResponse>(response);
          delay = 5000;
          if (issued === requestId.current) {
            setError(null);
            setData((current) => {
              const known = new Set((current?.rows ?? []).map((row) => row.id));
              const added = current ? body.rows.filter((row) => !known.has(row.id)).map((row) => row.id) : [];
              if (added.length) setFresh(new Set(added));
              return body;
            });
          }
        } catch { delay = Math.min(delay * 2, 60_000); }
      }
      if (!stopped) timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, delay);
    return () => { stopped = true; clearTimeout(timer); };
  }, [apiParams, base, isLive, query.range, requestKey, settledKey]);

  useEffect(() => {
    if (!fresh.size) return;
    const timer = setTimeout(() => setFresh(new Set()), 2500);
    return () => clearTimeout(timer);
  }, [fresh]);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const stats = data?.stats;
  const total = data?.total ?? 0;
  const page = Number(query.page ?? 0);
  const pageSize = Number(query.pageSize ?? 50);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const sort = (GROUP_SORTS as readonly string[]).includes(query.sort ?? "") ? query.sort! : "lastSeenAt";
  const direction = query.dir === "asc" ? "asc" : "desc";

  const selectIndex = useCallback((delta: number) => {
    if (!rows.length) return;
    const index = rows.findIndex((row) => row.id === selected);
    const next = rows[Math.min(Math.max(index + delta, 0), rows.length - 1)] ?? rows[0];
    update({ id: next.id }, false);
  }, [rows, selected, update]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "/") { event.preventDefault(); searchRef.current?.focus(); return; }
      if (event.key === "Escape" && selected) update({ id: "" }, false);
      if (event.key === "ArrowDown" || event.key === "j") { event.preventDefault(); selectIndex(1); }
      if (event.key === "ArrowUp" || event.key === "k") { event.preventDefault(); selectIndex(-1); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectIndex, selected, update]);

  function sortBy(next: string) {
    update({ sort: next, dir: sort === next && direction === "desc" ? "asc" : "desc" });
  }
  function toggleLive() {
    const next = !live;
    setLive(next);
    if (next) setNow(Date.now());
    try { window.localStorage.setItem(LIVE_STORAGE, next ? "live" : "paused"); } catch {}
  }
  function exportCsv() {
    downloadFile(`${text.many}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`, toCsv(
      [text.one, text.other, "Runs", "Failed runs", "Cost (USD)", "Tokens", "First seen (UTC)", "Last seen (UTC)", "Environment", "Top model"],
      rows.map((row) => [row.id, kind === "session" ? row.other : String(row.others), row.runs, row.failedRuns, row.totalCostUsd, row.inputTokens + row.outputTokens, row.firstSeenAt, row.lastSeenAt, row.environment, row.topModel]),
    ), "text/csv;charset=utf-8");
  }

  const filters = [
    ...(query.q ? [{ key: "q", label: `Search: ${query.q}` }] : []),
    ...(query.environment ? [{ key: "environment", label: `Environment: ${query.environment}` }] : []),
    ...(query.status ? [{ key: "status", label: query.status === "error" ? "With errors only" : "Healthy only" }] : []),
  ];
  const selectedRow = rows.find((row) => row.id === selected) ?? null;
  const columns: Array<{ id: string; label: string; right?: boolean; sort?: string }> = [
    { id: "id", label: text.one === "session" ? "Session" : "User", sort: "id" },
    { id: "other", label: kind === "session" ? "User" : "Sessions", right: kind === "user" },
    { id: "runs", label: "Runs", right: true, sort: "runs" },
    { id: "failed", label: "Failed", right: true, sort: "failedRuns" },
    { id: "cost", label: "Cost", right: true, sort: "totalCostUsd" },
    { id: "tokens", label: "Tokens", right: true, sort: "tokens" },
    ...(kind === "session" ? [{ id: "length", label: "Length", right: true, sort: "spanSeconds" }] : []),
    { id: "model", label: "Top model" },
    { id: "last", label: "Last active", sort: "lastSeenAt" },
  ];

  return (
    <div className="flex min-h-svh min-w-0 flex-col bg-[#0B0D10] font-[family-name:var(--font-geist-sans)] text-[13px] text-[#E6E9EE]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-4 py-2">
        <h1 className="mr-2 text-base font-semibold tracking-tight">{text.title}</h1>
        <form className="min-w-[180px] flex-1" onSubmit={(event) => { event.preventDefault(); update({ q: draft.trim() }); }}>
          <label htmlFor={`${kind}-search`} className="sr-only">{text.search}</label>
          <input
            id={`${kind}-search`} ref={searchRef} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={200}
            placeholder={`${text.search}  ( / )`}
            className="h-8 w-full rounded border border-[#262C35] bg-[#0E1115] px-3 font-mono text-xs text-[#E6E9EE] placeholder:text-[#6B7380] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]"
          />
        </form>
        <TimeRangePicker
          range={query.range ?? "30d"} from={query.from ? Number(query.from) : undefined} to={query.to ? Number(query.to) : undefined} now={now}
          onPreset={(id) => { setNow(Date.now()); update({ range: id, from: "", to: "" }); }}
          onCustom={(from, to) => update({ from: String(from), to: String(to) })}
          onReset={() => { setNow(Date.now()); update({ from: "", to: "", range: "30d" }); }}
        />
        <label className="sr-only" htmlFor={`${kind}-env`}>Environment</label>
        <select id={`${kind}-env`} className={control} value={query.environment ?? ""} onChange={(event) => update({ environment: event.target.value })}>
          <option value="">All environments</option>
          {query.environment && !data?.environments.some((item) => item.value === query.environment) ? <option value={query.environment}>{query.environment}</option> : null}
          {(data?.environments ?? []).map((item) => <option key={item.value} value={item.value}>{item.value} ({compactNumber(item.groups)})</option>)}
        </select>
        <label className="sr-only" htmlFor={`${kind}-status`}>Status</label>
        <select id={`${kind}-status`} className={control} value={query.status ?? ""} onChange={(event) => update({ status: event.target.value })}>
          <option value="">All {text.many}</option>
          <option value="error">With errors</option>
          <option value="healthy">Healthy only</option>
        </select>
        <button type="button" onClick={toggleLive} aria-pressed={isLive} disabled={Boolean(query.from || query.to)} title={query.from || query.to ? "Live updates are off for a fixed time window" : undefined} className={`${control} flex items-center gap-1.5 disabled:opacity-50`}>
          <span className={`size-1.5 rounded-full ${isLive ? "animate-pulse bg-[#5BE3A0]" : "bg-[#6B7380]"}`} />
          {isLive ? "Live" : query.from || query.to ? "Fixed window" : "Paused"}
        </button>
        <button type="button" onClick={() => { setNow(Date.now()); load(); }} className={control}>Refresh</button>
        <button type="button" onClick={exportCsv} disabled={!rows.length} className={`${control} disabled:opacity-40`}>Export CSV</button>
      </header>

      {filters.length ? (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1F242C] px-4 py-1.5" aria-label="Active filters">
          {filters.map((filter) => (
            <button key={filter.key} type="button" onClick={() => { if (filter.key === "q") setDraft(""); update({ [filter.key]: "" }); }} aria-label={`Remove filter ${filter.label}`} className="flex items-center gap-1 rounded bg-[#1A1F27] px-2 py-0.5 font-mono text-[11px] text-[#C9CED6] hover:text-white">
              {filter.label} <span aria-hidden>×</span>
            </button>
          ))}
          <button type="button" onClick={() => { setDraft(""); update({ q: "", environment: "", status: "" }); }} className="px-1 text-[11px] text-[#8B93A1] underline hover:text-white">Clear all</button>
        </div>
      ) : null}

      <section aria-label="Summary" className="grid grid-cols-2 gap-px border-b border-[#1F242C] bg-[#1F242C] sm:grid-cols-3 lg:grid-cols-6">
        {([
          [text.title, stats ? compactNumber(stats.groups) : "–"],
          ["Runs", stats ? compactNumber(stats.runs) : "–"],
          ["Failed runs", stats ? compactNumber(stats.failedRuns) : "–"],
          [`${text.title} with errors`, stats ? compactNumber(stats.groupsWithErrors) : "–"],
          ["Cost", stats ? formatCost(stats.totalCostUsd) : "–"],
          ["Tokens", stats ? compactNumber(stats.tokens) : "–"],
        ] as const).map(([label, value]) => (
          <div key={label} className="bg-[#0B0D10] px-4 py-2.5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7380]">{label}</div>
            <div className={`mt-0.5 font-mono text-base ${loading && !data ? "text-[#6B7380]" : label === "Failed runs" && stats?.failedRuns ? "text-[#FF8A8A]" : "text-[#E6E9EE]"}`}>{value}</div>
          </div>
        ))}
      </section>

      <div className={`grid min-h-0 flex-1 ${selected ? "lg:grid-cols-[minmax(0,1fr)_minmax(380px,46%)]" : "grid-cols-1"}`}>
        <main className={`min-w-0 overflow-auto ${selected ? "hidden lg:block" : ""}`}>
          {error ? (
            <div role="alert" className="m-4 border border-[#5B2B2B] bg-[#1A1010] p-4">
              <p className="text-[#FF8A8A]">{error}</p>
              <button type="button" onClick={load} className="mt-3 rounded bg-[#F4D44D] px-3 py-1.5 text-xs font-medium text-[#0B0D10]">Try again</button>
            </div>
          ) : null}
          {!data && !error ? <div className="p-6 text-[#8B93A1]" role="status">Loading {text.many}…</div> : null}
          {data && !rows.length && !error ? (
            <div className="mx-auto max-w-md p-10 text-center">
              <p className="text-base font-medium">{filters.length ? `No ${text.many} match these filters` : `No ${text.many} in this time range`}</p>
              <p className="mt-2 text-[#8B93A1]">
                {filters.length ? "Clear a filter or widen the time range." : kind === "session"
                  ? "Sessions appear once your agent sends a session id with its steps. Add sessionId to your SDK calls."
                  : "Users appear once your agent sends an end user id with its steps. Add endUserId to your SDK calls."}
              </p>
              {filters.length ? <button type="button" className="mt-4 rounded bg-[#F4D44D] px-4 py-2 text-sm font-medium text-[#0B0D10]" onClick={() => { setDraft(""); update({ q: "", environment: "", status: "", range: "90d", from: "", to: "" }); }}>Clear filters and show 90 days</button>
                : <a className="mt-4 inline-block rounded bg-[#F4D44D] px-4 py-2 text-sm font-medium text-[#0B0D10]" href={`/dashboard/${encodeURIComponent(projectId)}/quickstart`}>Open quickstart</a>}
            </div>
          ) : null}
          {rows.length ? (
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">{text.title}</caption>
              <thead className="sticky top-0 z-10 bg-[#0E1115]">
                <tr>
                  {columns.map((column) => {
                    const active = column.sort === sort;
                    return (
                      <th key={column.id} scope="col" aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : column.sort ? "none" : undefined} className={`border-b border-[#1F242C] px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-[#6B7380] ${column.right ? "text-right" : ""}`}>
                        {column.sort ? (
                          <button type="button" onClick={() => sortBy(column.sort!)} className={`uppercase hover:text-white ${active ? "text-[#F4D44D]" : ""}`}>
                            {column.label}{active ? (direction === "asc" ? " ↑" : " ↓") : ""}
                          </button>
                        ) : column.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className={loading ? "opacity-60" : ""}>
                {rows.map((row) => (
                  <tr key={row.id} aria-selected={selected === row.id} onClick={() => update({ id: row.id }, false)} className={`h-8 cursor-pointer border-b border-[#14181E] hover:bg-[#12161C] ${selected === row.id ? "bg-[#161B22] shadow-[inset_2px_0_0_#F4D44D]" : fresh.has(row.id) ? "bg-[#1C1A0E]" : ""}`}>
                    <td className="max-w-[260px] px-3 py-1.5">
                      <button type="button" onClick={(event) => { event.stopPropagation(); update({ id: row.id }, false); }} className="block max-w-full truncate text-left font-mono text-xs text-[#8AB4FF] hover:underline" title={row.id}>{row.id}</button>
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-1.5 font-mono text-xs text-[#C9CED6]">
                      {kind === "session"
                        ? row.other ? <a href={`/dashboard/${encodeURIComponent(projectId)}/users?id=${encodeURIComponent(row.other)}`} onClick={(event) => event.stopPropagation()} className="text-[#8AB4FF] hover:underline" title={row.others > 1 ? `${row.others} users` : row.other}>{row.other}{row.others > 1 ? ` +${row.others - 1}` : ""}</a> : <span className="text-[#6B7380]">–</span>
                        : <span className="block text-right">{compactNumber(row.others)}</span>}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs">{compactNumber(row.runs)}</td>
                    <td className={`px-3 py-1.5 text-right font-mono text-xs ${row.failedRuns ? "text-[#FF8A8A]" : "text-[#6B7380]"}`}>{row.failedRuns ? compactNumber(row.failedRuns) : "–"}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs">{formatCost(row.totalCostUsd)}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs text-[#C9CED6]">{compactNumber(row.inputTokens + row.outputTokens)}</td>
                    {kind === "session" ? <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono text-xs text-[#C9CED6]">{row.spanSeconds ? formatDuration(row.spanSeconds * 1000) : <span className="text-[#6B7380]">–</span>}</td> : null}
                    <td className="max-w-[160px] truncate px-3 py-1.5 font-mono text-xs text-[#8B93A1]" title={row.topModel}>{row.topModel || "–"}</td>
                    <td className="whitespace-nowrap px-3 py-1.5 font-mono text-xs text-[#8B93A1]" title={formatTime(row.lastSeenAt)}>{relativeTime(row.lastSeenAt, clock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </main>

        {selected ? (
          <GroupPanel
            key={selected} projectId={projectId} kind={kind} id={selected} listRow={selectedRow} clock={clock}
            onClose={() => update({ id: "" }, false)}
            onPrevious={() => selectIndex(-1)} onNext={() => selectIndex(1)}
            onOpen={(targetKind, id) => { window.location.assign(`/dashboard/${encodeURIComponent(projectId)}/${KIND_TEXT[targetKind].route}?id=${encodeURIComponent(id)}`); }}
          />
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1F242C] px-4 py-2 text-xs text-[#8B93A1]">
        <span role="status">{loading && data ? "Updating…" : `${total.toLocaleString("en")} ${total === 1 ? text.one : text.many}`}</span>
        <span className="flex items-center gap-2">
          <label htmlFor={`${kind}-size`}>Rows</label>
          <select id={`${kind}-size`} className={control} value={pageSize} onChange={(event) => update({ pageSize: event.target.value })}>
            {[25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <button type="button" className={`${control} disabled:opacity-40`} disabled={page <= 0} onClick={() => update({ page: String(page - 1) }, false)}>Previous</button>
          <span className="font-mono">{page + 1} / {pageCount}</span>
          <button type="button" className={`${control} disabled:opacity-40`} disabled={page + 1 >= pageCount} onClick={() => update({ page: String(page + 1) }, false)}>Next</button>
        </span>
      </footer>
    </div>
  );
}
