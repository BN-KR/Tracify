"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { pricingCheckoutHref } from "@/lib/billing-links";

const plans = [
  { name: "Free", monthly: 0, spans: "50k", retention: "7 days", members: "1", projects: "1 project", signal: "Start", features: ["Trace viewer", "Cost visibility", "Community support"] },
  { name: "Pro", monthly: 19, spans: "500k", retention: "30 days", members: "5", projects: "3 projects", signal: "Build", features: ["Evaluations + datasets", "Prompt versions", "Slack alerts"] },
  { name: "Team", monthly: 39, spans: "2m", retention: "90 days", members: "20", projects: "Unlimited projects", signal: "Operate", features: ["Release gates", "Collaboration + reviews", "Priority support"] },
] as const;

const teamSizes = ["1", "2–5", "6–20", "20+"] as const;
const traceVolumes = ["<50k", "50k–500k", "500k–2m", "2m+"] as const;
const comparison = [
  ["Tracing + sessions", "Included", "Included", "Included"],
  ["Cost analytics", "Basic", "Full", "Full"],
  ["Evaluations", "—", "Included", "Included"],
  ["Datasets + experiments", "—", "Included", "Included"],
  ["Release gates", "—", "—", "Included"],
  ["Members", "1", "5", "20"],
  ["Retention", "7 days", "30 days", "90 days"],
] as const;

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [teamIndex, setTeamIndex] = useState(1);
  const [traceIndex, setTraceIndex] = useState(1);

  const recommendedIndex = useMemo(() => {
    if (teamIndex === 0 && traceIndex === 0) return 0;
    if (teamIndex >= 2 || traceIndex >= 2) return 2;
    return 1;
  }, [teamIndex, traceIndex]);
  const recommended = plans[recommendedIndex];
  const price = annual ? recommended.monthly * 0.8 : recommended.monthly;

  return (
    <main className="min-h-screen overflow-hidden bg-[#eceae3] pt-[54px] text-black">
      <section className="border-b border-black">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="border-black px-5 py-10 sm:px-8 md:px-10 md:py-14 lg:border-r">
            <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.16em] text-black/55">
              <span>Decision canvas</span>
              <span>USD / self-serve</span>
            </div>
            <h1 className="mt-8 max-w-4xl font-pixel text-[clamp(3rem,6vw,6rem)] leading-[0.84] tracking-[-0.07em]">
              Find your fit in 30 seconds.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-black/62">
              Set the size of the team and the operating record. We will point to the smallest plan that fits without hiding the tradeoffs.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              <DecisionAxis
                label="Team size"
                suffix="people"
                options={teamSizes}
                selected={teamIndex}
                onChange={setTeamIndex}
              />
              <DecisionAxis
                label="Trace volume"
                suffix="spans / month"
                options={traceVolumes}
                selected={traceIndex}
                onChange={setTraceIndex}
              />
            </div>

            <div className="mt-10 grid grid-cols-4 border-l border-t border-black" aria-label="Plan fit map">
              {teamSizes.map((team, row) =>
                traceVolumes.map((volume, column) => {
                  const cellPlan = row === 0 && column === 0 ? 0 : row >= 2 || column >= 2 ? 2 : 1;
                  const active = row === teamIndex && column === traceIndex;
                  return (
                    <button
                      type="button"
                      key={`${team}-${volume}`}
                      onClick={() => { setTeamIndex(row); setTraceIndex(column); }}
                      aria-label={`${team} people and ${volume} spans: ${plans[cellPlan].name}`}
                      className={`aspect-[1.35] border-b border-r border-black p-2 text-left font-mono text-[8px] uppercase tracking-[0.1em] transition-colors sm:aspect-[1.75] ${active ? "bg-[#f4d44d] shadow-[inset_0_0_0_3px_#000]" : cellPlan === 2 ? "bg-black text-white" : "bg-white/30 hover:bg-white/70"}`}
                    >
                      <span className="block opacity-55">{team} / {volume}</span>
                      <strong className="mt-2 block text-[10px]">{plans[cellPlan].name}</strong>
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <aside className="flex flex-col bg-black text-white">
            <div className="flex items-center justify-between border-b border-white/20 px-6 py-4 font-mono text-[9px] uppercase tracking-[0.15em]">
              <span>Recommended plan</span>
              <span className="bg-[#f4d44d] px-3 py-1.5 text-black">Best fit</span>
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">{recommended.signal}</p>
                  <h2 className="mt-3 font-pixel text-7xl leading-none tracking-[-0.08em]">{recommended.name}</h2>
                </div>
                <div className="text-right">
                  <span className="font-pixel text-5xl tracking-[-0.07em]">${price % 1 ? price.toFixed(2) : price}</span>
                  <span className="block font-mono text-[8px] uppercase tracking-[0.12em] text-white/45">per month</span>
                </div>
              </div>

              <div className="mt-8 flex border border-white/30 p-1">
                <button type="button" onClick={() => setAnnual(false)} aria-pressed={!annual} className={`min-h-11 flex-1 font-mono text-[9px] uppercase tracking-[0.12em] ${!annual ? "bg-white text-black" : "text-white/55"}`}>Monthly</button>
                <button type="button" onClick={() => setAnnual(true)} aria-pressed={annual} className={`min-h-11 flex-1 font-mono text-[9px] uppercase tracking-[0.12em] ${annual ? "bg-[#f4d44d] text-black" : "text-white/55"}`}>Annual −20%</button>
              </div>

              <dl className="mt-8 divide-y divide-white/20 border-y border-white/20 font-mono text-[10px] uppercase tracking-[0.1em]">
                <PlanFact label="Spans / month" value={recommended.spans} />
                <PlanFact label="Retention" value={recommended.retention} />
                <PlanFact label="Members" value={recommended.members} />
                <PlanFact label="Projects" value={recommended.projects} />
              </dl>

              <ul className="mt-8 grid gap-3 text-sm text-white/68 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {recommended.features.map((feature) => <li key={feature} className="flex items-center gap-3"><Check className="size-4 text-[#f4d44d]" aria-hidden="true" />{feature}</li>)}
              </ul>

              <Link
                href={recommended.name === "Free" ? "/sign-up" : pricingCheckoutHref(recommended.name.toLowerCase() as "pro" | "team", annual ? "annual" : "monthly")}
                className="mt-auto flex min-h-14 items-center justify-between bg-[#f4d44d] px-5 font-mono text-[10px] uppercase tracking-[0.13em] text-black transition-colors hover:bg-white"
              >
                Start {recommended.name}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-black">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid border-b border-black md:grid-cols-[260px_1fr]">
            <div className="border-black bg-[#f4d44d] p-6 md:border-r md:p-8">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em]">Plan ledger</p>
              <p className="mt-16 font-pixel text-4xl leading-[0.92] tracking-[-0.055em]">Compare the limits that change the work.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead><tr className="font-mono text-[9px] uppercase tracking-[0.13em]"><th className="p-5">Capability</th>{plans.map((plan, index) => <th key={plan.name} className={`border-l border-black p-5 ${index === recommendedIndex ? "bg-[#f4d44d]" : ""}`}>{plan.name}<span className="mt-1 block text-[8px] opacity-50">${annual ? plan.monthly * 0.8 : plan.monthly}/mo</span></th>)}</tr></thead>
                <tbody>{comparison.map((row, rowIndex) => <tr key={row[0]} className={rowIndex % 2 ? "bg-white/35" : ""}>{row.map((cell, cellIndex) => <td key={`${row[0]}-${cellIndex}`} className={`border-l border-t border-black p-4 text-sm first:border-l-0 ${cellIndex > 0 ? "font-mono text-[10px] uppercase tracking-[0.08em]" : "font-medium"} ${cellIndex - 1 === recommendedIndex ? "bg-[#f4d44d]/25" : ""}`}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col gap-6 bg-[#d9d5ca] px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between md:px-10">
            <div><p className="font-pixel text-4xl tracking-[-0.055em]">Need custom retention, residency, or rollout support?</p><p className="mt-2 text-sm text-black/60">Enterprise constraints deserve a real conversation.</p></div>
            <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-between gap-8 border border-black bg-black px-5 font-mono text-[9px] uppercase tracking-[0.13em] text-white hover:bg-[#f4d44d] hover:text-black">Contact us <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function DecisionAxis({ label, suffix, options, selected, onChange }: { label: string; suffix: string; options: readonly string[]; selected: number; onChange: (index: number) => void }) {
  return <div><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[9px] uppercase tracking-[0.14em]">{label}</p><p className="mt-1 text-sm text-black/50">{suffix}</p></div><div className="flex items-center border border-black"><button type="button" onClick={() => onChange(Math.max(0, selected - 1))} disabled={selected === 0} aria-label={`Decrease ${label}`} className="flex size-10 items-center justify-center border-r border-black disabled:opacity-25"><Minus className="size-3.5" /></button><span className="min-w-20 px-3 text-center font-mono text-xs">{options[selected]}</span><button type="button" onClick={() => onChange(Math.min(options.length - 1, selected + 1))} disabled={selected === options.length - 1} aria-label={`Increase ${label}`} className="flex size-10 items-center justify-center border-l border-black disabled:opacity-25"><Plus className="size-3.5" /></button></div></div><div className="mt-4 grid" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>{options.map((option, index) => <button type="button" key={option} onClick={() => onChange(index)} aria-pressed={selected === index} className={`min-h-12 border border-r-0 border-black px-2 font-mono text-[8px] uppercase tracking-[0.08em] last:border-r ${selected === index ? "bg-black text-white" : "bg-white/25 hover:bg-white/65"}`}>{option}</button>)}</div></div>;
}

function PlanFact({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-4"><dt className="text-white/40">{label}</dt><dd>{value}</dd></div>;
}
