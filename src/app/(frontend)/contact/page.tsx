import type { Metadata } from "next";
import Link from "next/link";
import { FutureAction, FutureBand, FuturePage } from "@/components/marketing/future19-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Tracify about agent observability, runtime control, and enterprise deployment.",
  alternates: { canonical: "/contact" },
};

const routes = [
  ["Enterprise", "Architecture, security, procurement, and rollout planning.", "hello@tracify.tech"],
  ["Product", "Migration questions, design partnerships, and workflow reviews.", "hello@tracify.tech"],
  ["Security", "Responsible disclosure and data-handling questions.", "security@tracify.tech"],
] as const;

export default function ContactPage() {
  return (
    <FuturePage>
      <header className="border-b border-black bg-[#f4d44d]">
        <div className="mx-auto max-w-[1240px] border-x border-black">
          <div className="flex items-center justify-between border-b border-black px-5 py-3 font-mono text-[8px] uppercase tracking-[0.15em] sm:px-8"><span>Open channel / 01</span><span>Human replies only</span></div>
          <div className="grid md:grid-cols-[1fr_220px]">
          <div className="px-5 py-10 sm:px-8 md:px-10 md:py-12"><h1 className="max-w-3xl font-pixel text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.055em]">Bring the messy agent.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-black/68">Send the stack, the failure mode, and the release decision your team cannot make yet.</p><p className="mt-5 max-w-xl border-l-2 border-black pl-4 font-mono text-[10px] uppercase tracking-[0.12em]">Trace clinic: 30 minutes · one real trace · root-cause map · release-gate recommendation</p></div>
            <div className="flex min-h-64 items-center justify-center border-t border-black bg-[#eceae3] p-8 md:border-l md:border-t-0"><a href="mailto:hello@tracify.tech" className="group flex aspect-square w-full max-w-40 rotate-6 flex-col items-center justify-center border-2 border-black bg-white text-center shadow-[10px_10px_0_#000] transition-transform hover:rotate-0"><span className="font-pixel text-5xl">@</span><span className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em]">Open mail</span></a></div>
          </div>
          <a href="mailto:hello@tracify.tech" className="block overflow-hidden border-t border-black bg-black py-4 text-white"><span className="block whitespace-nowrap font-pixel text-[clamp(2rem,5vw,5rem)] leading-none tracking-[-0.04em] text-[#f4d44d]">HELLO@TRACIFY.TECH → HELLO@TRACIFY.TECH →</span></a>
        </div>
      </header>
      <FutureBand label="Route your conversation">
        <div className="grid md:grid-cols-[0.8fr_1.2fr]">
          <div className="border-black bg-[#f4d44d] p-7 md:border-r md:p-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em]">Response protocol</p>
            <p className="mt-28 max-w-xs font-pixel text-5xl leading-[0.88] tracking-[-0.06em]">Context in. Useful answer out.</p>
            <p className="mt-6 text-sm leading-6 text-black/60">Include your runtime, agent framework, approximate trace volume, and the moment where confidence breaks down.</p>
          </div>
          <div>
            {routes.map(([title, body, email], index) => (
              <a key={title} href={`mailto:${email}?subject=${encodeURIComponent(`Tracify ${title} inquiry`)}`} className="group grid min-h-40 border-b border-black p-6 last:border-b-0 hover:bg-white/55 sm:grid-cols-[64px_1fr_auto] sm:items-center sm:gap-6 md:px-10">
                <span className="font-pixel text-4xl text-black/20">0{index + 1}</span>
                <span><strong className="font-pixel text-3xl tracking-[-0.04em]">{title}</strong><span className="mt-2 block max-w-lg text-sm leading-6 text-black/55">{body}</span></span>
                <span className="mt-5 font-mono text-[9px] uppercase tracking-[0.12em] underline decoration-[#d1af18] decoration-2 underline-offset-4 group-hover:no-underline sm:mt-0">Write to us ↗</span>
              </a>
            ))}
          </div>
        </div>
      </FutureBand>
      <FutureBand tone="ink" label="Prefer to explore first">
        <div className="flex flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between md:px-10">
          <p className="max-w-2xl font-pixel text-5xl leading-[0.88] tracking-[-0.06em] md:text-7xl">See the operating model before we talk.</p>
          <div className="flex flex-wrap gap-3"><FutureAction href="/demo" inverted>Open product demo</FutureAction><Link href="/security" className="inline-flex min-h-12 items-center border border-white/30 px-5 font-mono text-[9px] uppercase tracking-[0.13em] hover:border-[#f4d44d] hover:text-[#f4d44d]">Review security</Link></div>
        </div>
      </FutureBand>
    </FuturePage>
  );
}
