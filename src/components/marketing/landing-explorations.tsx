import Link from "next/link";
import { ArrowUpRight, Check, GitPullRequest, Layers3, Terminal } from "lucide-react";

const executionRows = [
  ["Customer support agent", "v2.4.0", "Quality +6.1%", "Ready to promote"],
  ["Research agent", "v1.8.2", "Latency -420ms", "Reviewing"],
  ["Billing assistant", "v3.1.0", "Cost -18.7%", "Monitoring"],
] as const;

const lifecycle = [
  ["Observe", "Production traces", "Model, tool, and session context"],
  ["Learn", "Evaluation sets", "Turn edge cases into measurable checks"],
  ["Ship", "Release evidence", "Promote with the comparison attached"],
  ["Watch", "Drift signals", "Catch the next regression early"],
] as const;

export function LandingExplorations() {
  return (
    <section aria-label="Landing page concept explorations" className="border-t border-dashed border-white/30 bg-[#080808]">
      <div className="border-b border-dashed border-white/20 px-6 py-4 md:px-10"><p className="mx-auto max-w-[1240px] font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Below: additive concept explorations — existing landing content above is unchanged</p></div>

      <section id="concept-execution" className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 border-b border-white/15 pb-8 md:grid-cols-[0.8fr_1.2fr] md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Concept 01 / execution report</p><h2 className="mt-5 max-w-[540px] font-pixel text-5xl font-normal leading-[0.91] tracking-[-0.065em] md:text-7xl">The release decision, written down.</h2></div><p className="max-w-[440px] text-[16px] leading-7 text-zinc-400">An editorial, Linear-inspired way to show the work moving from production evidence to a version your team can confidently ship.</p></div>
          <div className="mt-10 overflow-hidden border border-white/15 bg-black">
            <div className="grid border-b border-white/10 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 md:grid-cols-[1.4fr_0.6fr_0.8fr_0.8fr]"><span>Initiative</span><span className="hidden md:block">Version</span><span className="hidden md:block">Evidence</span><span className="hidden md:block">State</span></div>
            {executionRows.map(([agent, version, evidence, state], index) => <div key={agent} className="grid gap-3 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[1.4fr_0.6fr_0.8fr_0.8fr] md:items-center"><div><p className="font-sans text-lg text-white">{agent}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-600">Experiment {String(index + 41).padStart(3, "0")}</p></div><span className="font-mono text-xs text-zinc-400">{version}</span><span className="font-mono text-xs text-white">{evidence}</span><span className="inline-flex w-fit items-center gap-2 border border-white/15 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-300"><span className="size-1.5 bg-white" />{state}</span></div>)}
          </div>
          <Link href="/dashboard" className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300 hover:text-white">Open release workspace <ArrowUpRight className="size-3" /></Link>
        </div>
      </section>

      <section id="concept-readme" className="border-y border-white/10 bg-white px-6 py-24 text-black md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Concept 02 / implementation brief</p><h2 className="mt-5 max-w-[510px] font-pixel text-5xl font-normal leading-[0.91] tracking-[-0.065em] md:text-7xl">A quickstart that earns trust before the pitch.</h2><p className="mt-6 max-w-[440px] text-[16px] leading-7 text-zinc-600">This direction takes inspiration from developer-first README pages: explain the setup plainly, show the expected result, then let the product proof do the selling.</p><Link href="/docs" className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-black underline underline-offset-8 decoration-zinc-400 hover:decoration-black">Read the documentation <ArrowUpRight className="size-3" /></Link></div>
          <div className="overflow-hidden border border-black/20 bg-[#f5f5f2] font-mono"><div className="flex items-center justify-between border-b border-black/15 px-5 py-4 text-[10px] uppercase tracking-[0.14em] text-zinc-500"><span>README.md</span><span>Quick start</span></div><div className="grid gap-px bg-black/15 md:grid-cols-[0.95fr_1.05fr]"><div className="bg-[#f5f5f2] p-6"><div className="flex items-center gap-3"><Terminal className="size-4" /><p className="text-xs uppercase tracking-[0.14em]">1. Instrument</p></div><pre className="mt-7 overflow-x-auto text-[13px] leading-7 text-zinc-700">{`npm install tracify\n\nimport { trace } from 'tracify'\n\nawait trace('support-agent', run)`}</pre></div><div className="bg-white p-6"><div className="flex items-center gap-3"><GitPullRequest className="size-4" /><p className="text-xs uppercase tracking-[0.14em]">2. Inspect</p></div><p className="mt-7 text-[15px] leading-7 text-zinc-600">The run arrives with the model, tools, retries, cost, and quality result already linked.</p><div className="mt-8 border-t border-black/15 pt-4"><p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em]"><Check className="size-3" /> Ready for review</p></div></div></div></div>
        </div>
      </section>

      <section id="concept-lifecycle" className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1240px]"><div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-8 md:flex-row md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Concept 03 / connected platform</p><h2 className="mt-5 max-w-[650px] font-pixel text-5xl font-normal leading-[0.91] tracking-[-0.065em] md:text-7xl">Every signal belongs to the same improvement loop.</h2></div><Layers3 className="size-7 text-zinc-500" /></div><div className="grid border-l border-t border-white/15 md:grid-cols-2 lg:grid-cols-4">{lifecycle.map(([phase, label, description], index) => <article key={phase} className="border-b border-r border-white/15 p-6 md:p-8"><span className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">0{index + 1}</span><h3 className="mt-12 font-mono text-xs uppercase tracking-[0.14em] text-white">{phase}</h3><p className="mt-3 font-sans text-2xl tracking-[-0.04em] text-white">{label}</p><p className="mt-4 text-sm leading-6 text-zinc-500">{description}</p></article>)}</div><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 py-5"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Trace → Evaluation → Experiment → Release → Monitor</p><Link href="/product/lifecycle" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white hover:text-zinc-300">Explore lifecycle <ArrowUpRight className="size-3" /></Link></div></div>
      </section>

      <div className="border-t border-dashed border-white/20 px-6 py-4 md:px-10"><p className="mx-auto max-w-[1240px] font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">End of concept explorations</p></div>
    </section>
  );
}
