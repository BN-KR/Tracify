"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function NewDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const createDashboard = useMutation(api.dashboards.create);

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setError("");
    try {
      const dashboardId = await createDashboard({ projectId: projectId as Id<"projects">, name: trimmed, isDefault: false });
      router.replace(`/dashboard/${projectId}/dashboards/${dashboardId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create dashboard.");
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
      <header className="border-b border-zinc-800 pb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Observe / dashboards / new</p>
        <h1 className="mt-2 font-pixel text-3xl leading-[0.9] tracking-tight text-zinc-100">Create a dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Saved views render live project data. After creating this view you can add widgets for trace volume, model cost, latency percentiles, and score analytics.</p>
      </header>

      <Card className="border-zinc-800 bg-[#111418] p-6 shadow-none">
        <form onSubmit={submit} className="max-w-xl">
          <label htmlFor="dashboard-name" className="block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Dashboard name</label>
          <input
            id="dashboard-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Support agent health"
            autoFocus
            className="mt-2 h-11 w-full border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-300"
          />
          {error ? <p className="mt-3 border border-red-500/30 bg-red-500/5 p-3 font-mono text-xs text-red-300" role="alert">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={pending || !name.trim()} className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50">
              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
              {pending ? "Creating…" : "Create dashboard"} <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => router.back()} className="border border-zinc-700 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
