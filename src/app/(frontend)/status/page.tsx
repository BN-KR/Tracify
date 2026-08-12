import type { Metadata } from "next";
import { FutureBand, FuturePage } from "@/components/marketing/future19-page";

export const metadata: Metadata = { title: "Status", description: "Current operational status for Tracify services.", alternates: { canonical: "/status" } };

const services = ["Dashboard + authentication", "Telemetry ingestion", "Trace + analytics queries", "Notifications + runtime policies"];

export default function StatusPage() {
  return <FuturePage>
    <header className="border-b border-black bg-black text-white">
      <div className="mx-auto max-w-[1240px] border-x border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 px-5 py-4 font-mono text-[8px] uppercase tracking-[0.15em]"><span className="flex items-center gap-3 text-[#f4d44d]"><span className="size-2 animate-pulse bg-[#f4d44d]"/>Monitor link / beta</span><time>Last reviewed / manual</time></div>
        <div className="grid md:grid-cols-[1fr_300px]"><div className="px-5 py-10 sm:px-8 md:px-10 md:py-12"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/50">Public operations board</p><h1 className="mt-8 max-w-4xl font-pixel text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.055em]">No green dot without evidence.</h1></div><div className="flex flex-col justify-between border-t border-white/20 p-6 md:border-l md:border-t-0 md:p-8"><div className="grid grid-cols-7 gap-2" aria-hidden="true">{Array.from({length:28}).map((_,i)=><span key={i} className={`aspect-square ${i > 24 ? "bg-[#f4d44d]" : "bg-white/10"}`}/>)}</div><p className="mt-10 text-sm leading-6 text-white/65">Automated incident history is being connected. Until then, support remains the honest source of truth.</p></div></div>
      </div>
    </header>
    <FutureBand label="Service ledger">
      <div className="divide-y divide-black border-x border-black">
        {services.map((service, index) => <div key={service} className="grid min-h-28 grid-cols-[56px_1fr] items-stretch sm:grid-cols-[80px_1fr_auto]">
          <div className="flex items-center justify-center border-r border-black bg-white/35 font-pixel text-3xl text-black/25">0{index + 1}</div>
          <div className="flex items-center px-5 font-mono text-xs uppercase tracking-[0.1em] sm:px-8">{service}</div>
          <div className="col-span-2 flex items-center gap-3 border-t border-black bg-[#f4d44d] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.12em] sm:col-span-1 sm:border-l sm:border-t-0"><span className="size-2 bg-black" /> Monitor connection in progress</div>
        </div>)}
      </div>
    </FutureBand>
    <FutureBand tone="ink"><div className="grid gap-8 px-5 py-12 md:grid-cols-2 md:px-10"><p className="font-pixel text-5xl leading-none tracking-[-0.06em]">Seeing something we are not?</p><div className="md:text-right"><a className="inline-block border-b-2 border-[#f4d44d] pb-1 font-mono text-[10px] uppercase tracking-[0.13em] text-[#f4d44d]" href="mailto:hello@tracify.tech?subject=Service incident">Report an incident ↗</a></div></div></FutureBand>
  </FuturePage>;
}
