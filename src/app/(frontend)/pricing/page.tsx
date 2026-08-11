"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { FutureBand, FuturePage } from "@/components/marketing/future19-page";

const plans = [
  { name: "Free", monthly: 0, spans: "50k spans", retention: "7 days", scope: "1 project / 1 member", signal: "Start", features: ["Trace viewer", "Cost visibility", "Community support"], featured: false },
  { name: "Pro", monthly: 19, spans: "500k spans", retention: "30 days", scope: "3 projects / 5 members", signal: "Build", features: ["Evaluations + datasets", "Prompt versions", "Slack alerts"], featured: true },
  { name: "Team", monthly: 39, spans: "2m spans", retention: "90 days", scope: "Unlimited projects / 20 members", signal: "Operate", features: ["Release gates", "Collaboration + reviews", "Priority support"], featured: false },
] as const;

const comparison = [
  ["Tracing + sessions", "Included", "Included", "Included"], ["Cost analytics", "Basic", "Full", "Full"], ["Evaluations", "—", "Included", "Included"], ["Datasets + experiments", "—", "Included", "Included"], ["Release gates", "—", "—", "Included"], ["Members", "1", "5", "20"], ["Retention", "7 days", "30 days", "90 days"],
] as const;

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  return <FuturePage>
    <header className="relative border-b border-black bg-black text-white">
      <div className="mx-auto max-w-[1240px] border-x border-white/25">
        <div className="grid lg:grid-cols-[1fr_360px]">
          <div className="relative overflow-hidden px-5 py-16 sm:px-8 md:px-10 md:py-24">
            <div className="absolute -right-10 top-4 select-none font-pixel text-[14rem] leading-none text-white/[0.04]" aria-hidden="true">$</div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#f4d44d]">Pricing / Operating scale</p>
            <h1 className="mt-16 max-w-5xl font-pixel text-[clamp(4rem,9vw,8rem)] leading-[0.8] tracking-[-0.075em]">The price of knowing what happened.</h1>
            <p className="mt-10 max-w-xl text-base leading-7 text-white/52">Start with real traces. Upgrade when the operating record needs deeper retention, evaluation, collaboration, and release control.</p>
          </div>
          <aside className="flex flex-col justify-between border-t border-white/25 bg-[#f4d44d] p-6 text-black lg:border-l lg:border-t-0 lg:p-8">
            <div className="flex justify-between font-mono text-[8px] uppercase tracking-[0.14em]"><span>Rate card</span><span>USD</span></div>
            <div className="my-20"><span className="block font-pixel text-8xl leading-none tracking-[-0.08em]">$0</span><span className="font-mono text-[9px] uppercase tracking-[0.13em]">to begin</span></div>
            <div><p className="mb-3 font-mono text-[8px] uppercase tracking-[0.13em]">Billing rhythm</p><div className="flex border border-black p-1"><button type="button" onClick={() => setAnnual(false)} aria-pressed={!annual} className={`flex-1 px-3 py-3 font-mono text-[8px] uppercase ${!annual ? "bg-black text-white" : "text-black/55"}`}>Monthly</button><button type="button" onClick={() => setAnnual(true)} aria-pressed={annual} className={`flex-1 px-3 py-3 font-mono text-[8px] uppercase ${annual ? "bg-black text-white" : "text-black/55"}`}>Annual −20%</button></div></div>
          </aside>
        </div>
      </div>
    </header>
    <FutureBand label="Self-serve plans"><div className="grid border-x border-black lg:grid-cols-3">{plans.map((plan, index) => {
      const price = annual ? plan.monthly * 0.8 : plan.monthly;
      return <article key={plan.name} className={`relative flex min-h-[560px] flex-col border-b border-black p-6 lg:border-b-0 lg:border-r lg:last:border-r-0 md:p-8 ${plan.featured ? "bg-[#f4d44d]" : index === 2 ? "bg-black text-white" : "bg-white/30"}`}>
        <div className="flex items-start justify-between"><div><p className="font-mono text-[8px] uppercase tracking-[0.14em] opacity-50">0{index + 1} / {plan.signal}</p><h2 className="mt-4 font-pixel text-6xl tracking-[-0.07em]">{plan.name}</h2></div>{plan.featured ? <span className="border border-black px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em]">Most useful</span> : null}</div>
        <div className="mt-16 border-y border-current/25 py-6"><span className="font-pixel text-7xl tracking-[-0.08em]">${price % 1 ? price.toFixed(2) : price}</span><span className="ml-2 text-sm opacity-50">/mo</span>{annual && plan.monthly > 0 ? <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] opacity-45">Billed annually</p> : null}</div>
        <dl className="mt-6 space-y-3 font-mono text-[9px] uppercase tracking-[0.1em]"><div className="flex justify-between gap-4"><dt className="opacity-45">Volume</dt><dd>{plan.spans}</dd></div><div className="flex justify-between gap-4"><dt className="opacity-45">Retention</dt><dd>{plan.retention}</dd></div><div className="flex justify-between gap-4"><dt className="opacity-45">Scope</dt><dd className="text-right">{plan.scope}</dd></div></dl>
        <ul className="mt-7 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-3 text-sm"><Check className="size-3.5" aria-hidden="true" />{feature}</li>)}</ul>
        <Link href="/sign-up" className={`mt-auto flex min-h-12 items-center justify-between border px-4 font-mono text-[9px] uppercase tracking-[0.12em] ${index === 2 ? "border-white bg-white text-black hover:bg-[#f4d44d]" : "border-black bg-black text-white hover:bg-white hover:text-black"}`}>Start {plan.name}<ArrowRight className="size-3.5" /></Link>
      </article>;
    })}</div></FutureBand>
    <FutureBand label="Capability ledger"><div className="overflow-x-auto border-x border-black"><table className="w-full min-w-[680px] border-collapse text-left"><thead className="bg-black font-mono text-[8px] uppercase tracking-[0.13em] text-white"><tr><th className="p-4">Capability</th>{plans.map((plan) => <th key={plan.name} className="border-l border-white/20 p-4">{plan.name}</th>)}</tr></thead><tbody>{comparison.map((row, index) => <tr key={row[0]} className={index % 2 ? "bg-white/35" : undefined}>{row.map((cell, cellIndex) => <td key={cell} className={`border-t border-black p-4 text-sm ${cellIndex ? "border-l font-mono text-[10px] uppercase tracking-[0.08em]" : "font-medium"}`}>{cell}</td>)}</tr>)}</tbody></table></div></FutureBand>
    <FutureBand tone="signal" label="Enterprise"><div className="grid gap-10 px-5 py-14 md:grid-cols-[1fr_auto] md:items-end md:px-10"><div><p className="font-pixel text-6xl leading-[0.85] tracking-[-0.065em] md:text-8xl">Different constraints deserve a real conversation.</p><p className="mt-6 max-w-2xl text-sm leading-6 text-black/60">Security review, custom retention, migration planning, data residency, and deployment architecture.</p></div><Link href="/contact" className="inline-flex min-h-12 items-center justify-between gap-8 border border-black bg-black px-5 font-mono text-[9px] uppercase tracking-[0.13em] text-white">Contact us <ArrowRight className="size-3.5" /></Link></div></FutureBand>
  </FuturePage>;
}
