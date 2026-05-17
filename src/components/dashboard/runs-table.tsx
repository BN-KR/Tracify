"use client";

import { useQuery } from "convex/react";
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
import { useState } from "react";
import { ArrowUpRight, Play, CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RunsTableProps {
  projectId: string;
}

export function RunsTable({ projectId }: RunsTableProps) {
  const runs = useQuery(
    api.agentRuns.getRecentRunsByProject, 
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (runs === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-none" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </div>
    );
  }

  const filteredRuns = runs.filter((run) => {
    const matchesSearch = run.runId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2">
          {["all", "running", "completed", "failed"].map((status) => (
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
        </div>
      </div>

      <div className="border border-border">
        {filteredRuns.length === 0 ? (
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
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.map((run) => {
                const durationMs = run.finishedAt 
                  ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
                  : new Date().getTime() - new Date(run.startedAt).getTime();

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
                      <Link 
                        href={`/dashboard/${projectId}/runs/${run.runId}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowUpRight className="size-4 text-zinc-400 hover:text-white" />
                      </Link>
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
