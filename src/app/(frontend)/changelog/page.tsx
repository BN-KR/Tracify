import { FutureBand, FuturePage } from "@/components/marketing/future19-page";

export const metadata = { title: "Tracify product changelog and release notes", description: "Review meaningful Tracify product changes across agent tracing, evaluations, runtime controls, dashboards, and developer workflows.", alternates: { canonical: "/changelog" } };

const changes = [
  { date: "August 2026", code: "26.08", title: "The operating record expands", items: ["Future 19 visual system promoted across the public product story.", "Better Auth migration with secure social and password flows.", "Sessions, evaluations, prompts, datasets, and release workflows connected."] },
  { date: "June 2026", code: "26.06", title: "The publishing layer", items: ["Engineering journal launched with reading tools and related notes.", "Documentation and product navigation reorganized around workflows.", "Sanity publishing pipeline connected."] },
  { date: "May 2026", code: "26.05", title: "Signals become operational", items: ["Cost analysis filters by date range and model.", "Trace viewer performance improved for long-running agents.", "Slack and email notification foundations added for failures."] },
] as const;

export default function ChangelogPage() {
  return <FuturePage>
    <header className="border-b border-black">
      <div className="mx-auto max-w-[1240px] border-x border-black">
        <div className="grid md:grid-cols-[1fr_1fr]">
          <div className="flex min-h-[400px] flex-col justify-between bg-black p-6 text-white md:p-10"><div className="flex justify-between font-mono text-[8px] uppercase tracking-[0.14em] text-white/55"><span>Release tape</span><span>Rolling</span></div><h1 className="font-pixel text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.055em]">What changed?</h1><p className="max-w-md text-sm leading-6 text-white/65">A chronological record of meaningful product movement. No confetti, no inflated patch notes.</p></div>
          <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden border-t border-black bg-[#f4d44d] md:border-l md:border-t-0"><div className="absolute inset-y-0 left-1/2 border-l border-black"/><div className="z-10 flex size-60 rotate-[-5deg] flex-col justify-between border-2 border-black bg-[#eceae3] p-6 shadow-[10px_10px_0_#000]"><span className="font-mono text-[8px] uppercase tracking-[0.14em]">Latest registered</span><strong className="font-pixel text-6xl tracking-[-0.06em]">26.08</strong><span className="border-t border-black pt-3 font-mono text-[9px] uppercase tracking-[0.12em]">System release</span></div></div>
        </div>
      </div>
    </header>
    <FutureBand label="Release tape"><div className="border-x border-black">
      {changes.map((change, index) => <article key={change.code} className="grid border-b border-black last:border-b-0 lg:grid-cols-[170px_1fr_300px]">
        <div className={`border-black p-6 lg:border-r ${index === 0 ? "bg-[#f4d44d]" : "bg-white/25"}`}><p className="font-pixel text-5xl tracking-[-0.06em]">{change.code}</p><time className="mt-3 block font-mono text-[9px] uppercase tracking-[0.14em]">{change.date}</time></div>
        <div className="border-t border-black p-6 lg:border-t-0 lg:p-9"><h2 className="font-pixel text-4xl leading-none tracking-[-0.05em] md:text-5xl">{change.title}</h2><ul className="mt-8 space-y-4">{change.items.map((item, itemIndex) => <li key={item} className="grid grid-cols-[30px_1fr] text-sm leading-6 text-black/62"><span className="font-mono text-[9px] text-black/35">{itemIndex + 1}—</span>{item}</li>)}</ul></div>
        <div className="flex min-h-44 items-end border-t border-black bg-black p-6 text-white lg:border-l lg:border-t-0"><p className="font-mono text-[9px] uppercase leading-5 tracking-[0.12em] text-white/45">Release class<br/><span className="text-[#f4d44d]">{index === 0 ? "System" : "Product"}</span></p></div>
      </article>)}
    </div></FutureBand>
  </FuturePage>;
}
