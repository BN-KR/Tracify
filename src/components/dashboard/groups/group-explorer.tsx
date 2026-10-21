"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GROUP_SORTS, type GroupKind } from "@/lib/group-filters";
import { RANGES } from "../tracing/time-range-picker";
import { downloadFile, toCsv } from "../tracing/format";
import { readJson } from "@/lib/safe-json";
import { KIND_TEXT } from "./kind-text";
import type { GroupView, ListResponse, Query } from "./group-view";
import { SessionsView } from "./sessions-view";
import { UsersView } from "./users-view";

const LIVE_STORAGE = "tracify.groups.live";
/** URL keys that choose the view, not the data, so they are not sent to the list request. */
const VIEW_KEYS = ["range", "from", "to", "id"];

function currentUrlQuery(): Query {
  if (typeof window === "undefined") return {};
  const query: Query = {};
  for (const [key, value] of new URLSearchParams(window.location.search)) if (value) query[key] = value.slice(0, key === "q" || key === "id" ? 200 : 4096);
  return query;
}

export { KIND_TEXT };

export function GroupExplorer({ projectId, kind, initialQuery, basePath }: { projectId: string; kind: GroupKind; initialQuery: Query; basePath?: string }) {
  const text = KIND_TEXT[kind];
  const [query, setQuery] = useState<Query>(() => ({ range: "30d", ...(kind === "user" ? { sort: "totalCostUsd", dir: "desc" } : {}), ...(typeof window === "undefined" ? initialQuery : currentUrlQuery()) }));
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
  const root = basePath ?? `/dashboard/${encodeURIComponent(projectId)}`;
  const view: GroupView = {
    kind, projectId, basePath: root, query, update, data, rows, stats, total, page, pageSize, pageCount, sort, direction, loading, error, load,
    isLive, fixedWindow: Boolean(query.from || query.to), toggleLive, refresh: () => { setNow(Date.now()); load(); }, exportCsv, now, clock, setNow,
    draft, setDraft, searchRef, filters, clearFilters: () => { setDraft(""); update({ q: "", environment: "", status: "" }); },
    selected, selectedRow: rows.find((row) => row.id === selected) ?? null, fresh, selectIndex,
    open: (targetKind, id) => { window.location.assign(`${root}/${KIND_TEXT[targetKind].route}?id=${encodeURIComponent(id)}`); },
  };
  return kind === "session" ? <SessionsView view={view} /> : <UsersView view={view} />;
}
