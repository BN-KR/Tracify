"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CancelRunButton } from "./cancel-run-button";
import { useNow } from "@/hooks/use-now";

interface RunsTableProps {
  projectId: string;
}

export function RunsTable({ projectId }: RunsTableProps) {
  const now = useNow(1000);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [pendingNextPage, setPendingNextPage] = useState(false);
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

  useEffect(() => {
    setPageIndex(0);
    setPendingNextPage(false);
  }, [pageSize, statusFilter, search]);

  useEffect(() => {
    if (!pendingNextPage) return;
    const nextPageStart = (pageIndex + 1) * pageSize;
    if (runsPage.results.length > nextPageStart || runsPage.status === "Exhausted") {
      setPageIndex((page) => page + 1);
      setPendingNextPage(false);
    }
  }, [pageIndex, pageSize, pendingNextPage, runsPage.results.length, runsPage.status]);

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
  const totalLoadedPages = Math.max(1, Math.ceil(filteredRuns.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, totalLoadedPages - 1);
  const visibleRuns = filteredRuns.slice(
    currentPageIndex * pageSize,
    currentPageIndex * pageSize + pageSize,
  );
  const canGoPrevious = currentPageIndex > 0;
  const hasLoadedNextPage = filteredRuns.length > (currentPageIndex + 1) * pageSize;
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
      setPageIndex((page) => page + 1);
      return;
    }

    if (runsPage.status === "CanLoadMore") {
      setPendingNextPage(true);
      runsPage.loadMore(pageSize);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2">
          {["all", "running", "completed", "failed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-colors",
                statusFilter === status 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-500"
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
          <Input 
            placeholder="Search run ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-none border-zinc-800 bg-black font-mono text-[11px] placeholder:text-zinc-700"
          />
          {search.trim() ? (
            <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
              Exact run ID lookup searches all saved runs
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 border border-border bg-muted/10 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            rows
          </span>
          {[10, 25, 50].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
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
            onClick={() => setPageIndex((page) => Math.max(0, page - 1))}
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

      <div className="border border-border">
        {visibleRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">No results found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                <TableHead className="w-[100px] font-mono text-[10px] uppercase tracking-widest">
                  Status
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">
                  Run ID
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
                    className="group border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
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
                          className="opacity-0 transition-opacity group-hover:opacity-100"
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
