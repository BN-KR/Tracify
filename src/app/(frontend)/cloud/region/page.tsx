import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Globe2, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { getAvailableRegions } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Choose your Tracify region",
  description: "Choose the regional cloud for your Tracify account and telemetry.",
  robots: { index: false, follow: false },
};

export default async function CloudRegionStep({ searchParams }: { searchParams: Promise<{ next?: string; intent?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/sign-in";
  const intent = params.intent === "explore" || params.intent === "build" ? params.intent : "build";
  const regions = getAvailableRegions();
  return (
    <main className="min-h-screen bg-[#eceae3] text-black selection:bg-[#f4d44d]">
      <header className="flex h-[54px] items-center justify-between border-b border-black px-5 md:px-8">
        <Link href="https://www.tracify.tech" aria-label="Tracify home"><BrandLogo /></Link>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/45">Cloud directory / step 02 of 02</span>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-54px)] max-w-[1440px] lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <aside className="flex flex-col justify-between border-b border-black bg-black p-6 text-white sm:p-8 md:p-10 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-white/45"><span>Regional cloud</span><Globe2 className="size-5 text-[#f4d44d]" /></div>
          <div className="my-14 lg:my-0"><h1 className="max-w-3xl font-pixel text-[clamp(4rem,7vw,7.5rem)] leading-[0.8] tracking-[-0.075em]">Choose your region.</h1><p className="mt-8 max-w-xl text-base leading-7 text-white/60">This is step two. Select where your account and telemetry will live.</p></div>
          <div className="border-t border-white/20 pt-5 text-xs leading-6 text-white/55">Regions are isolated. Choosing another region does not move an existing account or its data.</div>
        </aside>
        <section className="flex items-center px-5 py-10 sm:px-8 md:px-12 lg:px-16"><div className="w-full max-w-3xl">
          <div className="mb-7 grid gap-4 border-y border-black py-5 sm:grid-cols-2"><Fact icon={ShieldCheck} label="Regional boundary" /><Fact icon={Globe2} label={intent === "explore" ? "Explore access" : "Build destination"} /></div>
          <div className="border border-black bg-white">{regions.map((region) => <Link key={region.id} href={`/api/region/select?region=${region.id}&next=${encodeURIComponent(next)}&intent=${intent}`} className="group grid min-h-32 grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-black p-5 last:border-b-0 hover:bg-[#f4d44d] sm:grid-cols-[80px_1fr_auto] sm:p-7"><span className="text-3xl" aria-hidden="true">{region.flag}</span><span><span className="block font-pixel text-4xl leading-none tracking-[-0.055em]">{region.name}</span><span className="mt-3 block font-mono text-[9px] uppercase tracking-[0.1em] text-black/50">{region.hostname} · {region.location} · {region.infrastructure}</span></span><ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></Link>)}</div>
          <Link href="/cloud" className="mt-6 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-black/55 hover:text-black"><ArrowLeft className="size-4" /> Back to path</Link>
          {process.env.NODE_ENV !== "production" ? <Link href={`/api/region/select?region=eu&next=${encodeURIComponent("/tracify-preview")}&intent=explore`} className="mt-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-black/55 hover:text-black"><span>Preview dashboard after EU region</span><ArrowRight className="size-4" /></Link> : null}
        </div></section>
      </div>
    </main>
  );
}

function Fact({ icon: Icon, label }: { icon: typeof Globe2; label: string }) { return <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em]"><Icon className="size-4" /><span>{label}</span></div>; }
