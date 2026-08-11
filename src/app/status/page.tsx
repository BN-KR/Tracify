import type { Metadata } from "next";
import { FutureBand, FutureMasthead, FuturePage } from "@/components/marketing/future19-page";

export const metadata: Metadata = { title: "Status", description: "Current operational status for Tracify services.", alternates: { canonical: "/status" } };

const services = ["Dashboard + authentication", "Telemetry ingestion", "Trace + analytics queries", "Notifications + runtime policies"];

export default function StatusPage() {
  return <FuturePage>
    <FutureMasthead eyebrow="Platform / Status" title={<>All systems, plainly stated.</>} description="A public operating board for the services between your agent and its evidence. Automated incident history is being connected; support remains the source of truth during beta." index="S01" aside={<div><span className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.13em] text-[#f4d44d]"><span className="size-2 animate-pulse bg-[#f4d44d]" /> Beta monitoring</span><p className="mt-5 text-sm leading-6 text-white/55">No fabricated uptime percentage while the public monitor is incomplete.</p></div>} />
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
