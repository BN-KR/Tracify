import type { Metadata } from "next";
import Link from "next/link";
import { FutureAction, FutureBand, FutureMasthead, FuturePage } from "@/components/marketing/future19-page";

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
      <FutureMasthead eyebrow="Company / Contact" title={<>Bring the messy agent.</>} description="Send us the stack, the failure mode, and what your team needs to trust before release. We will start with the operational problem—not a sales script." index="C01" />
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
