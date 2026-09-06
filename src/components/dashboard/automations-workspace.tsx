"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function AutomationsWorkspace({ projectId }: { projectId: string }) {
  const automations = useQuery(api.automations.list, projectId ? { projectId: projectId as never } : "skip");
  const create = useMutation(api.automations.create);
  const [name, setName] = useState("");
  const [eventSource, setEventSource] = useState("alert.created");
  const [actionType, setActionType] = useState("webhook");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await create({ projectId: projectId as never, name, eventSource, actionType, destination });
      setName(""); setDestination(""); setStatus("Automation created.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Could not create automation."); }
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
    <section className="overflow-hidden border border-black/10 bg-white"><div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 border-b border-black/10 bg-black/[0.02] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-black/45"><span>Name</span><span>Trigger</span><span>Status</span></div>{automations?.length ? automations.map((automation) => <div key={automation._id} className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 border-b border-black/10 px-4 py-4 text-xs"><span>{automation.name}</span><span className="font-mono text-black/55">{automation.eventSource}</span><span>{automation.active ? "Active" : "Paused"}</span></div>) : <div className="flex min-h-36 flex-col items-center justify-center gap-2 px-4 text-center"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">No automations yet</p><p className="text-xs text-black/50">Create one to route Tracify signals.</p></div>}</section>
    <form onSubmit={submit} className="grid gap-4 border border-black/10 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">New automation</p><label className="grid gap-2 text-xs text-black/65">Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Notify on failures" className="h-10 border border-black/15 px-3 text-xs outline-none focus:border-black" /></label><label className="grid gap-2 text-xs text-black/65">Event source<select value={eventSource} onChange={(event) => setEventSource(event.target.value)} className="h-10 border border-black/15 bg-white px-3 text-xs"><option>alert.created</option><option>run.failed</option><option>cost.threshold</option></select></label><label className="grid gap-2 text-xs text-black/65">Action<select value={actionType} onChange={(event) => setActionType(event.target.value)} className="h-10 border border-black/15 bg-white px-3 text-xs"><option>webhook</option><option>slack</option><option>github_dispatch</option></select></label><label className="grid gap-2 text-xs text-black/65">Destination<input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="https://…" className="h-10 border border-black/15 px-3 text-xs outline-none focus:border-black" /></label><button type="submit" className="border border-black bg-black px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white">Create automation</button>{status ? <p role="status" className="text-xs text-black/60">{status}</p> : null}</form>
  </div>;
}
