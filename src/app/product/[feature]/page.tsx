import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FutureAction, FutureBand, FutureMasthead, FuturePage } from "@/components/marketing/future19-page";

const productFeatures = {
  "trace-viewer": ["Trace Viewer", "Inspect every tool call, LLM decision, and failure in your agent workflows.", ["Nested span timelines", "Input and output inspection", "Error-first expansion", "Model and tool summaries"]],
  "cost-dashboard": ["Cost Dashboard", "See spend by run, model, tool, and span across your entire agent infrastructure.", ["Range-based cost analysis", "Model and tool breakdowns", "Saved-run fallback totals", "Potential savings analysis"]],
  "tool-calls": ["Tool Calls", "Track external API and function calls made by your agents.", ["Per-tool timing", "Input and output payloads", "Failure visibility", "Trace-level tool summaries"]],
  "llm-calls": ["LLM Calls", "Capture model, latency, tokens, and cost for every LLM interaction.", ["Model attribution", "Latency measurement", "Cost per span", "Fallback-aware trace context"]],
  failures: ["Failures", "Surface errors, retries, stalls, and loops in your agent pipelines.", ["Failed run alerts", "Retry metadata", "Duration thresholds", "Slack webhook notifications"]],
  reports: ["Project Reports", "Share a print-ready account of activity, cost, failures, and alerts with stakeholders.", ["Run and cost totals", "Failed trace evidence", "Model and tool breakdowns", "Browser print workflow"]],
  "runtime-control": ["Runtime Control", "Configure cost ceilings, retry behavior, latency budgets, and model fallback chains from one policy surface.", ["Observe and enforce modes", "Run and daily cost ceilings", "Ordered fallback chains", "Retry and backoff policy"]],
  "evaluation-engine": ["Evaluation Engine", "Measure live agent traffic and prompt changes with judges, deterministic checks, human review, and score-based monitors.", ["LLM-as-judge and rule evaluators", "Versioned datasets and regression suites", "Human annotation and user feedback", "Groundedness and policy checks", "Quality drift alerts", "Trace-linked typed scores"]],
  lifecycle: ["AI Engineering Lifecycle", "Trace production behavior, evaluate quality, experiment on real datasets, and deploy improvements behind release gates.", ["Trace and session inspection", "Prompt and dataset versioning", "Evaluator and human review workflows", "Experiment comparison", "Gated production promotion", "Post-release monitoring"]],
} as const;

type Feature = keyof typeof productFeatures;
export function generateStaticParams() { return Object.keys(productFeatures).map((feature) => ({ feature })); }
export async function generateMetadata({ params }: { params: Promise<{ feature: string }> }): Promise<Metadata> { const { feature } = await params; const page = productFeatures[feature as Feature]; return page ? { title: page[0], description: page[1], alternates: { canonical: `/product/${feature}` } } : { title: "Product" }; }

export default async function ProductFeaturePage({ params }: { params: Promise<{ feature: string }> }) {
  const { feature } = await params; const page = productFeatures[feature as Feature]; if (!page) notFound(); const [title, description, capabilities] = page;
  return <FuturePage>
    <FutureMasthead eyebrow={`Product / ${title}`} title={title} description={description} index="X19" />
    <FutureBand label="Capability instrument"><div className="grid border-x border-black md:grid-cols-[0.7fr_1.3fr]"><div className="border-black bg-[#f4d44d] p-7 md:border-r md:p-10"><p className="font-mono text-[9px] uppercase tracking-[0.14em]">What it changes</p><p className="mt-28 font-pixel text-5xl leading-[0.88] tracking-[-0.06em]">Turn runtime behavior into a record your team can act on.</p></div><ol className="bg-black text-white">{capabilities.map((capability, index) => <li key={capability} className="grid min-h-24 grid-cols-[56px_1fr_auto] items-center border-b border-white/15 px-5 last:border-b-0"><span className="font-pixel text-3xl text-white/20">0{index + 1}</span><span className="text-sm">{capability}</span><span className="size-2 bg-[#f4d44d]" /></li>)}</ol></div></FutureBand>
    <FutureBand label="Evidence loop"><div className="grid border-x border-black sm:grid-cols-2 lg:grid-cols-4">{["Capture", "Inspect", "Compare", "Act"].map((step, index) => <div key={step} className="min-h-52 border-b border-black p-6 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"><span className="font-pixel text-5xl text-black/16">0{index + 1}</span><h2 className="mt-20 font-mono text-[10px] uppercase tracking-[0.13em]">{step}</h2></div>)}</div></FutureBand>
    <FutureBand tone="signal"><div className="flex flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-10"><p className="max-w-3xl font-pixel text-6xl leading-[0.86] tracking-[-0.065em] md:text-8xl">See it on a real agent run.</p><div className="flex flex-wrap gap-3"><FutureAction href="/demo">Open the demo</FutureAction><FutureAction href="/sign-up">Start free</FutureAction></div></div></FutureBand>
  </FuturePage>;
}
