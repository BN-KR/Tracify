import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, Globe2, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { getAvailableRegions } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Explore or build with Tracify",
  description: "Explore a simulated Tracify workspace or choose a region for a real project.",
  alternates: { canonical: "/cloud" },
  robots: { index: false, follow: false },
};

export default async function CloudRegionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const requestedNext = (await searchParams).next;
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/sign-in";
  const regions = getAvailableRegions();

  return (
    <main className="min-h-screen bg-[#eceae3] text-black selection:bg-[#f4d44d]">
      <header className="flex h-[54px] items-center justify-between border-b border-black px-5 md:px-8">
        <Link href="https://www.tracify.tech" aria-label="Tracify home">
          <BrandLogo />
        </Link>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/45">Cloud directory / {String(regions.length).padStart(2, "0")} {regions.length === 1 ? "region" : "regions"}</span>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-54px)] max-w-[1440px] lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <aside className="flex flex-col justify-between border-b border-black bg-black p-6 text-white sm:p-8 md:p-10 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-white/45">
            <span>Regional cloud</span><Globe2 className="size-5 text-[#f4d44d]" />
          </div>
          <div className="my-14 lg:my-0">
            <h1 className="max-w-3xl font-pixel text-[clamp(4rem,7vw,7.5rem)] leading-[0.8] tracking-[-0.075em]">Choose your path.</h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-white/60">Explore the product with realistic simulated traces, or build a real project in a regional cloud.</p>
          </div>
          <div className="border-t border-white/20 pt-5 text-xs leading-6 text-white/55">Regions are isolated. Choosing another region does not move an existing account or its data.</div>
        </aside>

        <section className="flex items-center px-5 py-10 sm:px-8 md:px-12 lg:px-16">
          <div className="w-full max-w-3xl">
            <div className="mb-7 grid gap-4 border-y border-black py-5 sm:grid-cols-3">
              <Fact icon={Database} label="Isolated data" />
              <Fact icon={ShieldCheck} label="Regional boundary" />
              <Fact icon={Globe2} label="Closer access" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/api/region/select?region=eu&next=/playground" className="group border border-black bg-[#f4d44d] p-6 hover:bg-black hover:text-white">
                <Sparkles className="size-7" />
                <span className="mt-12 block font-pixel text-4xl leading-none tracking-[-0.055em]">Explore</span>
                <span className="mt-4 block text-sm leading-6 text-black/65 group-hover:text-white/65">Open a private, populated playground. No region or real telemetry required.</span>
                <span className="mt-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">Enter playground <ArrowRight className="size-4" /></span>
              </Link>
              <div className="border border-black bg-white p-6">
                <Wrench className="size-7" />
                <span className="mt-12 block font-pixel text-4xl leading-none tracking-[-0.055em]">Build</span>
                <span className="mt-4 block text-sm leading-6 text-black/65">Create a real project, API key, and regional telemetry boundary.</span>
                <span className="mt-8 block font-mono text-[9px] uppercase tracking-[0.12em] text-black/50">Choose a region below</span>
              </div>
            </div>
            <div className="mt-6 border border-black bg-white">
              {regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/api/region/select?region=${region.id}&next=${encodeURIComponent(next)}`}
                  className="group grid min-h-32 grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-black p-5 last:border-b-0 hover:bg-[#f4d44d] sm:grid-cols-[80px_1fr_auto] sm:p-7"
                >
                  <span className="text-3xl" aria-hidden="true">{region.flag}</span>
                  <span>
                    <span className="block font-pixel text-4xl leading-none tracking-[-0.055em]">{region.name}</span>
                    <span className="mt-3 block font-mono text-[9px] uppercase tracking-[0.1em] text-black/50">{region.hostname} · {region.location} · {region.infrastructure}</span>
                  </span>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm leading-6 text-black/55">Build uses the region where your account and telemetry will live. Explore is region-independent and uses simulated data only.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Fact({ icon: Icon, label }: { icon: typeof Database; label: string }) {
  return <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em]"><Icon className="size-4" /><span>{label}</span></div>;
}
