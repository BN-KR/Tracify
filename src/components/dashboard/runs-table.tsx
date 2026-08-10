"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Clock, Download, Search, X, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CancelRunButton } from "./cancel-run-button";
import { useNow } from "@/hooks/use-now";
import { DashboardEmptyState } from "./dashboard-primitives";
import type { SavedRunView } from "./dashboard-contracts";

interface RunsTableProps {
  projectId: string;
}

export function RunsTable({ projectId }: RunsTableProps) {
  const now = useNow(1000);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("status") ?? "all");
  const [sort, setSort] = useState(() => searchParams.get("sort") ?? "newest");
  const [modelFilter, setModelFilter] = useState(() => searchParams.get("model") ?? "");
  const [sessionFilter, setSessionFilter] = useState(() => searchParams.get("session") ?? "");
  const [environmentFilter, setEnvironmentFilter] = useState(() => searchParams.get("environment") ?? "");
  const [releaseFilter, setReleaseFilter] = useState(() => searchParams.get("release") ?? "");
  const [minCost, setMinCost] = useState(() => searchParams.get("minCost") ?? "");
  const [minSpans, setMinSpans] = useState(() => searchParams.get("minSpans") ?? "");
  const [days, setDays] = useState(() => searchParams.get("days") ?? "30");
  const [startedAtAfter, setStartedAtAfter] = useState(() => new Date(Date.now() - Math.max(1, Number(searchParams.get("days") ?? "30")) * 86400000).toISOString());
  const [selectedRunIds, setSelectedRunIds] = useState<Set<string>>(new Set());
  const initialPageSize = [10, 25, 50].includes(Number(searchParams.get("limit"))) ? Number(searchParams.get("limit")) : 10;
  const initialPageIndex = Math.max(0, Number(searchParams.get("page") || "1") - 1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pendingNextPage, setPendingNextPage] = useState(false);
  const [savedViews, setSavedViews] = useState<SavedRunView[]>([]);
  const didMount = useRef(false);

  const savedViewsKey = `tracify.saved-run-views.${projectId}`;

  const updateQuery = useCallback((next: { q?: string; status?: string; page?: number; limit?: number; sort?: string; model?: string; session?: string; environment?: string; release?: string; minCost?: string; minSpans?: string; days?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q?.trim()) params.set("q", next.q.trim());
    else params.delete("q");
    if (next.status && next.status !== "all") params.set("status", next.status);
    else params.delete("status");
    if (next.page && next.page > 1) params.set("page", String(next.page));
    else params.delete("page");
    if (next.limit && next.limit !== 10) params.set("limit", String(next.limit));
    else params.delete("limit");
    if (next.sort !== undefined && next.sort !== "newest") params.set("sort", next.sort);
    else if (next.sort !== undefined) params.delete("sort");
    if (next.model !== undefined) {
      if (next.model.trim()) params.set("model", next.model.trim());
      else params.delete("model");
    }
    if (next.session !== undefined) {
      if (next.session.trim()) params.set("session", next.session.trim());
      else params.delete("session");
    }
    if (next.environment !== undefined) {
      if (next.environment.trim()) params.set("environment", next.environment.trim());
      else params.delete("environment");
    }
    if (next.release !== undefined) {
      if (next.release.trim()) params.set("release", next.release.trim());
      else params.delete("release");
    }
    if (next.minCost !== undefined) {
      if (next.minCost.trim()) params.set("minCost", next.minCost.trim());
      else params.delete("minCost");
    }
    if (next.minSpans !== undefined) {
      if (next.minSpans.trim()) params.set("minSpans", next.minSpans.trim());
      else params.delete("minSpans");
    }
    if (next.days !== undefined) {
      if (next.days !== "30") params.set("days", next.days);
      else params.delete("days");
    }
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [pathname, router, searchParams]);
  const runsPage = usePaginatedQuery(
    api.agentRuns.getRunsPageByProject,
    projectId
      ? {
          projectId: projectId as Id<"projects">,
          status: statusFilter as
            | "all"
            | "running"
            | "completed"
            | "failed"
            | "cancelled",
          primaryModel: modelFilter.trim() || undefined,
          sessionId: sessionFilter.trim() || undefined,
          environment: environmentFilter.trim() || undefined,
          release: releaseFilter.trim() || undefined,
          startedAtAfter,
          minCostUsd: Number.isFinite(Number(minCost)) && minCost.trim() ? Number(minCost) : undefined,
          minSpanCount: Number.isFinite(Number(minSpans)) && minSpans.trim() ? Number(minSpans) : undefined,
        }
      : "skip",
    { initialNumItems: pageSize },
  );
  const runCounts = useQuery(
    api.agentRuns.getRunCountsByProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const exactRun = useQuery(
    api.agentRuns.getByRunIdForViewer,
    projectId && search.trim()
      ? {
          projectId: projectId as Id<"projects">,
          runId: search.trim(),
        }
      : "skip",
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(savedViewsKey) ?? "[]") as SavedRunView[];
      setSavedViews(Array.isArray(parsed) ? parsed.slice(0, 12).map((view) => ({ ...view, days: view.days ?? "30" })) : []);
    } catch {
      setSavedViews([]);
    }
  }, [savedViewsKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function persistSavedViews(next: SavedRunView[]) {
    setSavedViews(next);
    window.localStorage.setItem(savedViewsKey, JSON.stringify(next));
  }

  function saveCurrentView() {
    const name = window.prompt("Name this run view");
    if (!name?.trim()) return;
    const nextView: SavedRunView = {
      id: crypto.randomUUID(),
      name: name.trim(),
      q: search,
      status: statusFilter,
      sort,
      model: modelFilter,
      session: sessionFilter,
      environment: environmentFilter,
      release: releaseFilter,
      minCost,
      minSpans,
      days,
      limit: pageSize,
    };
    persistSavedViews([nextView, ...savedViews.filter((view) => view.name !== nextView.name)].slice(0, 12));
  }

  function restoreView(view: SavedRunView) {
    setSearch(view.q);
    setStatusFilter(view.status);
    setSort(view.sort);
    setModelFilter(view.model);
    setSessionFilter(view.session);
    setEnvironmentFilter(view.environment);
    setReleaseFilter(view.release);
    setMinCost(view.minCost);
    setMinSpans(view.minSpans);
    setDays(view.days ?? "30");
    // eslint-disable-next-line react-hooks/purity
    setStartedAtAfter(new Date(Date.now() - Math.max(1, Number(view.days ?? "30")) * 86400000).toISOString());
    setPageSize(view.limit);
    setPageIndex(0);
    updateQuery({ q: view.q, status: view.status, sort: view.sort, model: view.model, session: view.session, environment: view.environment, release: view.release, minCost: view.minCost, minSpans: view.minSpans, days: view.days ?? "30", page: 1, limit: view.limit });
  }

  // Pagination state resets when the query controls change.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    setPageIndex(0);
    setPendingNextPage(false);
  }, [pageSize, statusFilter, search, sort, modelFilter, sessionFilter, environmentFilter, releaseFilter, minCost, minSpans, days, startedAtAfter, updateQuery]);

  // Advance after Convex has loaded the requested page.
  useEffect(() => {
    if (!pendingNextPage) return;
    const nextPageStart = (pageIndex + 1) * pageSize;
    if (runsPage.results.length > nextPageStart || runsPage.status === "Exhausted") {
      const nextPage = pageIndex + 1;
      setPageIndex(nextPage);
      updateQuery({ q: search, status: statusFilter, page: nextPage + 1, limit: pageSize });
      setPendingNextPage(false);
    }
  }, [pageIndex, pageSize, pendingNextPage, runsPage.results.length, runsPage.status, search, statusFilter, updateQuery]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (runsPage.status === "LoadingFirstPage") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-none" />
        {Array.from({ length: pageSize }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </div>
    );
  }

  const loadedMatches = runsPage.results.filter((run) => {
    const matchesSearch = run.runId.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });
  const exactRunMatchesStatus =
    exactRun &&
    (statusFilter === "all" || exactRun.status === statusFilter) &&
    !loadedMatches.some((run) => run._id === exactRun._id);
  const filteredRuns = exactRunMatchesStatus
    ? [exactRun, ...loadedMatches]
    : loadedMatches;
  const sortedRuns = [...filteredRuns].sort((left, right) => {
    if (sort === "cost") return right.totalCostUsd - left.totalCostUsd;
    if (sort === "spans") return right.spanCount - left.spanCount;
    if (sort === "duration") {
      const leftDuration = left.finishedAt ? new Date(left.finishedAt).getTime() - new Date(left.startedAt).getTime() : now - new Date(left.startedAt).getTime();
      const rightDuration = right.finishedAt ? new Date(right.finishedAt).getTime() - new Date(right.startedAt).getTime() : now - new Date(right.startedAt).getTime();
      return rightDuration - leftDuration;
    }
    return new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime();
  });
  const totalLoadedPages = Math.max(1, Math.ceil(sortedRuns.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, totalLoadedPages - 1);
  const visibleRuns = sortedRuns.slice(
    currentPageIndex * pageSize,
    currentPageIndex * pageSize + pageSize,
  );
  const canGoPrevious = currentPageIndex > 0;
  const hasLoadedNextPage = sortedRuns.length > (currentPageIndex + 1) * pageSize;
  const canLoadNextPage = runsPage.status === "CanLoadMore";
  const canGoNext = hasLoadedNextPage || canLoadNextPage;
  const totalRunsForStatus =
    runCounts?.[statusFilter as keyof Omit<typeof runCounts, "capped">] ?? null;
  const totalPages =
    typeof totalRunsForStatus === "number"
      ? Math.max(1, Math.ceil(totalRunsForStatus / pageSize))
      : null;

  function handleNextPage() {
    if (hasLoadedNextPage) {
      const nextPage = currentPageIndex + 1;
      setPageIndex(nextPage);
      updateQuery({ q: search, status: statusFilter, page: nextPage + 1, limit: pageSize });
      return;
    }

    if (runsPage.status === "CanLoadMore") {
      setPendingNextPage(true);
      runsPage.loadMore(pageSize);
    }
  }

  const visibleRunIds = visibleRuns.map((run) => run._id);
  const allVisibleSelected = visibleRunIds.length > 0 && visibleRunIds.every((id) => selectedRunIds.has(id));

  function toggleVisibleSelection() {
    setSelectedRunIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleRunIds.forEach((id) => next.delete(id));
      else visibleRunIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function exportSelectedRuns() {
    const selected = visibleRuns.filter((run) => selectedRunIds.has(run._id));
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["run_id", "status", "model", "session_id", "spans", "cost_usd", "started_at"],
      ...selected.map((run) => [run.runId, run.status, run.primaryModel ?? "", run.sessionId ?? "", run.spanCount, run.totalCostUsd, run.startedAt]),
    ];
    const csv = rows.map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tracify-runs-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2">
          {["all", "running", "completed", "failed", "cancelled"].map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={statusFilter === status}
              onClick={() => {
                setStatusFilter(status);
                updateQuery({ q: search, status, limit: pageSize });
              }}
              className={cn(
                "border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                statusFilter === status 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-500"
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Views</span>
          {[
            ["newest", "Newest"],
            ["cost", "Most expensive"],
            ["duration", "Slowest"],
            ["spans", "Most spans"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={sort === value}
              onClick={() => {
                setSort(value);
                setPageIndex(0);
                updateQuery({ q: search, status: statusFilter, sort: value, limit: pageSize });
              }}
              className={cn(
                "border px-2 py-1 font-mono text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                sort === value
                  ? "border-white bg-white text-black"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={saveCurrentView}
            className="border border-dashed border-zinc-700 px-2 py-1 font-mono text-[10px] text-zinc-400 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Save view
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
          <Input 
            placeholder="Search run ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateQuery({ q: e.target.value, status: statusFilter, limit: pageSize });
            }}
            className="pl-9 h-9 rounded-none border-zinc-800 bg-black font-mono text-[11px] placeholder:text-zinc-700"
          />
          {search.trim() ? (
            <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
              Exact run ID lookup searches all saved runs
            </div>
          ) : null}
        </div>
      </div>

      {savedViews.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border border-border bg-muted/5 px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Saved</span>
          {savedViews.map((view) => (
            <div key={view.id} className="flex items-center border border-zinc-800 bg-black">
              <button
                type="button"
                onClick={() => restoreView(view)}
                className="px-2 py-1 font-mono text-[10px] text-zinc-300 transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
              >
                {view.name}
              </button>
              <button
                type="button"
                aria-label={`Delete saved view ${view.name}`}
                onClick={() => persistSavedViews(savedViews.filter((savedView) => savedView.id !== view.id))}
                className="border-l border-zinc-800 px-1.5 py-1 text-zinc-600 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border border-border bg-muted/10 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            rows
          </span>
          {[10, 25, 50].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setPageSize(size);
                setPageIndex(0);
                updateQuery({ q: search, status: statusFilter, limit: size });
              }}
              className={cn(
                "h-8 border px-3 font-mono text-[11px] transition-colors",
                pageSize === size
                  ? "border-white bg-white text-black"
                  : "border-zinc-800 bg-black text-zinc-500 hover:border-zinc-500 hover:text-white",
              )}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <button
            type="button"
            onClick={() => {
              const nextPage = Math.max(0, currentPageIndex - 1);
              setPageIndex(nextPage);
              updateQuery({ q: search, status: statusFilter, page: nextPage + 1, limit: pageSize });
            }}
            disabled={!canGoPrevious}
            className="flex h-8 items-center gap-2 border border-zinc-800 bg-black px-3 font-mono text-[11px] uppercase text-zinc-500 hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="size-3" />
            Prev
          </button>
          <span className="min-w-32 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Page {currentPageIndex + 1}
            {totalPages ? ` of ${totalPages}${runCounts?.capped ? "+" : ""}` : ""}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={!canGoNext || pendingNextPage || runsPage.status === "LoadingMore"}
            className="flex h-8 items-center gap-2 border border-zinc-800 bg-black px-3 font-mono text-[11px] uppercase text-zinc-500 hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>

      <div className="grid gap-2 border border-border bg-muted/5 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        <Input value={modelFilter} onChange={(event) => { setModelFilter(event.target.value); updateQuery({ q: search, status: statusFilter, model: event.target.value, session: sessionFilter, minCost, minSpans, limit: pageSize }); }} placeholder="Model…" aria-label="Filter runs by model" className="h-9 rounded-none border-zinc-800 bg-black font-mono text-[11px]" />
        <Input value={sessionFilter} onChange={(event) => { setSessionFilter(event.target.value); updateQuery({ q: search, status: statusFilter, model: modelFilter, session: event.target.value, minCost, minSpans, limit: pageSize }); }} placeholder="Session ID…" aria-label="Filter runs by session" className="h-9 rounded-none border-zinc-800 bg-black font-mono text-[11px]" />
        <Input value={environmentFilter} onChange={(event) => { setEnvironmentFilter(event.target.value); updateQuery({ q: search, status: statusFilter, environment: event.target.value, release: releaseFilter, model: modelFilter, session: sessionFilter, minCost, minSpans, limit: pageSize }); }} placeholder="Environment…" aria-label="Filter runs by environment" className="h-9 rounded-none border-zinc-800 bg-black font-mono text-[11px]" />
        <Input value={releaseFilter} onChange={(event) => { setReleaseFilter(event.target.value); updateQuery({ q: search, status: statusFilter, environment: environmentFilter, release: event.target.value, model: modelFilter, session: sessionFilter, minCost, minSpans, limit: pageSize }); }} placeholder="Release…" aria-label="Filter runs by release" className="h-9 rounded-none border-zinc-800 bg-black font-mono text-[11px]" />
        <Input value={minCost} onChange={(event) => { setMinCost(event.target.value); updateQuery({ q: search, status: statusFilter, model: modelFilter, session: sessionFilter, minCost: event.target.value, minSpans, limit: pageSize }); }} placeholder="Minimum cost USD…" aria-label="Filter runs by minimum cost" inputMode="decimal" className="h-9 rounded-none border-zinc-800 bg-black font-mono text-[11px]" />
        <Input value={minSpans} onChange={(event) => { setMinSpans(event.target.value); updateQuery({ q: search, status: statusFilter, model: modelFilter, session: sessionFilter, minCost, minSpans: event.target.value, limit: pageSize }); }} placeholder="Minimum spans…" aria-label="Filter runs by minimum span count" inputMode="numeric" className="h-9 rounded-none border-zinc-800 bg-black font-mono text-[11px]" />
        <select value={days} onChange={(event) => { setDays(event.target.value); setStartedAtAfter(new Date(Date.now() - Math.max(1, Number(event.target.value)) * 86400000).toISOString()); setPageIndex(0); updateQuery({ q: search, status: statusFilter, days: event.target.value, limit: pageSize }); }} aria-label="Filter runs by time window" className="h-9 border border-zinc-800 bg-black px-3 font-mono text-[11px] text-zinc-300">
          <option value="1">Last 24 hours</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {selectedRunIds.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-white/20 bg-white/[0.03] p-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300">{selectedRunIds.size} run{selectedRunIds.size === 1 ? "" : "s"} selected</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={exportSelectedRuns} className="flex items-center gap-2 border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase text-zinc-300 transition-colors hover:border-white hover:text-white"><Download className="size-3" />Export visible</button>
            <button type="button" onClick={() => setSelectedRunIds(new Set())} className="border border-zinc-800 px-3 py-2 font-mono text-[10px] uppercase text-zinc-500 hover:border-zinc-500 hover:text-white">Clear</button>
          </div>
        </div>
      ) : null}

      <div className="border border-border">
        {visibleRuns.length === 0 ? (
          <DashboardEmptyState
            title={search || statusFilter !== "all" || modelFilter || sessionFilter || environmentFilter || releaseFilter || minCost || minSpans ? "No runs match these filters" : "No runs recorded yet"}
            description={search || statusFilter !== "all" || modelFilter || sessionFilter || environmentFilter || releaseFilter || minCost || minSpans ? "Clear a filter or broaden the query to see more execution history." : "Instrument an agent with the Tracify SDK to make execution evidence appear here."}
            href={search || statusFilter !== "all" || modelFilter || sessionFilter || environmentFilter || releaseFilter || minCost || minSpans ? `/dashboard/${projectId}/runs` : `/dashboard/${projectId}/quickstart`}
            action={search || statusFilter !== "all" || modelFilter || sessionFilter || environmentFilter || releaseFilter || minCost || minSpans ? "Clear filters" : "Open quickstart"}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                <TableHead className="w-10">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} aria-label="Select all visible runs" className="size-3.5 accent-white" />
                </TableHead>
                <TableHead className="w-[100px] font-mono text-[10px] uppercase tracking-widest">
                  Status
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">
                  Run ID
                </TableHead>
                <TableHead className="hidden max-w-[150px] font-mono text-[10px] uppercase tracking-widest lg:table-cell">
                  Context
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-right">
                  Spans
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-right">
                  Cost
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-right">
                  Duration
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-right">
                  Started
                </TableHead>
                <TableHead className="w-[84px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRuns.map((run) => {
                const durationMs = run.finishedAt 
                  ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
                  : now - new Date(run.startedAt).getTime();

                return (
                  <TableRow 
                    key={run._id} 
                    data-run-row
                    tabIndex={0}
                    aria-label={`Run ${run.runId}, ${run.status}`}
                    onKeyDown={(event) => {
                      const rows = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLElement>("[data-run-row]") ?? []);
                      const index = rows.indexOf(event.currentTarget);
                      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
                        event.preventDefault();
                        const nextIndex = event.key === "ArrowDown" ? Math.min(rows.length - 1, index + 1) : event.key === "ArrowUp" ? Math.max(0, index - 1) : event.key === "Home" ? 0 : rows.length - 1;
                        rows[nextIndex]?.focus();
                      } else if (event.key === "Enter") {
                        event.preventDefault();
                        router.push(`/dashboard/${projectId}/runs/${run.runId}`);
                      }
                    }}
                    className="group border-b border-border last:border-0 transition-colors hover:bg-muted/20 focus-visible:bg-muted/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white"
                  >
                    <TableCell>
                      <input type="checkbox" checked={selectedRunIds.has(run._id)} onChange={() => setSelectedRunIds((current) => { const next = new Set(current); if (next.has(run._id)) next.delete(run._id); else next.add(run._id); return next; })} aria-label={`Select run ${run.runId}`} className="size-3.5 accent-white" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={run.status} />
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/dashboard/${projectId}/runs/${run.runId}`}
                        className="font-mono text-xs hover:underline flex items-center gap-2"
                      >
                        {run.runId}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden max-w-[150px] lg:table-cell">
                      <div className="min-w-0 space-y-1 font-mono text-[10px] text-zinc-500">
                        <div className="truncate text-zinc-300">{run.primaryModel || "model not reported"}</div>
                        <div className="truncate">{run.sessionId ? `session:${run.sessionId}` : "no session context"}</div>
                        <div className="truncate">{run.environment ? `env:${run.environment}` : "no environment"}{run.release ? ` · release:${run.release}` : ""}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-zinc-500">
                      {run.spanCount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(run.totalCostUsd)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-zinc-500">
                      {formatDuration(durationMs)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-zinc-500">
                      {formatRelativeTime(run.startedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {run.status === "running" && (
                          <CancelRunButton
                            projectId={projectId}
                            runId={run.runId}
                            compact
                          />
                        )}
                        <Link
                          href={`/dashboard/${projectId}/runs/${run.runId}`}
                          aria-label={`Open run ${run.runId}`}
                          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <ArrowUpRight className="size-4 text-zinc-400 hover:text-white" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "running":
      return (
        <div className="flex items-center gap-2">
          <div className="size-1.5 bg-white animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white">
            Live
          </span>
        </div>
      );
    case "completed":
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-3 text-zinc-500" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Done
          </span>
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center gap-2">
          <XCircle className="size-3 text-zinc-500" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Fail
          </span>
        </div>
      );
    case "cancelled":
      return (
        <div className="flex items-center gap-2">
          <XCircle className="size-3 text-amber-500" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
            Stop
          </span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-2">
          <Clock className="size-3 text-zinc-500" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {status}
          </span>
        </div>
      );
  }
}
