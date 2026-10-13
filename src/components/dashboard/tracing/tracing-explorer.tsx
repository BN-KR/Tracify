"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TracePanel } from "./trace-panel";
import { compactNumber, downloadFile, formatCost, formatDuration, formatTime, parseTime, previewText, relativeTime, toCsv } from "./format";

type TraceRow = {
  runId: string; traceName: string; startedAt: string; durationMs: number; spanCount: number; errorCount: number;
  totalCostUsd: number; inputTokens: number; outputTokens: number; modelId: string; endUserId: string;
  sessionId: string; environment: string; release: string; tags: string[]; inputPreview: string; outputPreview: string;
};
type Bucket = { bucket: string; traces: number; errors: number };
type Stats = { traces: number; errors: number; p50DurationMs: number; p95DurationMs: number; totalCostUsd: number; inputTokens: number; outputTokens: number };
type ListResponse = {
  rows: TraceRow[]; total: number; page: number; pageSize: number;
  histogram: { bucketSeconds: number; buckets: Bucket[] }; stats?: Stats; options: Record<string, string[]> | null;
  range: { from: number; to: number }; error?: string;
};

export type TraceQuery = Record<string, string>;

const RANGES = [
  { id: "1h", label: "1h", ms: 3_600_000 },
  { id: "24h", label: "24h", ms: 86_400_000 },
  { id: "7d", label: "7d", ms: 604_800_000 },
  { id: "30d", label: "30d", ms: 2_592_000_000 },
];
const FILTER_FIELDS: Array<{ key: string; label: string }> = [
  { key: "traceName", label: "Trace name" }, { key: "modelId", label: "Model" }, { key: "environment", label: "Environment" },
  { key: "release", label: "Release" }, { key: "endUserId", label: "User" }, { key: "sessionId", label: "Session" }, { key: "tag", label: "Tag" },
];
const COLUMNS = [
  { id: "startedAt", label: "Start time" }, { id: "status", label: "Status" }, { id: "name", label: "Trace name" },
  { id: "input", label: "Input" }, { id: "output", label: "Output" }, { id: "latency", label: "Latency" },
  { id: "cost", label: "Cost" }, { id: "tokens", label: "Tokens" }, { id: "model", label: "Model" },
  { id: "user", label: "User" }, { id: "session", label: "Session" }, { id: "tags", label: "Tags" },
] as const;
type ColumnId = (typeof COLUMNS)[number]["id"];
const DEFAULT_COLUMNS: ColumnId[] = ["startedAt", "status", "name", "input", "output", "latency", "cost", "tokens", "model"];
const COLUMN_STORAGE = "tracify.tracing.columns";
const LIVE_STORAGE = "tracify.tracing.live";

function readColumns(): ColumnId[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(COLUMN_STORAGE) ?? "null");
    if (Array.isArray(stored)) return stored.filter((id): id is ColumnId => COLUMNS.some((column) => column.id === id));
  } catch {}
  return DEFAULT_COLUMNS;
}

export function TracingExplorer({ projectId, initialQuery }: { projectId: string; initialQuery: TraceQuery }) {
  const [query, setQuery] = useState<TraceQuery>(() => ({ range: "24h", ...initialQuery }));
  const [data, setData] = useState<ListResponse | null>(null);
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState(initialQuery.q ?? "");
  const [columns, setColumns] = useState<ColumnId[]>(DEFAULT_COLUMNS);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [live, setLive] = useState(true);
  const [clock, setClock] = useState(() => Date.now());
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = query.trace ?? null;
  const requestId = useRef(0);

  // Column choice lives in this browser's storage, which only exists after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setColumns(readColumns()); }, []);
  // Phones start with the filter sidebar collapsed so the traces are visible first.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (window.matchMedia("(max-width: 767px)").matches) setFiltersOpen(false); }, []);
  // The live/paused choice is remembered per browser.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { try { if (window.localStorage.getItem(LIVE_STORAGE) === "paused") setLive(false); } catch {} }, []);
  // Relative start times ("2m ago") stay correct between data refreshes.
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 10_000); return () => clearInterval(timer); }, []);

  const update = useCallback((patch: TraceQuery, resetPage = true) => {
    setQuery((current) => {
      const next: TraceQuery = { ...current, ...patch };
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
    params.set("from", query.from ?? String(to - (range?.ms ?? 86_400_000)));
    for (const [key, value] of Object.entries(query)) {
      if (!["range", "from", "to", "trace"].includes(key)) params.set(key, value);
    }
    return params;
  }, [query, now]);
  const requestKey = apiParams.toString();
  const loading = settledKey !== requestKey;
  const optionsKey = `${query.range ?? ""}|${query.from ?? ""}|${query.to ?? ""}`;
  const loadedOptionsKey = useRef<string | null>(null);

  useEffect(() => {
    const id = ++requestId.current;
    const params = new URLSearchParams(apiParams);
    const wantOptions = loadedOptionsKey.current !== optionsKey;
    if (wantOptions) params.set("options", "1");
    fetch(`/api/projects/${encodeURIComponent(projectId)}/traces?${params}`, { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as ListResponse;
        if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
        return body;
      })
      .then((body) => {
        if (id !== requestId.current) return;
        setData(body);
        setError(null);
        setSettledKey(requestKey);
        if (body.options) { setOptions(body.options); loadedOptionsKey.current = optionsKey; }
      })
      .catch((reason: unknown) => {
        if (id !== requestId.current) return;
        setError(reason instanceof Error ? reason.message : "Could not load traces");
        setSettledKey(requestKey);
      });
  }, [apiParams, optionsKey, projectId, requestKey]);

  // Live updates: for relative ranges, quietly refetch the list with the window moved forward so new traces
  // appear without pressing Refresh. Skipped for fixed from/to windows, hidden tabs, and while a load is pending.
  useEffect(() => {
    if (!live || query.from || query.to) return;
    const rangeMs = RANGES.find((item) => item.id === query.range)?.ms ?? 86_400_000;
    const timer = setInterval(() => {
      if (document.hidden || settledKey !== requestKey) return;
      const issued = requestId.current;
      const params = new URLSearchParams(apiParams);
      const to = Date.now();
      params.set("to", String(to));
      params.set("from", String(to - rangeMs));
      fetch(`/api/projects/${encodeURIComponent(projectId)}/traces?${params}`, { cache: "no-store" })
        .then(async (response) => (response.ok ? ((await response.json()) as ListResponse) : null))
        .then((body) => {
          if (!body || issued !== requestId.current) return;
          setData((current) => {
            // Only rows that arrive through a live poll are highlighted, never a whole new filter result.
            const known = new Set((current?.rows ?? []).map((row) => row.runId));
            const added = current ? body.rows.map((row) => row.runId).filter((id) => !known.has(id)) : [];
            if (added.length) setFresh(new Set(added));
            return { ...body, options: current?.options ?? body.options };
          });
        })
        .catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [apiParams, live, projectId, query.from, query.range, query.to, requestKey, settledKey]);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const stats = data?.stats;

  useEffect(() => {
    if (!fresh.size) return;
    const timer = setTimeout(() => setFresh(new Set()), 2500);
    return () => clearTimeout(timer);
  }, [fresh]);
  const isLive = live && !query.from && !query.to;

  const total = data?.total ?? 0;
  const page = Number(query.page ?? 0);
  const pageSize = Number(query.pageSize ?? 50);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const selectIndex = useCallback((delta: number) => {
    if (!rows.length) return;
    const index = rows.findIndex((row) => row.runId === selected);
    const next = rows[Math.min(Math.max(index + delta, 0), rows.length - 1)] ?? rows[0];
    update({ trace: next.runId }, false);
  }, [rows, selected, update]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "/") { event.preventDefault(); searchRef.current?.focus(); return; }
      if (event.key === "Escape" && selected) update({ trace: "" }, false);
      if (event.key === "ArrowDown" || event.key === "j") { event.preventDefault(); selectIndex(1); }
      if (event.key === "ArrowUp" || event.key === "k") { event.preventDefault(); selectIndex(-1); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectIndex, selected, update]);

  function toggleColumn(id: ColumnId) {
    const next = columns.includes(id) ? columns.filter((column) => column !== id) : COLUMNS.map((c) => c.id).filter((c) => c === id || columns.includes(c));
    setColumns(next);
    try { window.localStorage.setItem(COLUMN_STORAGE, JSON.stringify(next)); } catch {}
  }

  function toggleLive() {
    const next = !live;
    setLive(next);
    if (next) setNow(Date.now());
    try { window.localStorage.setItem(LIVE_STORAGE, next ? "live" : "paused"); } catch {}
  }

  function exportCsv() {
    const header = ["trace_id", "start_time_utc", "trace_name", "status", "errors", "latency_ms", "cost_usd", "input_tokens", "output_tokens", "model", "user", "session", "environment", "release", "tags", "input", "output"];
    const body = rows.map((row) => [
      row.runId, new Date(parseTime(row.startedAt)).toISOString(), row.traceName, Number(row.errorCount) > 0 ? "error" : "ok", Number(row.errorCount),
      Number(row.durationMs), Number(row.totalCostUsd), Number(row.inputTokens), Number(row.outputTokens), row.modelId, row.endUserId,
      row.sessionId, row.environment, row.release, (row.tags ?? []).join(" "), previewText(row.inputPreview), previewText(row.outputPreview),
    ]);
    downloadFile(`traces-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`, toCsv(header, body), "text/csv;charset=utf-8");
  }

  function sortBy(sort: string) {
    const current = query.sort ?? "startedAt";
    update({ sort, dir: current === sort && (query.dir ?? "desc") === "desc" ? "asc" : "desc" });
  }

  const activeFilters = [
    ...FILTER_FIELDS.filter((field) => query[field.key]).map((field) => ({ key: field.key, label: `${field.label}: ${query[field.key]}` })),
    ...(query.status && query.status !== "all" ? [{ key: "status", label: query.status === "error" ? "Errors only" : "Healthy only" }] : []),
    ...(query.minLatencyMs ? [{ key: "minLatencyMs", label: `Latency ≥ ${formatDuration(Number(query.minLatencyMs))}` }] : []),
    ...(query.minCostUsd ? [{ key: "minCostUsd", label: `Cost ≥ ${formatCost(Number(query.minCostUsd))}` }] : []),
  ];

  return (
    <div className="flex min-h-svh flex-col bg-[#0B0D10] text-[#E6E9EE]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#1F242C] px-5 py-4">
        <h1 className="mr-2 text-xl font-semibold tracking-tight">Tracing</h1>
        <form
          className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#262C35] bg-[#111418] px-3 focus-within:border-[#4A5260]"
          onSubmit={(event) => { event.preventDefault(); update({ q: searchDraft.trim() }); }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 text-[#8B93A1]" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <label htmlFor="trace-search" className="sr-only">Search traces</label>
          <input
            id="trace-search" ref={searchRef} value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search name, id, input or output"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#6B7380]"
          />
          {query.q ? <button type="button" className="text-xs text-[#8B93A1] hover:text-white" onClick={() => { setSearchDraft(""); update({ q: "" }); }}>Clear</button> : <kbd className="hidden rounded border border-[#262C35] px-1.5 font-mono text-[10px] text-[#6B7380] sm:block" aria-hidden="true">/</kbd>}
        </form>
        <div role="group" aria-label="Time range" className="flex rounded-lg border border-[#262C35] bg-[#111418] p-1">
          {RANGES.map((range) => {
            const active = !query.from && (query.range ?? "24h") === range.id;
            return (
              <button key={range.id} type="button" aria-pressed={active}
                onClick={() => { setNow(Date.now()); update({ range: range.id, from: "", to: "" }); }}
                className={`h-8 min-w-11 rounded-md px-3 font-mono text-xs ${active ? "bg-[#F4D44D] text-[#0B0D10]" : "text-[#8B93A1] hover:text-white"}`}
              >{range.label}</button>
            );
          })}
          {query.from ? <button type="button" onClick={() => update({ from: "", to: "" })} className="h-8 rounded-md bg-[#F4D44D] px-3 font-mono text-xs text-[#0B0D10]">Zoomed · reset</button> : null}
        </div>
        <button type="button" aria-pressed={isLive} onClick={toggleLive} disabled={Boolean(query.from || query.to)}
          title={query.from || query.to ? "Live updates are off while zoomed to a fixed window" : isLive ? "New traces appear automatically. Click to pause." : "Paused. Click to resume live updates."}
          className="flex h-10 items-center gap-2 rounded-lg border border-[#262C35] px-3 text-sm text-[#C9CED6] hover:border-[#4A5260] disabled:opacity-50">
          <span aria-hidden="true" className={`size-2 rounded-full ${isLive ? "animate-pulse bg-[#5BE3A0]" : "bg-[#6B7380]"}`} />{isLive ? "Live" : "Paused"}
        </button>
        <button type="button" onClick={() => setNow(Date.now())} className="h-10 rounded-lg border border-[#262C35] px-3 text-sm text-[#C9CED6] hover:border-[#4A5260]">Refresh</button>
      </header>

      <div className="flex min-h-0 flex-1 flex-wrap">
        {filtersOpen ? (
          <aside aria-label="Filters" className="w-full shrink-0 border-b border-[#1F242C] p-4 md:w-64 md:border-b-0 md:border-r">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Filters</span>
              <button type="button" className="text-xs text-[#8B93A1] hover:text-white" onClick={() => setFiltersOpen(false)}>Hide</button>
            </div>
            <FilterSelect label="Status" value={query.status ?? "all"} values={["all", "error", "healthy"]} display={{ all: "All", error: "Errors", healthy: "Healthy" }} onChange={(value) => update({ status: value === "all" ? "" : value })} />
            {FILTER_FIELDS.map((field) => (
              <FilterSelect key={field.key} label={field.label} value={query[field.key] ?? ""} values={["", ...(options[field.key] ?? [])]} display={{ "": "Any" }} onChange={(value) => update({ [field.key]: value })} />
            ))}
            <FilterNumber key={`lat-${query.minLatencyMs ?? ""}`} label="Min latency (ms)" value={query.minLatencyMs ?? ""} onChange={(value) => update({ minLatencyMs: value })} />
            <FilterNumber key={`cost-${query.minCostUsd ?? ""}`} label="Min cost (USD)" value={query.minCostUsd ?? ""} step="0.001" onChange={(value) => update({ minCostUsd: value })} />
          </aside>
        ) : null}

        <section className="flex min-w-0 flex-[999_1_560px] flex-col">
          <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
            {!filtersOpen ? <button type="button" onClick={() => setFiltersOpen(true)} className="h-8 rounded-md border border-[#262C35] px-3 text-xs text-[#C9CED6] hover:border-[#4A5260]">Show filters</button> : null}
            {activeFilters.map((filter) => (
              <button key={filter.key} type="button" onClick={() => update({ [filter.key]: "" })} className="flex h-8 items-center gap-2 rounded-md bg-[#1A1F27] px-3 text-xs text-[#E6E9EE] hover:bg-[#232A34]" aria-label={`Remove filter ${filter.label}`}>
                {filter.label}<span aria-hidden="true" className="text-[#8B93A1]">×</span>
              </button>
            ))}
            {activeFilters.length ? <button type="button" className="text-xs text-[#8B93A1] hover:text-white" onClick={() => update(Object.fromEntries(activeFilters.map((f) => [f.key, ""])))}>Clear all</button> : null}
            <button type="button" onClick={exportCsv} disabled={!rows.length} className="ml-auto h-8 rounded-md border border-[#262C35] px-3 text-xs text-[#C9CED6] hover:border-[#4A5260] disabled:opacity-40" title="Download the traces on this page as CSV">Export CSV</button>
            <div className="relative">
              <button type="button" aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)} className="h-8 rounded-md border border-[#262C35] px-3 text-xs text-[#C9CED6] hover:border-[#4A5260]">Columns {columns.length}/{COLUMNS.length}</button>
              {columnsOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-[#262C35] bg-[#111418] p-2 shadow-2xl">
                  {COLUMNS.map((column) => (
                    <label key={column.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[#1A1F27]">
                      <input type="checkbox" checked={columns.includes(column.id)} onChange={() => toggleColumn(column.id)} className="accent-[#F4D44D]" />{column.label}
                    </label>
                  ))}
                  <button type="button" className="mt-1 w-full rounded px-2 py-1.5 text-left text-xs text-[#8B93A1] hover:bg-[#1A1F27]" onClick={() => { setColumns(DEFAULT_COLUMNS); try { window.localStorage.removeItem(COLUMN_STORAGE); } catch {} }}>Reset to default</button>
                </div>
              ) : null}
            </div>
          </div>

          <StatsStrip stats={stats} loading={!data} onErrors={() => update({ status: "error" })} />

          <CountChart histogram={data?.histogram} onZoom={(from, to) => update({ from: String(from), to: String(to) })} />

          <div className="min-h-0 flex-1 overflow-auto px-5">
            {error ? (
              <div role="alert" className="my-6 rounded-lg border border-[#5A2A2A] bg-[#1E1314] p-4 text-sm">
                <p className="font-medium text-[#FF8A8A]">{error}</p>
                <button type="button" className="mt-3 rounded-md border border-[#5A2A2A] px-3 py-1.5 text-xs hover:bg-[#2A1A1C]" onClick={() => setNow(Date.now())}>Try again</button>
              </div>
            ) : !loading && rows.length === 0 ? (
              <div className="my-10 rounded-lg border border-dashed border-[#262C35] p-8 text-center">
                <p className="font-medium">No traces in this range</p>
                <p className="mt-2 text-sm text-[#8B93A1]">{activeFilters.length || query.q ? "Try removing a filter or widening the time range." : "Send traces with the Tracify SDK and they appear here within seconds."}</p>
                {activeFilters.length || query.q ? <button type="button" className="mt-4 rounded-md bg-[#F4D44D] px-4 py-2 text-sm font-medium text-[#0B0D10]" onClick={() => { setSearchDraft(""); update({ ...Object.fromEntries(activeFilters.map((f) => [f.key, ""])), q: "", range: "30d" }); }}>Clear filters and show 30 days</button> : <a className="mt-4 inline-block rounded-md bg-[#F4D44D] px-4 py-2 text-sm font-medium text-[#0B0D10]" href={`/dashboard/${projectId}/quickstart`}>Open quickstart</a>}
              </div>
            ) : (
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 z-10 bg-[#0B0D10]">
                  <tr className="text-left text-xs text-[#8B93A1]">
                    {columns.map((id) => {
                      const label = COLUMNS.find((column) => column.id === id)!.label;
                      const sortKey = id === "startedAt" ? "startedAt" : id === "latency" ? "latency" : id === "cost" ? "cost" : null;
                      const active = sortKey && (query.sort ?? "startedAt") === sortKey;
                      return (
                        <th key={id} scope="col" className="border-b border-[#1F242C] px-3 py-2.5 font-medium" aria-sort={active ? ((query.dir ?? "desc") === "asc" ? "ascending" : "descending") : undefined}>
                          {sortKey ? <button type="button" onClick={() => sortBy(sortKey)} className={`flex items-center gap-1 hover:text-white ${active ? "text-white" : ""}`}>{label}<span aria-hidden="true">{active ? ((query.dir ?? "desc") === "asc" ? "↑" : "↓") : "↕"}</span></button> : label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className={loading ? "opacity-60" : ""}>
                  {rows.map((row) => (
                    <tr key={row.runId} aria-selected={selected === row.runId}
                      className={`cursor-pointer transition-colors duration-700 ${selected === row.runId ? "bg-[#161B22] shadow-[inset_3px_0_0_#F4D44D]" : fresh.has(row.runId) ? "bg-[#1F2A1F]" : "hover:bg-[#12161C]"}`}
                      onClick={() => update({ trace: row.runId }, false)}>
                      {columns.map((id) => <td key={id} className="max-w-[320px] truncate border-b border-[#171B21] px-3 py-2.5 align-middle">{cell(id, row, update, clock)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1F242C] px-5 py-3 text-sm text-[#8B93A1]">
            <span>{loading ? "Loading…" : `${compactNumber(total)} traces`}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">Rows
                <select value={pageSize} onChange={(event) => update({ pageSize: event.target.value })} className="h-8 rounded-md border border-[#262C35] bg-[#111418] px-2 text-[#E6E9EE]">
                  {[25, 50, 100, 200].map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
              <span>Page {page + 1} of {pageCount}</span>
              <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => update({ page: String(page - 1) }, false)} className="h-8 w-8 rounded-md border border-[#262C35] disabled:opacity-40">‹</button>
              <button type="button" aria-label="Next page" disabled={page + 1 >= pageCount} onClick={() => update({ page: String(page + 1) }, false)} className="h-8 w-8 rounded-md border border-[#262C35] disabled:opacity-40">›</button>
            </div>
          </footer>
        </section>

        {selected ? (
          <TracePanel
            key={selected} projectId={projectId} runId={selected}
            summary={rows.find((row) => row.runId === selected)}
            onClose={() => update({ trace: "" }, false)}
            onFilter={(key, value) => update({ [key]: value, trace: "" })}
            onStep={selectIndex}
          />
        ) : null}
      </div>
    </div>
  );
}

function cell(id: ColumnId, row: TraceRow, update: (patch: TraceQuery, resetPage?: boolean) => void, clock: number) {
  const link = (key: string, value: string) => value
    ? <button type="button" className="truncate text-[#8AB4FF] hover:underline" onClick={(event) => { event.stopPropagation(); update({ [key]: value }); }}>{value}</button>
    : <span className="text-[#4A5260]">—</span>;
  switch (id) {
    case "startedAt": return <time dateTime={new Date(parseTime(row.startedAt)).toISOString()} title={formatTime(row.startedAt)} className="font-mono text-xs text-[#C9CED6]">{relativeTime(row.startedAt, clock)}</time>;
    case "status": return Number(row.errorCount) > 0
      ? <span className="rounded bg-[#3A1C1F] px-2 py-0.5 font-mono text-xs text-[#FF8A8A]">{Number(row.errorCount)} error{Number(row.errorCount) === 1 ? "" : "s"}</span>
      : <span className="rounded bg-[#15301F] px-2 py-0.5 font-mono text-xs text-[#5BE3A0]">ok</span>;
    case "name": return <span className="font-medium">{row.traceName || <span className="font-mono text-xs text-[#8B93A1]">{row.runId.slice(0, 12)}</span>}</span>;
    case "input": return <span className="text-[#C9CED6]">{previewText(row.inputPreview) || <span className="text-[#4A5260]">—</span>}</span>;
    case "output": return <span className="text-[#C9CED6]">{previewText(row.outputPreview) || <span className="text-[#4A5260]">—</span>}</span>;
    case "latency": return <span className="font-mono text-xs">{formatDuration(row.durationMs)}</span>;
    case "cost": return <span className="font-mono text-xs">{formatCost(row.totalCostUsd)}</span>;
    case "tokens": return <span className="font-mono text-xs text-[#C9CED6]">{compactNumber(Number(row.inputTokens) + Number(row.outputTokens))}</span>;
    case "model": return link("modelId", row.modelId);
    case "user": return link("endUserId", row.endUserId);
    case "session": return link("sessionId", row.sessionId);
    case "tags": return row.tags?.length ? <span className="flex gap-1">{row.tags.slice(0, 3).map((tag) => <button key={tag} type="button" onClick={(event) => { event.stopPropagation(); update({ tag }); }} className="rounded bg-[#1A1F27] px-1.5 py-0.5 text-xs hover:bg-[#232A34]">{tag}</button>)}</span> : <span className="text-[#4A5260]">—</span>;
  }
}

function FilterSelect({ label, value, values, display, onChange }: { label: string; value: string; values: string[]; display?: Record<string, string>; onChange: (value: string) => void }) {
  const id = `filter-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1 block text-xs text-[#8B93A1]">{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-[#262C35] bg-[#111418] px-2 text-sm text-[#E6E9EE] outline-none focus:border-[#4A5260]">
        {[...new Set([...values, value])].map((option) => <option key={option} value={option}>{display?.[option] ?? (option || "Any")}</option>)}
      </select>
    </div>
  );
}

function FilterNumber({ label, value, step = "1", onChange }: { label: string; value: string; step?: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const id = `filter-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1 block text-xs text-[#8B93A1]">{label}</label>
      <input id={id} type="number" min="0" step={step} value={draft} onChange={(event) => setDraft(event.target.value)}
        onBlur={() => draft !== value && onChange(draft)} onKeyDown={(event) => { if (event.key === "Enter") onChange(draft); }}
        className="h-9 w-full rounded-md border border-[#262C35] bg-[#111418] px-2 text-sm text-[#E6E9EE] outline-none focus:border-[#4A5260]" placeholder="Any" />
    </div>
  );
}

function CountChart({ histogram, onZoom }: { histogram?: { bucketSeconds: number; buckets: Bucket[] }; onZoom: (from: number, to: number) => void }) {
  const buckets = histogram?.buckets ?? [];
  const max = Math.max(1, ...buckets.map((bucket) => bucket.traces));
  return (
    <div className="px-5 py-4">
      <div className="mb-2 flex items-center justify-between text-xs text-[#8B93A1]">
        <span>Traces over time{buckets.length ? " · click a bar to zoom" : ""}</span>
        <span className="flex items-center gap-3"><span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#F4D44D]" />traces</span><span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#FF6B6B]" />with errors</span></span>
      </div>
      <div className="flex h-20 items-end gap-[2px] rounded-lg border border-[#1F242C] bg-[#0E1115] px-2 pt-2">
        {buckets.length === 0 ? <span className="m-auto text-xs text-[#4A5260]">No traces to chart</span> : buckets.map((bucket) => {
          const start = Date.parse(bucket.bucket.replace(" ", "T") + "Z");
          const label = `${formatTime(new Date(start).toISOString())}: ${bucket.traces} traces, ${bucket.errors} with errors`;
          return (
            <button key={bucket.bucket} type="button" title={label} aria-label={label}
              onClick={() => onZoom(start, start + (histogram?.bucketSeconds ?? 60) * 1000)}
              className="group relative flex h-full min-w-[4px] flex-1 flex-col justify-end">
              <span className="w-full rounded-t-sm bg-[#F4D44D] group-hover:bg-[#FFE680]" style={{ height: `${Math.max(4, (bucket.traces / max) * 100)}%` }}>
                {bucket.errors ? <span className="block w-full rounded-t-sm bg-[#FF6B6B]" style={{ height: `${(bucket.errors / bucket.traces) * 100}%` }} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatsStrip({ stats, loading, onErrors }: { stats?: Stats; loading: boolean; onErrors: () => void }) {
  const errorRate = stats?.traces ? stats.errors / stats.traces : 0;
  const tiles: Array<{ label: string; value: string; hint?: string; tone?: string; onClick?: () => void }> = [
    { label: "Traces", value: stats ? compactNumber(stats.traces) : "—" },
    { label: "Error rate", value: stats ? `${(errorRate * 100).toFixed(errorRate && errorRate < 0.1 ? 1 : 0)}%` : "—", hint: stats ? `${compactNumber(stats.errors)} with errors` : undefined, tone: errorRate > 0 ? "text-[#FF8A8A]" : undefined, onClick: stats?.errors ? onErrors : undefined },
    { label: "Latency p50", value: stats ? formatDuration(stats.p50DurationMs) : "—" },
    { label: "Latency p95", value: stats ? formatDuration(stats.p95DurationMs) : "—" },
    { label: "Total cost", value: stats ? formatCost(stats.totalCostUsd) : "—", hint: stats?.traces ? `${formatCost(stats.totalCostUsd / stats.traces)} per trace` : undefined },
    { label: "Tokens", value: stats ? compactNumber(stats.inputTokens + stats.outputTokens) : "—", hint: stats ? `${compactNumber(stats.inputTokens)} in · ${compactNumber(stats.outputTokens)} out` : undefined },
  ];
  return (
    <section aria-label="Summary for this range" aria-busy={loading} className="mx-5 mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#1F242C] bg-[#1F242C] sm:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => {
        const body = (
          <>
            <span className="block text-xs text-[#8B93A1]">{tile.label}</span>
            <span className={`mt-1 block font-mono text-lg leading-6 ${tile.tone ?? "text-[#E6E9EE]"}`}>{tile.value}</span>
            {tile.hint ? <span className="mt-0.5 block truncate font-mono text-[11px] text-[#6B7380]">{tile.hint}</span> : null}
          </>
        );
        return tile.onClick ? (
          <button key={tile.label} type="button" onClick={tile.onClick} title="Show only traces with errors" className="min-w-0 bg-[#0E1115] px-4 py-3 text-left hover:bg-[#12161C]">{body}</button>
        ) : (
          <div key={tile.label} className="min-w-0 bg-[#0E1115] px-4 py-3">{body}</div>
        );
      })}
    </section>
  );
}
