import type { Metadata } from "next";
import { Activity, BellRing, DatabaseZap, RadioTower } from "lucide-react";
import { RegionalStatusBoard } from "@/components/status/regional-status-board";

export const metadata: Metadata = { title: "Status", description: "Current operational status for Tracify services.", alternates: { canonical: "/status" } };

const services = [
  { name: "Dashboard + authentication", owner: "Application", icon: Activity },
  { name: "Telemetry ingestion", owner: "Ingest", icon: RadioTower },
  { name: "Trace + analytics queries", owner: "Data", icon: DatabaseZap },
  { name: "Notifications + runtime policies", owner: "Operations", icon: BellRing },
] as const;

export default function StatusPage() {
  return <main className="min-h-screen bg-[#eceae3] pt-[54px] text-black">
    <header className="border-b border-black bg-black text-white"><div className="mx-auto max-w-[1440px]"><div className="grid lg:grid-cols-[1fr_380px]"><div className="p-6 sm:p-8 md:p-10 md:py-16 lg:border-r lg:border-white/20"><div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#f4d44d]"><RadioTower className="size-4" />Public operations channel</div><h1 className="mt-10 max-w-5xl font-pixel text-[clamp(3.5rem,8vw,8rem)] leading-[0.8] tracking-[-0.08em]">Status must be earned by evidence.</h1><p className="mt-8 max-w-2xl text-base leading-7 text-white/58">A direct view of the surfaces required to ingest, inspect, and act on agent telemetry.</p></div><aside className="flex flex-col justify-between border-t border-white/20 bg-[#f4d44d] p-6 text-black lg:border-t-0 lg:p-8"><div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.14em]"><span>Current declaration</span><span>Beta</span></div><div className="my-16"><Activity className="size-12" strokeWidth={1.2} /><p className="mt-6 font-pixel text-6xl leading-none tracking-[-0.07em]">Monitoring connection in progress.</p></div><p className="border-t border-black pt-5 text-sm leading-6 text-black/65">Automated uptime history is not yet public. Support remains the honest source of truth.</p></aside></div></div></header>
    <RegionalStatusBoard />
    <section className="border-b border-black"><div className="mx-auto max-w-[1440px]"><div className="grid border-b border-black px-5 py-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50 sm:grid-cols-[1fr_auto]"><span>Service board</span><span>Manual review / current</span></div><div className="grid lg:grid-cols-4">{services.map((service,index)=>{const Icon=service.icon;return <article key={service.name} className="flex min-h-80 flex-col justify-between border-b border-r border-black p-6 lg:border-b-0"><div className="flex items-start justify-between"><span className="font-pixel text-5xl text-black/18">0{index+1}</span><Icon className="size-6" strokeWidth={1.25}/></div><div><p className="font-mono text-[8px] uppercase tracking-[0.13em] text-black/40">{service.owner}</p><h2 className="mt-4 font-pixel text-4xl leading-[0.92] tracking-[-0.055em]">{service.name}</h2></div><div className="border border-black bg-[#f4d44d] p-3 font-mono text-[8px] uppercase tracking-[0.11em]">Monitor link pending</div></article>})}</div></div></section>
    <section className="border-b border-black bg-[#d9d5ca]"><div className="mx-auto grid max-w-[1440px] md:grid-cols-[320px_1fr]"><div className="border-black p-6 md:border-r md:p-8"><p className="font-mono text-[9px] uppercase tracking-[0.15em]">Incident protocol</p><p className="mt-20 font-pixel text-4xl leading-[0.92] tracking-[-0.055em]">See a problem before the board does?</p></div><div className="grid sm:grid-cols-3">{["Send the affected surface", "Include the time window", "Receive a human reply"].map((step,index)=><div key={step} className="min-h-52 border-b border-r border-black p-6"><span className="font-pixel text-4xl text-black/18">0{index+1}</span><p className="mt-16 font-mono text-[10px] uppercase tracking-[0.11em]">{step}</p></div>)}</div></div></section>
    <a href="mailto:hello@tracify.tech?subject=Service incident" className="flex min-h-24 items-center justify-between bg-black px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f4d44d] hover:bg-[#f4d44d] hover:text-black md:px-10"><span>Report an incident</span><span>hello@tracify.tech</span></a>
    </main>;
}
