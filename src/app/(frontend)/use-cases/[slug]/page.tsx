import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { UseCasePage as UseCaseView } from "@/components/marketing/pages/use-case-page";

const useCases = {
  research: { title: "Research agents", statement: "Show the path from question to source.", description: "Trace browsing, extraction, synthesis, and citation decisions across long-running research workflows.", failure: "A plausible answer with an invisible evidence gap.", signals: ["Source retrieval", "Citation coverage", "Reasoning latency", "Model handoffs"], scene: ["Question received", "Search plan built", "12 sources opened", "3 claims unsupported", "Answer held for review"] },
  support: { title: "Support agents", statement: "Find the decision behind every escalation.", description: "Inspect conversations, tools, policy checks, and handoffs across customer support agents.", failure: "A confident resolution built on stale account context.", signals: ["Tool permissions — see which actions each role can invoke.", "Knowledge freshness — identify answers built on stale policy context.", "Escalation route — connect the handoff to the decision that caused it.", "Resolution quality — score whether the final answer solved the customer’s need."], scene: ["Ticket classified", "Account loaded", "Policy checked", "Refund tool blocked", "Human context attached"] },
  automation: { title: "Automation agents", statement: "Debug the chain, not the final error.", description: "Follow multi-step automations through retries, queues, fallbacks, and external side effects.", failure: "A retry that quietly performs the same action twice.", signals: ["Retry lineage", "Idempotency", "Queue latency", "Fallback outcome"], scene: ["Trigger accepted", "Plan compiled", "Tool timed out", "Fallback executed", "Duplicate prevented"] },
  "tool-calling": { title: "Tool-calling agents", statement: "See what the model asked the world to do.", description: "Catch invalid arguments, permission failures, loops, and hidden cost across tool-using agents.", failure: "A harmless-looking loop that turns into cost and latency.", signals: ["Arguments", "Tool result", "Loop count", "Token cost"], scene: ["Intent parsed", "Tool selected", "Schema rejected", "Arguments repaired", "Result verified"] },
  coding: { title: "Coding agents", statement: "Know why the patch failed the test.", description: "Trace planning, file edits, test runs and retries across coding agents so a broken change points back to the step that caused it.", failure: "A confident patch that quietly breaks a test it never ran.", signals: ["Edit and test loops", "Files touched", "Test outcome", "Tokens per fix"], scene: ["Task received", "Repo searched", "Patch written", "Test failed", "Retry with the error"] },
  rag: { title: "RAG apps", statement: "See which chunk the answer came from.", description: "Trace retrieval, ranking and generation so a wrong answer can be traced to the chunk, query or prompt that caused it.", failure: "A fluent answer built on the wrong document.", signals: ["Retrieved chunks", "Rank and score", "Context size", "Answer grounding"], scene: ["Question embedded", "Top 8 chunks fetched", "Off-topic chunk ranked", "Answer generated", "Source shown"] },
  voice: { title: "Voice agents", statement: "Find the pause that lost the caller.", description: "Trace speech recognition, model and speech output for each turn so slow or broken moments show up as steps, not guesses.", failure: "A two second silence that made the caller hang up.", signals: ["Turn latency", "Time to first token", "Interruptions", "Tool wait"], scene: ["Caller speaks", "Transcript ready", "Model thinking", "Tool wait", "Reply spoken"] },
  browser: { title: "Browser agents", statement: "Replay what the agent saw and clicked.", description: "Trace page loads, clicks, form fills and retries across browser agents so a stuck step is easy to find.", failure: "A click that missed its target and repeated until the budget ran out.", signals: ["Page steps", "Click targets", "Retries", "Time on page"], scene: ["Page opened", "Form located", "Click missed", "Same click repeated", "Run stopped"] },
  "multi-agent": { title: "Multi-agent systems", statement: "Follow the work from agent to agent.", description: "Trace every handoff between agents in one run so a dropped task or a loop between agents is visible.", failure: "A handoff that never arrived, so nobody finished the job.", signals: ["Handoffs", "Agent roles", "Loops between agents", "Cost per agent"], scene: ["Planner starts", "Work split", "Worker returns", "Handoff dropped", "Run times out"] },
  mcp: { title: "MCP servers", statement: "See which tools your agent really used.", description: "Trace calls to MCP servers and tools, with arguments, results and timing, so a slow or failing server is easy to spot.", failure: "One slow server stalling every run that touches it.", signals: ["Server and tool", "Arguments", "Call latency", "Errors"], scene: ["Tools listed", "Tool chosen", "Server called", "Call timed out", "Fallback used"] },
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
