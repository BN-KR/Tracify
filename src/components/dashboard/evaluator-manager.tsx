"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EvaluatorManager({ projectId }: { projectId: string }) {
  const evaluators = useQuery(api.evaluators.list, { projectId: projectId as never });
  const create = useMutation(api.evaluators.create);
  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState("not_empty");
  const [type, setType] = useState<"code" | "llm_judge">("code");
  const [message, setMessage] = useState("");
  async function add() {
    try { await create({ projectId: projectId as never, name, criteria, type }); setName(""); setMessage("Evaluator created."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not create evaluator."); }
  }
  return <div className="space-y-6"><section className="border border-black/15 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-black/55">Evaluator registry</p><h2 className="mt-2 text-xl text-black">Automate quality checks</h2><p className="mt-1 text-sm text-black/55">Code rules support contains:&lt;text&gt;, equals_expected, not_empty, and json_valid. LLM judges use the criteria as their rubric.</p><div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_2fr_auto]"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="response-quality" /><select value={type} onChange={(event) => setType(event.target.value as "code" | "llm_judge")} className="border border-black/15 bg-white p-3 text-sm text-black/70"><option value="code">Code rule</option><option value="llm_judge">LLM judge</option></select><Input value={criteria} onChange={(event) => setCriteria(event.target.value)} placeholder="Criteria or rule" /><Button onClick={add} disabled={!name.trim() || !criteria.trim()}>Create</Button></div></section>{message ? <p className="border border-black/15 p-3 text-xs text-black/60">{message}</p> : null}<section className="space-y-2">{evaluators?.map((evaluator) => <div key={evaluator._id} className="border border-black/15 bg-white p-4"><div className="flex items-center justify-between"><span className="text-sm text-black">{evaluator.name}</span><span className="font-mono text-[10px] uppercase text-black/55">{evaluator.type}</span></div><p className="mt-2 font-mono text-xs text-black/60">{evaluator.criteria}</p></div>)}</section></div>;
}
