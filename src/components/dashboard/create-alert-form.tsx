"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function CreateAlertForm({ projectId }: { projectId: string }) {
  const create = useMutation(api.alerts.create);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("threshold");
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await create({ projectId: projectId as never, runId: `manual-alert:${name.trim()}`, type, message: message.trim() || name.trim(), triggeredAt: new Date().toISOString(), state: "active" });
      setStatus("Alert created and added to this project.");
      setName("");
      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create alert.");
    }
  }

  return <form onSubmit={submit} className="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-2">
    <label className="grid gap-2 text-xs text-black/65">Alert name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="High latency" className="h-10 border border-black/15 px-3 font-mono text-xs outline-none focus:border-black" /></label>
    <label className="grid gap-2 text-xs text-black/65">Signal type<select value={type} onChange={(event) => setType(event.target.value)} className="h-10 border border-black/15 bg-white px-3 font-mono text-xs outline-none focus:border-black"><option value="threshold">Threshold</option><option value="run_failed">Run failed</option><option value="cost_exceeded">Cost exceeded</option><option value="duration_exceeded">Duration exceeded</option></select></label>
    <label className="grid gap-2 text-xs text-black/65 md:col-span-2">Message<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Describe when this alert should appear" className="border border-black/15 px-3 py-2 text-xs outline-none focus:border-black" /></label>
    <button type="submit" className="w-fit border border-black bg-black px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white hover:bg-black/80">Create alert</button>
    {status ? <p role="status" className="self-center text-xs text-black/60">{status}</p> : null}
  </form>;
}
