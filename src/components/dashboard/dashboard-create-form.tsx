"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ArrowRight } from "lucide-react";

export function DashboardCreateForm({ projectId }: { projectId: string }) {
  const router = useRouter();
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
    <form onSubmit={submit} className="max-w-2xl border border-black bg-white p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">New saved view</p>
      <h1 className="mt-3 font-pixel text-4xl tracking-[-0.06em]">Create a dashboard.</h1>
      <p className="mt-3 text-sm leading-6 text-black/60">Give this view a name. Widgets and filters can be configured after it is created.</p>
      <label htmlFor="dashboard-name" className="mt-6 block font-mono text-[10px] uppercase tracking-[0.12em] text-black/60">Dashboard name</label>
      <input id="dashboard-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Support agent health" autoFocus className="mt-2 h-12 w-full border border-black/25 bg-[#f7f6f1] px-3 text-sm text-black outline-none focus:border-black" />
      {error ? <p className="mt-3 border border-black bg-[#f4d44d] p-3 text-sm text-black" role="alert">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={pending || !name.trim()} className="inline-flex items-center gap-2 bg-black px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#f4d44d] hover:text-black">{pending ? "Creating…" : "Create dashboard"}<ArrowRight className="size-3.5" /></button>
        <button type="button" onClick={() => router.back()} className="border border-black px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] hover:bg-[#f4d44d]">Cancel</button>
      </div>
    </form>
  );
}
