import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FutureAction, FutureBand, FuturePage } from "@/components/marketing/future19-page";

const useCases = {
  research: { title: "Research agents", statement: "Show the path from question to source.", description: "Trace browsing, extraction, synthesis, and citation decisions across long-running research workflows.", failure: "A plausible answer with an invisible evidence gap.", signals: ["Source retrieval", "Citation coverage", "Reasoning latency", "Model handoffs"], scene: ["Question received", "Search plan built", "12 sources opened", "3 claims unsupported", "Answer held for review"] },
  support: { title: "Support agents", statement: "Find the decision behind every escalation.", description: "Inspect conversations, tools, policy checks, and handoffs across customer support agents.", failure: "A confident resolution built on stale account context.", signals: ["Tool permissions — see which actions each role can invoke.", "Knowledge freshness — identify answers built on stale policy context.", "Escalation route — connect the handoff to the decision that caused it.", "Resolution quality — score whether the final answer solved the customer’s need."], scene: ["Ticket classified", "Account loaded", "Policy checked", "Refund tool blocked", "Human context attached"] },
  automation: { title: "Automation agents", statement: "Debug the chain, not the final error.", description: "Follow multi-step automations through retries, queues, fallbacks, and external side effects.", failure: "A retry that quietly performs the same action twice.", signals: ["Retry lineage", "Idempotency", "Queue latency", "Fallback outcome"], scene: ["Trigger accepted", "Plan compiled", "Tool timed out", "Fallback executed", "Duplicate prevented"] },
  "tool-calling": { title: "Tool-calling agents", statement: "See what the model asked the world to do.", description: "Catch invalid arguments, permission failures, loops, and hidden cost across tool-using agents.", failure: "A harmless-looking loop that turns into cost and latency.", signals: ["Arguments", "Tool result", "Loop count", "Token cost"], scene: ["Intent parsed", "Tool selected", "Schema rejected", "Arguments repaired", "Result verified"] },
} as const;

type Slug = keyof typeof useCases;
export function generateStaticParams() { return Object.keys(useCases).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const page = useCases[slug as Slug]; return page ? { title: `${page.title} observability`, description: page.description, alternates: { canonical: `/use-cases/${slug}` } } : {}; }

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const page = useCases[slug as Slug]; if (!page) notFound();
  const caseIndex = Object.keys(useCases).indexOf(slug);
  const caseMarks = ["?", "↗", "⟳", "{}"];
  const reverse = caseIndex % 2 === 1;
  return <FuturePage>
    <header className={`border-b border-black ${caseIndex === 1 ? "bg-black text-white" : caseIndex === 2 ? "bg-[#f4d44d]" : "bg-[#eceae3]"}`}><div className="mx-auto max-w-[1240px] border-x border-current"><div className={`grid min-h-[420px] md:grid-cols-[minmax(0,1fr)_300px] ${reverse ? "md:grid-cols-[300px_minmax(0,1fr)]" : ""}`}>
      <div className={`flex flex-col justify-between px-5 py-10 sm:px-8 md:px-10 md:py-12 ${reverse ? "md:order-2 md:border-l" : "md:border-r"}`}><p className="font-mono text-[9px] uppercase tracking-[0.15em] opacity-50">Use case / {page.title}</p><h1 className="my-8 font-pixel text-[clamp(3rem,6vw,5.25rem)] leading-[0.88] tracking-[-0.055em]">{page.statement}</h1><p className="max-w-xl text-base leading-7 opacity-70">{page.description}</p></div>
      <div className={`relative flex min-h-52 items-center justify-center overflow-hidden border-t border-current md:border-t-0 ${reverse ? "md:order-1" : ""} ${caseIndex === 1 ? "bg-[#f4d44d] text-black" : "bg-black text-white"}`}><span className="font-pixel text-[9rem] leading-none tracking-[-0.08em]">{caseMarks[caseIndex]}</span><div className="absolute inset-x-6 bottom-6 border-t border-current/30 pt-3 font-mono text-[8px] uppercase tracking-[0.13em]">Failure pattern / 0{caseIndex + 1}</div></div>
    </div></div></header>
    <FutureBand label="Failure anatomy"><div className={`grid md:grid-cols-[0.8fr_1.2fr] ${reverse ? "md:grid-cols-[1.2fr_0.8fr]" : ""}`}>
      <div className={`border-black bg-[#f4d44d] p-7 md:p-10 ${reverse ? "md:order-2 md:border-l" : "md:border-r"}`}><span className="font-mono text-[9px] uppercase tracking-[0.14em]">The expensive unknown</span><p className="mt-20 font-pixel text-5xl leading-[0.9] tracking-[-0.055em]">{page.failure}</p></div>
      <div className={`bg-black p-6 text-white md:p-10 ${reverse ? "md:order-1" : ""}`}><div className="flex items-center justify-between border-b border-white/20 pb-4 font-mono text-[8px] uppercase tracking-[0.13em] text-white/45"><span>Live execution tape</span><span>05 events</span></div><ol>{page.scene.map((item, index) => <li key={item} className="grid grid-cols-[42px_1fr_auto] items-center border-b border-white/15 py-5 font-mono text-[10px] uppercase tracking-[0.09em]"><span className="text-white/30">0{index + 1}</span><span>{item}</span><span className={`size-2 ${index === 3 ? "bg-[#f4d44d]" : "bg-white/25"}`} /></li>)}</ol></div>
    </div></FutureBand>
    <FutureBand label="Signals that matter"><div className="grid sm:grid-cols-2 lg:grid-cols-4">{page.signals.map((signal, index) => <div key={signal} className="min-h-48 border-b border-black p-6 odd:border-r sm:border-b-0 lg:border-r lg:last:border-r-0"><span className="font-pixel text-4xl text-black/18">0{index + 1}</span><h2 className="mt-14 font-mono text-[10px] uppercase tracking-[0.12em]">{signal}</h2></div>)}</div></FutureBand>
    <FutureBand tone="ink"><div className="flex flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-10"><p className="max-w-2xl font-pixel text-5xl leading-[0.88] tracking-[-0.06em] md:text-7xl">Put your own run on the tape.</p><FutureAction href="/sign-up" inverted>Start tracing free</FutureAction></div></FutureBand>
  </FuturePage>;
}
