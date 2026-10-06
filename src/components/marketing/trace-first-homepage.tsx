"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
} from "lucide-react";
import {
  LandingReveal,
  LandingHeroRunList,
  LandingTraceLandscape,
  LandingTraceProvider,
} from "@/components/marketing/landing-trace-record";

export function TraceFirstHomepage() {
  return (
    <main id="main-content" className="trace-home bg-[#08090a] pt-[50px] text-white">
      <LandingTraceProvider>
        <section aria-labelledby="home-title" className="trace-hero relative isolate min-h-[555px] overflow-hidden border-b border-white/20">
          <LandingTraceLandscape />
          <div className="trace-hero-copy absolute left-[3.6%] top-[7.2%] z-10 w-[min(35%,390px)] max-md:top-[8%] max-md:w-[82%]">
            <p className="trace-eyebrow">TRACIFY&nbsp; / &nbsp;AGENT TRACE</p>
            <h1 id="home-title" className="mt-5 max-w-[420px] font-sans text-[clamp(3.6rem,6.6vw,5.25rem)] font-normal leading-[.91] tracking-[-.065em]">See what<br />changed.</h1>
            <p className="mt-4 max-w-[310px] text-[14px] leading-[1.38] text-white/65">Every run leaves a trail.<br />Trace the model, tool, and retrieval<br className="max-md:hidden" /> decisions — and find where to look next.</p>
            <Link href="/demo" className="mt-5 inline-flex h-[35px] min-w-[154px] items-center justify-between gap-5 bg-white px-4 font-mono text-[9px] uppercase tracking-[.12em] text-black transition-colors hover:bg-[#dedede] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">Explore a trace <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
          </div>

          <div className="trace-callout trace-callout-model"><span>MODEL</span><small>00.8s</small><small>gpt-4o</small></div>
          <div className="trace-callout trace-callout-tool"><span>TOOL</span><small>12.4s</small><small>web_search</small></div>
          <div className="trace-callout trace-callout-retrieval"><span>RETRIEVAL</span><small>28.1s</small><small>vector_search</small></div>
          <div className="trace-callout trace-callout-missing"><span>MISSING EVIDENCE</span><small>42.7s</small><small>no relevant results</small></div>

          <div className="trace-run-panel absolute right-[2.7%] top-[41%] z-20 w-[min(33%,390px)] max-md:bottom-[9%] max-md:left-[5%] max-md:right-[5%] max-md:top-auto max-md:w-auto">
            <div className="flex items-center justify-between border-b border-white/20 px-3 py-2.5 font-mono text-[8px] uppercase tracking-[.12em] text-white/55">
              <span>SAMPLE RUN&nbsp; / &nbsp;<span className="normal-case tracking-normal">customer-support-agent</span></span>
              <Link href="/demo" className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">View full trace <ArrowUpRight className="ml-1 inline size-2.5" aria-hidden="true" /></Link>
            </div>
            <LandingHeroRunList />
          </div>

          <div className="absolute bottom-3.5 left-[3.6%] z-10 flex items-center gap-3 font-mono text-[8px] uppercase tracking-[.12em] text-white/75"><span className="trace-scroll-arrow">↓</span> Scroll</div>
          <div className="absolute bottom-5 right-[3.5%] z-10 font-mono text-[7px] uppercase tracking-[.14em] text-white/50 max-md:hidden">OBSERVE&nbsp; / &nbsp;DEBUG&nbsp; / &nbsp;IMPROVE&nbsp; ▪</div>
        </section>

        <section aria-labelledby="home-steps-title" className="trace-steps px-[3.7%] pb-7 pt-7 sm:pb-8 sm:pt-8">
          <LandingReveal className="mx-auto max-w-[1440px]">
            <div className="flex items-end justify-between gap-8 max-md:flex-col max-md:items-start max-md:gap-3">
              <div><p className="trace-eyebrow">A CLOSER LOOK</p><h2 id="home-steps-title" className="mt-2 max-w-[620px] font-sans text-[clamp(1.7rem,3vw,2.35rem)] font-normal leading-[.99] tracking-[-.045em]">From question to answer,<br className="max-sm:hidden" /> step by step.</h2></div>
              <p className="mb-1 max-w-[260px] text-[13px] leading-[1.45] text-white/65">Inspect each step of an agent run.<br />See what it did, what it saw, and where<br className="max-md:hidden" /> to look next.</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:gap-2">
              <StepCard number="01" name="MODEL" summary="The agent reasons and plans its next step." label="THOUGHT"><p>User is asking about refund policy.<br />I should search for the latest policy information.</p><footer><span>gpt-4o</span><span>00.8s</span></footer></StepCard>
              <StepCard number="02" name="TOOL" summary="The agent takes action in the real world." label="WEB SEARCH"><div className="trace-search"><Search className="size-3" aria-hidden="true" /><span>refund policy site:example.com</span></div><p>1.&nbsp; example.com/refunds<br />2.&nbsp; help.example.com/policies<br />3.&nbsp; support.example.com/returns</p><footer><span /> <span>12.4s</span></footer></StepCard>
              <StepCard number="03" name="RETRIEVAL" summary="The agent looks up relevant context." label="VECTOR SEARCH"><p>Query:&nbsp; refund policy</p><p>3 chunks retrieved<br />#1&nbsp; Refund Policy&nbsp; (0.72)<br />#2&nbsp; Returns and Exchanges&nbsp; (0.68)<br />#3&nbsp; Billing Support&nbsp; (0.61)</p><footer><span /> <span>28.1s</span></footer></StepCard>
            </div>
          </LandingReveal>
        </section>

        <section aria-labelledby="home-evidence-title" className="trace-evidence mx-[2.4%] mt-0 border border-white/20 px-[2.8%] py-5">
          <LandingReveal className="grid grid-cols-[.72fr_1.28fr] items-center gap-8 max-md:grid-cols-1 max-md:gap-5">
            <div>
              <p className="trace-eyebrow">EVIDENCE MATTERS</p>
              <h2 id="home-evidence-title" className="mt-2 max-w-[300px] font-sans text-[clamp(2rem,4vw,2.8rem)] font-normal leading-[.95] tracking-[-.055em]">Inspect<br />the evidence.</h2>
              <p className="mt-3 max-w-[300px] text-[13px] leading-[1.4] text-white/65">Open retrieved content, tool results,<br className="max-md:hidden" /> and model inputs. Verify what the agent<br className="max-md:hidden" /> saw and why it made its next decision.</p>
              <Link href="/demo" className="mt-3 inline-flex h-[31px] items-center gap-5 bg-white px-3 font-mono text-[8px] uppercase tracking-[.12em] text-black hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Explore a trace <ArrowRight className="size-3" aria-hidden="true" /></Link>
            </div>
            <div className="trace-evidence-card min-w-0 border border-white/25">
              <div className="flex items-center justify-between border-b border-white/20 px-3 py-2 font-mono text-[8px] uppercase tracking-[.12em] text-white/65"><span>RETRIEVED CHUNK&nbsp; #1</span><span>Relevance&nbsp; 0.72</span></div>
              <div className="grid grid-cols-[1.35fr_.65fr] max-sm:grid-cols-1">
                <div className="trace-code min-w-0 p-3 font-mono text-[9px] leading-[1.6] text-white/65"><p className="mb-3 text-white">## Refund Policy</p><p>We offer a 30-day money-back guarantee on all products purchased directly from our website. To be eligible for a refund, items must be unused and in their original packaging.</p><p className="mt-2">Refunds are typically processed within 5–7 business days after we receive the returned item.</p><p className="mt-2">For more information, visit our full policy page.</p></div>
                <div className="trace-paper relative min-h-[150px] overflow-hidden border-l border-white/25 max-sm:border-l-0 max-sm:border-t"><Image src="/media/refund-policy-paper.png" alt="Illustrative printed refund policy document" fill sizes="(max-width: 640px) 90vw, 220px" className="object-cover grayscale" /><span className="absolute bottom-8 left-2 bg-[#f0e854] px-2 py-1 font-mono text-[7px] uppercase text-black">Source</span><span className="absolute bottom-0 left-0 flex items-center gap-2 bg-black px-2 py-1.5 font-mono text-[8px] text-white">example.com/refunds <ArrowUpRight className="size-2.5" aria-hidden="true" /></span></div>
              </div>
            </div>
          </LandingReveal>
        </section>

        <section aria-labelledby="home-architecture-title" className="trace-architecture px-[3.8%] pb-5 pt-6">
          <LandingReveal className="mx-auto grid max-w-[1440px] grid-cols-[.72fr_1.28fr] items-center gap-8 max-md:grid-cols-1 max-md:gap-5">
            <div><p className="trace-eyebrow">BUILT AROUND THE RUN</p><h2 id="home-architecture-title" className="mt-2 max-w-[330px] font-sans text-[clamp(2rem,3.8vw,2.65rem)] font-normal leading-[.96] tracking-[-.055em]">A complete view<br />of your agents.</h2><p className="mt-3 max-w-[340px] text-[13px] leading-[1.45] text-white/60">Tracify captures every step — from model calls<br className="max-md:hidden" /> to tool usage to retrieval — and keeps the full<br className="max-md:hidden" /> trace, so you can debug, evaluate, and<br className="max-md:hidden" /> improve with confidence.</p><Link href="/product/trace-viewer" className="mt-4 inline-flex items-center gap-2 border-b border-white/55 pb-1 font-mono text-[8px] uppercase tracking-[.12em] hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Explore the architecture <ArrowRight className="size-3" aria-hidden="true" /></Link></div>
            <div className="trace-architecture-map">
              <div className="trace-architecture-labels"><MapLabel title="AGENT" text="Runs in production" /><MapLabel title="TRACES" text="Captures every step" /><MapLabel title="STORAGE" text="Indexes artifacts" /><MapLabel title="INSIGHTS" text="Find what changed" /></div>
              <div className="trace-architecture-flow"><Image src="/media/tracify-architecture-map.png" alt="Illustrative agent trace architecture from run to trace layers, indexed storage, and insights" fill sizes="(max-width: 767px) 100vw, 60vw" className="object-contain" /></div>
            </div>
          </LandingReveal>
        </section>

        <footer className="trace-footer flex min-h-[48px] items-center justify-between border-t border-white/20 px-[3.8%] font-mono text-[7px] uppercase tracking-[.13em] text-white/55">
          <Link href="/" className="font-sans text-[20px] font-medium lowercase tracking-[-.07em] text-white">tracify</Link><span className="max-sm:hidden">AGENT OBSERVABILITY&nbsp; / &nbsp;BUILT AROUND THE RUN</span><nav aria-label="Footer" className="flex items-center gap-5"><Link href="/docs">Docs</Link><Link href="/status">Status</Link><Link href="/contact">Contact</Link></nav>
        </footer>
      </LandingTraceProvider>
    </main>
  );
}

function StepCard({ number, name, summary, label, children }: { number: string; name: string; summary: string; label: string; children: React.ReactNode }) {
  return <article className="trace-step-card min-w-0"><div className="flex items-start gap-4"><span className="font-mono text-[26px] leading-none text-white/85">{number}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-3 border-b border-white/30 pb-1.5"><h3 className="font-mono text-[10px] tracking-[.12em]">{name}</h3><span className="h-px flex-1 bg-white/20" /></div><p className="mt-2 min-h-[34px] max-w-[220px] text-[12px] leading-[1.3] text-white/60">{summary}</p></div></div><div className="trace-step-ui mt-2.5 flex min-h-[132px] flex-col border border-white/30 px-4 py-3"><span className="flex items-center gap-2 font-mono text-[8px] tracking-[.12em]"><span className="size-1.5 border border-white/45" />{label}</span><div className="mt-3 flex-1 font-mono text-[9px] leading-[1.55] text-white/55">{children}</div></div></article>;
}

function MapLabel({ title, text }: { title: string; text: string }) {
  return <div><p className="font-mono text-[8px] tracking-[.1em]">{title}</p><p className="mt-1 text-[10px] text-white/55">{text}</p></div>;
}
