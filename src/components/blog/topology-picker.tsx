"use client";

import { useState } from "react";

type TopologyKey = "orchestrator" | "peer" | "hierarchical";

type TopologyProfile = {
  label: string;
  summary: string;
  latency: string;
  blastRadius: string;
  cost: string;
  debugging: string;
};

const TOPOLOGIES: Record<TopologyKey, TopologyProfile> = {
  orchestrator: {
    label: "Orchestrator / worker",
    summary: "A single planner agent dispatches bounded subtasks to specialist workers and assembles the result.",
    latency: "Low. One hop out and one hop back per worker call, and independent workers can run in parallel.",
    blastRadius: "Contained. A broken worker fails its own branch; the orchestrator can retry, skip, or degrade that branch without touching the others.",
    cost: "Predictable. Spend scales with the worker calls the orchestrator explicitly issues, so a budget check before dispatch is enough to bound it.",
    debugging: "Easiest. One root span, a bounded fan-out, and one place to start reading: the orchestrator's dispatch decision.",
  },
  peer: {
    label: "Peer-to-peer",
    summary: "Agents exchange messages directly with each other. No agent holds the full plan or a global view of progress.",
    latency: "Variable. Total time depends on how many hops a request takes before an answer comes back, which is hard to predict upfront.",
    blastRadius: "Wide. A stuck, wrong, or slow agent can cascade into every peer that depends on its output, with no coordinator to intercept it.",
    cost: "Hard to predict. Message volume grows with the size of the mesh and the conversation, not with the size of the task.",
    debugging: "Hardest. There is no single root span. Reconstructing what happened means joining correlation IDs across every agent's own logs.",
  },
  hierarchical: {
    label: "Hierarchical / supervisor tree",
    summary: "Nested supervisors each own a bounded branch of the tree, delegating down and reporting summaries up.",
    latency: "Medium. Each layer of supervision adds a hop, offset by a narrower, better-scoped fan-out at every layer.",
    blastRadius: "Bounded by branch. A failure is contained to the subtree under the supervisor that owns it, and rolls up as one summarized outcome.",
    cost: "Layered. Each supervisor adds its own coordination overhead on top of the worker cost beneath it.",
    debugging: "Moderate. Depth mirrors the org chart, so you follow the failing branch down instead of scanning the whole graph.",
  },
};

const ORDER: TopologyKey[] = ["orchestrator", "peer", "hierarchical"];

export function TopologyPicker() {
  const [selected, setSelected] = useState<TopologyKey>("orchestrator");
  const profile = TOPOLOGIES[selected];

  return (
    <div className="my-8 border border-black bg-white/70 p-5" role="group" aria-label="Topology trade-off explorer">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/60">Topology trade-off explorer</p>
      <p className="mt-2 text-sm leading-6 text-black/70">
        Pick a topology to see how it scores on latency, blast radius, cost, and debugging difficulty. The comparison is
        qualitative and directional — use it to frame a design conversation, not to size a specific system.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a multi-agent topology">
        {ORDER.map((key) => {
          const isActive = key === selected;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setSelected(key)}
              className={
                isActive
                  ? "border border-black bg-[#f4d44d] px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-black"
                  : "border border-black bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-black/70 hover:bg-black hover:text-white"
              }
            >
              {TOPOLOGIES[key].label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm leading-6 text-black/80">{profile.summary}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <tbody>
            <tr className="border-t border-black/20">
              <th scope="row" className="w-40 py-2 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-black/55">
                Latency
              </th>
              <td className="py-2 text-black/85">{profile.latency}</td>
            </tr>
            <tr className="border-t border-black/20">
              <th scope="row" className="w-40 py-2 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-black/55">
                Blast radius
              </th>
              <td className="py-2 text-black/85">{profile.blastRadius}</td>
            </tr>
            <tr className="border-t border-black/20">
              <th scope="row" className="w-40 py-2 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-black/55">
                Cost
              </th>
              <td className="py-2 text-black/85">{profile.cost}</td>
            </tr>
            <tr className="border-t border-black/20">
              <th scope="row" className="w-40 py-2 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-black/55">
                Debugging difficulty
              </th>
              <td className="py-2 text-black/85">{profile.debugging}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
