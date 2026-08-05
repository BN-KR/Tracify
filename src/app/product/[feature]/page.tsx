import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

type Feature = {
  title: string;
  description: string;
  capabilities: string[];
};

const productFeatures: Record<string, Feature> = {
  "trace-viewer": {
    title: "Trace Viewer",
    description: "Inspect every tool call, LLM decision, and failure in your agent workflows.",
    capabilities: ["Nested span timelines", "Input and output inspection", "Error-first expansion", "Model and tool summaries"],
  },
  "cost-dashboard": {
    title: "Cost Dashboard",
    description: "See spend by run, model, tool, and span across your entire agent infrastructure.",
    capabilities: ["Range-based cost analysis", "Model and tool breakdowns", "Saved-run fallback totals", "Potential savings analysis"],
  },
  "tool-calls": {
    title: "Tool Calls",
    description: "Track external API and function calls made by your agents.",
    capabilities: ["Per-tool timing", "Input and output payloads", "Failure visibility", "Trace-level tool summaries"],
  },
  "llm-calls": {
    title: "LLM Calls",
    description: "Capture model, latency, tokens, and cost for every LLM interaction.",
    capabilities: ["Model attribution", "Latency measurement", "Cost per span", "Fallback-aware trace context"],
  },
  failures: {
    title: "Failures",
    description: "Surface errors, retries, stalls, and loops in your agent pipelines.",
    capabilities: ["Failed run alerts", "Retry metadata", "Duration thresholds", "Slack webhook notifications"],
  },
  reports: {
    title: "Project Reports",
    description: "Share a print-ready account of activity, cost, failures, and alerts with stakeholders.",
    capabilities: ["Run and cost totals", "Failed trace evidence", "Model and tool breakdowns", "Browser print workflow"],
  },
  "runtime-control": {
    title: "Runtime Control",
    description: "Configure cost ceilings, retry behavior, latency budgets, and model fallback chains from one policy surface.",
    capabilities: ["Observe and enforce modes", "Run and daily cost ceilings", "Ordered fallback chains", "Retry and backoff policy"],
  },
  "evaluation-engine": {
    title: "Evaluation Engine",
    description: "Measure the quality of live agent traffic and prompt changes with judges, deterministic checks, human review, and score-based monitors.",
    capabilities: ["LLM-as-judge and rule evaluators", "Versioned datasets and regression suites", "Human annotation and user feedback", "Groundedness and policy checks", "Score-based alerts for quality drift", "Trace-linked boolean, categorical, and numeric scores"],
  },
  lifecycle: {
    title: "AI Engineering Lifecycle",
    description: "Trace production behavior, evaluate quality, experiment on real datasets, and deploy improvements behind release gates.",
    capabilities: ["Trace and session inspection", "Prompt and dataset versioning", "Evaluator and human review workflows", "Experiment comparison and regression reports", "Gated production promotion", "Post-release quality monitoring"],
  },
};

export function generateStaticParams() {
  return Object.keys(productFeatures).map((feature) => ({ feature }));
}

export async function generateMetadata({ params }: { params: Promise<{ feature: string }> }): Promise<Metadata> {
  const { feature } = await params;
  const page = productFeatures[feature];
  return page
    ? { title: `${page.title} | tracify`, description: page.description }
    : { title: "Product | tracify" };
}

export default async function ProductFeaturePage({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature } = await params;
  const page = productFeatures[feature];
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="max-w-3xl">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Product</div>
          <h1 className="font-pixel text-4xl tracking-tight md:text-6xl">{page.title}</h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-zinc-400">{page.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/dashboard" className="bg-white px-5 py-3 font-mono text-xs uppercase tracking-widest text-black transition-transform active:scale-[0.98]">Open dashboard</Link>
            <Link href="/roadmap" className="border border-zinc-700 px-5 py-3 font-mono text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:border-white hover:text-white">View roadmap</Link>
          </div>
        </div>
        <section className="mt-20 border-t border-zinc-800 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Available now</h2>
          <div className="mt-6 grid gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-2">
            {page.capabilities.map((capability) => (
              <div key={capability} className="bg-[#0a0a0a] p-6 font-mono text-sm text-zinc-200">{capability}</div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
