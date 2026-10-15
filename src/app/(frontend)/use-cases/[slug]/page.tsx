import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { UseCasePage as UseCaseView } from "@/components/marketing/pages/use-case-page";

const useCases = {
  research: { title: "Research agents", statement: "Show the path from question to source.", description: "Trace browsing, extraction, synthesis, and citation decisions across long-running research workflows.", failure: "A plausible answer with an invisible evidence gap.", signals: ["Source retrieval", "Citation coverage", "Reasoning latency", "Model handoffs"], scene: ["Question received", "Search plan built", "12 sources opened", "3 claims unsupported", "Answer held for review"] },
  support: { title: "Support agents", statement: "Find the decision behind every escalation.", description: "Inspect conversations, tools, policy checks, and handoffs across customer support agents.", failure: "A confident resolution built on stale account context.", signals: ["Tool permissions — see which actions each role can invoke.", "Knowledge freshness — identify answers built on stale policy context.", "Escalation route — connect the handoff to the decision that caused it.", "Resolution quality — score whether the final answer solved the customer’s need."], scene: ["Ticket classified", "Account loaded", "Policy checked", "Refund tool blocked", "Human context attached"] },
  automation: { title: "Automation agents", statement: "Debug the chain, not the final error.", description: "Follow multi-step automations through retries, queues, fallbacks, and external side effects.", failure: "A retry that quietly performs the same action twice.", signals: ["Retry lineage", "Idempotency", "Queue latency", "Fallback outcome"], scene: ["Trigger accepted", "Plan compiled", "Tool timed out", "Fallback executed", "Duplicate prevented"] },
  "tool-calling": { title: "Tool-calling agents", statement: "See what the model asked the world to do.", description: "Catch invalid arguments, permission failures, loops, and hidden cost across tool-using agents.", failure: "A harmless-looking loop that turns into cost and latency.", signals: ["Arguments", "Tool result", "Loop count", "Token cost"], scene: ["Intent parsed", "Tool selected", "Schema rejected", "Arguments repaired", "Result verified"] },
} as const;

type Slug = keyof typeof useCases;

export function generateStaticParams() { return Object.keys(useCases).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const page = useCases[slug as Slug]; return page ? pageMetadata({ title: `${page.title} observability`, description: page.description, path: `/use-cases/${slug}` }) : {}; }

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = useCases[slug as Slug];
  if (!page) notFound();

  return <main className="overflow-x-clip bg-[#090909]"><UseCaseView slug={slug} page={page} /></main>;
}
