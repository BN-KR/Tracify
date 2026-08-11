import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FutureAction, FutureBand, FutureMasthead, FuturePage } from "@/components/marketing/future19-page";

const useCases = {
  research: { title: "Research agents", statement: "Show the path from question to source.", description: "Trace browsing, extraction, synthesis, and citation decisions across long-running research workflows.", failure: "A plausible answer with an invisible evidence gap.", signals: ["Source retrieval", "Citation coverage", "Reasoning latency", "Model handoffs"], scene: ["Question received", "Search plan built", "12 sources opened", "3 claims unsupported", "Answer held for review"] },
  support: { title: "Support agents", statement: "Find the decision behind every escalation.", description: "Inspect conversations, tools, policy checks, and handoffs across customer support agents.", failure: "A confident resolution built on stale account context.", signals: ["Tool permissions", "Knowledge freshness", "Escalation route", "Resolution quality"], scene: ["Ticket classified", "Account loaded", "Policy checked", "Refund tool blocked", "Human context attached"] },
  automation: { title: "Automation agents", statement: "Debug the chain, not the final error.", description: "Follow multi-step automations through retries, queues, fallbacks, and external side effects.", failure: "A retry that quietly performs the same action twice.", signals: ["Retry lineage", "Idempotency", "Queue latency", "Fallback outcome"], scene: ["Trigger accepted", "Plan compiled", "Tool timed out", "Fallback executed", "Duplicate prevented"] },
  "tool-calling": { title: "Tool-calling agents", statement: "See what the model asked the world to do.", description: "Catch invalid arguments, permission failures, loops, and hidden cost across tool-using agents.", failure: "A harmless-looking loop that turns into cost and latency.", signals: ["Arguments", "Tool result", "Loop count", "Token cost"], scene: ["Intent parsed", "Tool selected", "Schema rejected", "Arguments repaired", "Result verified"] },
} as const;

type Slug = keyof typeof useCases;
export function generateStaticParams() { return Object.keys(useCases).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const page = useCases[slug as Slug]; return page ? { title: `${page.title} observability`, description: page.description, alternates: { canonical: `/use-cases/${slug}` } } : {}; }

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const page = useCases[slug as Slug]; if (!page) notFound();
  return <FuturePage><FutureMasthead eyebrow={`Use case / ${page.title}`} title={page.statement} description={page.description} index="U19" />
    <FutureBand label="Failure anatomy"><div className="grid md:grid-cols-[0.8fr_1.2fr]">
      <div className="border-black bg-[#f4d44d] p-7 md:border-r md:p-10"><span className="font-mono text-[9px] uppercase tracking-[0.14em]">The expensive unknown</span><p className="mt-20 font-pixel text-5xl leading-[0.9] tracking-[-0.055em]">{page.failure}</p></div>
      <div className="bg-black p-6 text-white md:p-10"><div className="flex items-center justify-between border-b border-white/20 pb-4 font-mono text-[8px] uppercase tracking-[0.13em] text-white/45"><span>Live execution tape</span><span>05 events</span></div><ol>{page.scene.map((item, index) => <li key={item} className="grid grid-cols-[42px_1fr_auto] items-center border-b border-white/15 py-5 font-mono text-[10px] uppercase tracking-[0.09em]"><span className="text-white/30">0{index + 1}</span><span>{item}</span><span className={`size-2 ${index === 3 ? "bg-[#f4d44d]" : "bg-white/25"}`} /></li>)}</ol></div>
    </div></FutureBand>
    <FutureBand label="Signals that matter"><div className="grid sm:grid-cols-2 lg:grid-cols-4">{page.signals.map((signal, index) => <div key={signal} className="min-h-48 border-b border-black p-6 odd:border-r sm:border-b-0 lg:border-r lg:last:border-r-0"><span className="font-pixel text-4xl text-black/18">0{index + 1}</span><h2 className="mt-14 font-mono text-[10px] uppercase tracking-[0.12em]">{signal}</h2></div>)}</div></FutureBand>
    <FutureBand tone="ink"><div className="flex flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-10"><p className="max-w-2xl font-pixel text-5xl leading-[0.88] tracking-[-0.06em] md:text-7xl">Put your own run on the tape.</p><FutureAction href="/sign-up" inverted>Start tracing free</FutureAction></div></FutureBand>
  </FuturePage>;
}
