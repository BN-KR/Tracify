import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Database, Sparkles, Wrench } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { getTracifyRegion } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Explore or build with Tracify",
  description: "Open a populated Tracify Sandbox or create a live regional project.",
  robots: { index: false, follow: false },
};

export default function CloudModePage() {
  const region = getTracifyRegion();
  return <main className="min-h-screen bg-[#eceae3] text-black selection:bg-[#f4d44d]">
    <header className="flex h-[54px] items-center justify-between border-b border-black px-5 md:px-8"><Link href="https://www.tracify.tech" aria-label="Tracify home"><BrandLogo /></Link><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/45">Cloud directory / step 02 of 02</span></header>
    <div className="mx-auto grid min-h-[calc(100vh-54px)] max-w-[1440px] lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
      <aside className="flex flex-col justify-between border-b border-black bg-black p-6 text-white sm:p-8 md:p-10 lg:border-b-0 lg:border-r"><div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-white/45"><span>{region.flag} {region.name} cloud</span><Database className="size-5 text-[#f4d44d]" /></div><div className="my-14 lg:my-0"><h1 className="max-w-3xl font-pixel text-[clamp(4rem,7vw,7.5rem)] leading-[0.8] tracking-[-0.075em]">Choose your path.</h1><p className="mt-8 max-w-xl text-base leading-7 text-white/60">Explore a populated read-only Tracify workspace, or build a live project in {region.location}.</p></div><Link href="/cloud" className="inline-flex items-center gap-2 border-t border-white/20 pt-5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/55 hover:text-white"><ArrowLeft className="size-4" /> Change region</Link></aside>
      <section className="flex items-center px-5 py-10 sm:px-8 md:px-12 lg:px-16"><div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <Link href="/playground" className="group border border-black bg-[#f4d44d] p-6 hover:bg-black hover:text-white"><Sparkles className="size-7" /><span className="mt-12 block font-pixel text-4xl leading-none tracking-[-0.055em]">Sandbox</span><span className="mt-4 block text-sm leading-6 text-black/65 group-hover:text-white/65">Open the populated Tracify demo. No account or live telemetry required.</span><span className="mt-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">Open playground <ArrowRight className="size-4" /></span></Link>
        <Link href="/sign-up?intent=build&redirect_url=%2Fonboarding" className="group border border-black bg-white p-6 hover:bg-[#f4d44d]"><Wrench className="size-7" /><span className="mt-12 block font-pixel text-4xl leading-none tracking-[-0.055em]">Build</span><span className="mt-4 block text-sm leading-6 text-black/65">Create a real project, API key, and regional telemetry boundary.</span><span className="mt-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">Start building <ArrowRight className="size-4" /></span></Link>
      </div></section>
    </div>
  </main>;
}
