"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

type Result = { runId: string; sessionId: string; endUserId: string; environment: string; release: string; traceName: string; startedAt: string; lastSeenAt: string; spanCount: number; totalCostUsd: number; maxLatencyMs: number; ttftMs: number; retryCount: number; errorCount: number };

export function TraceSearch({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [days, setDays] = useState("30");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  async function runSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setUnavailable(false);
    const params = new URLSearchParams({ q: query, status, days });
    try {
      const response = await fetch(`/api/projects/${projectId}/search?${params}`);
      const body = await response.json();
      setResults(body.results ?? []);
      setUnavailable(Boolean(body.unavailable));
    } catch {
      setResults([]);
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }

  return <div className="space-y-6">
    <form onSubmit={runSearch} className="flex flex-col gap-3 border border-border bg-muted/10 p-4 md:flex-row">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Run ID, trace name, session..." className="h-10 rounded-none border-zinc-800 bg-black pl-10 font-mono text-xs" /></div>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 border border-zinc-800 bg-black px-3 font-mono text-xs text-zinc-300"><option value="all">All statuses</option><option value="error">Has errors</option><option value="healthy">No errors</option></select>
      <select value={days} onChange={(event) => setDays(event.target.value)} className="h-10 border border-zinc-800 bg-black px-3 font-mono text-xs text-zinc-300"><option value="1">1 day</option><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select>
      <button disabled={loading} className="h-10 bg-white px-5 font-mono text-xs uppercase tracking-widest text-black disabled:opacity-50">{loading ? "Searching" : "Search"}</button>
    </form>
    {unavailable && <div className="border border-zinc-800 p-4 font-mono text-xs text-zinc-500">Analytics is temporarily unavailable. Try again shortly.</div>}
    <div className="border border-border">
      {results.length === 0 ? <div className="p-16 text-center font-mono text-sm uppercase tracking-widest text-zinc-500">Run a search to find traces</div> : results.map((result) => <Link key={result.runId} href={`/dashboard/${projectId}/runs/${result.runId}`} className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/20 md:flex-row md:items-center md:justify-between"><div><div className="font-mono text-sm text-white">{result.traceName || result.runId}</div><div className="mt-1 font-mono text-[10px] text-zinc-500">{result.sessionId && `session:${result.sessionId} · `}{result.environment || "unknown env"} · {result.spanCount} spans</div></div><div className="flex gap-4 font-mono text-xs text-zinc-500"><span>{formatCurrency(result.totalCostUsd)}</span><span>{result.errorCount ? `${result.errorCount} errors` : "healthy"}</span><span>{formatRelativeTime(result.lastSeenAt)}</span></div></Link>)}
    </div>
  </div>;
}
