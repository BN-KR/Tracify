import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, Circle } from "lucide-react";

type Feature = {
  title: string;
  description: string;
  capabilities: string[];
};

const productFeatures: Record<string, Feature> = {
  "trace-viewer": {
    title: "Trace Viewer",
    description:
      "Inspect every tool call, LLM decision, and failure in your agent workflows.",
    capabilities: [
      "Nested span timelines",
      "Input and output inspection",
      "Error-first expansion",
      "Model and tool summaries",
    ],
  },
  "cost-dashboard": {
    title: "Cost Dashboard",
    description:
      "See spend by run, model, tool, and span across your entire agent infrastructure.",
    capabilities: [
      "Range-based cost analysis",
      "Model and tool breakdowns",
      "Saved-run fallback totals",
      "Potential savings analysis",
    ],
  },
  "tool-calls": {
    title: "Tool Calls",
    description: "Track external API and function calls made by your agents.",
    capabilities: [
      "Per-tool timing",
      "Input and output payloads",
      "Failure visibility",
      "Trace-level tool summaries",
    ],
  },
  "llm-calls": {
    title: "LLM Calls",
    description:
      "Capture model, latency, tokens, and cost for every LLM interaction.",
    capabilities: [
      "Model attribution",
      "Latency measurement",
      "Cost per span",
      "Fallback-aware trace context",
    ],
  },
  failures: {
    title: "Failures",
    description:
      "Surface errors, retries, stalls, and loops in your agent pipelines.",
    capabilities: [
      "Failed run alerts",
      "Retry metadata",
      "Duration thresholds",
      "Slack webhook notifications",
    ],
  },
  reports: {
    title: "Project Reports",
    description:
      "Share a print-ready account of activity, cost, failures, and alerts with stakeholders.",
    capabilities: [
      "Run and cost totals",
      "Failed trace evidence",
      "Model and tool breakdowns",
      "Browser print workflow",
    ],
  },
  "runtime-control": {
    title: "Runtime Control",
    description:
      "Configure cost ceilings, retry behavior, latency budgets, and model fallback chains from one policy surface.",
    capabilities: [
      "Observe and enforce modes",
      "Run and daily cost ceilings",
      "Ordered fallback chains",
      "Retry and backoff policy",
    ],
  },
  "evaluation-engine": {
    title: "Evaluation Engine",
    description:
      "Measure the quality of live agent traffic and prompt changes with judges, deterministic checks, human review, and score-based monitors.",
    capabilities: [
      "LLM-as-judge and rule evaluators",
      "Versioned datasets and regression suites",
      "Human annotation and user feedback",
      "Groundedness and policy checks",
      "Score-based alerts for quality drift",
      "Trace-linked boolean, categorical, and numeric scores",
    ],
  },
  lifecycle: {
    title: "AI Engineering Lifecycle",
    description:
      "Trace production behavior, evaluate quality, experiment on real datasets, and deploy improvements behind release gates.",
    capabilities: [
      "Trace and session inspection",
      "Prompt and dataset versioning",
      "Evaluator and human review workflows",
      "Experiment comparison and regression reports",
      "Gated production promotion",
      "Post-release quality monitoring",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(productFeatures).map((feature) => ({ feature }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ feature: string }>;
}): Promise<Metadata> {
  const { feature } = await params;
  const page = productFeatures[feature];
  return page
    ? { title: page.title, description: page.description, alternates: { canonical: `/product/${feature}` } }
    : { title: "Product" };
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
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="max-w-3xl">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            Product
          </div>
          <h1 className="font-pixel text-4xl tracking-tight md:text-6xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-zinc-400">
            {page.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="bg-white px-5 py-3 font-mono text-xs uppercase tracking-widest text-black transition-transform active:scale-[0.98]"
            >
              Open dashboard
            </Link>
            <Link
              href="/roadmap"
              className="border border-zinc-700 px-5 py-3 font-mono text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:border-white hover:text-white"
            >
              View roadmap
            </Link>
          </div>
        </div>
        <section className="mt-20 border-t border-zinc-800 pt-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Inside the workflow
              </p>
              <h2 className="mt-4 font-sans text-3xl tracking-tight text-white md:text-4xl">
                A surface built around evidence.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-zinc-500">
                Every Tracify surface keeps the operational context next to the
                decision: what happened, what changed, and what to do next.
              </p>
              <Link
                href="/demo"
                className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white hover:text-zinc-300"
              >
                Open the sample project <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <div className="border border-zinc-800 bg-[#0a0a0a]">
              <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {page.title} / live evidence
                </span>
                <span className="font-mono text-[10px] uppercase text-zinc-600">
                  updated now
                </span>
              </div>
              <div className="grid gap-px bg-zinc-800 sm:grid-cols-2">
                {page.capabilities.slice(0, 4).map((capability, index) => (
                  <div key={capability} className="bg-[#0a0a0a] p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-widest text-zinc-600">
                        0{index + 1}
                      </span>
                      <Circle className="size-3 fill-zinc-600 text-zinc-600" />
                    </div>
                    <p className="mt-8 font-mono text-xs uppercase tracking-widest text-zinc-200">
                      {capability}
                    </p>
                    <p className="mt-3 text-xs leading-6 text-zinc-600">
                      Captured alongside the trace that made this signal useful.
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 px-5 py-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  trace context · cost · quality
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300">
                  ready to inspect
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-20 border-t border-zinc-800 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">
            Available now
          </h2>
          <div className="mt-6 grid gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-2">
            {page.capabilities.map((capability) => (
              <div
                key={capability}
                className="flex items-center gap-3 bg-[#0a0a0a] p-6 font-mono text-sm text-zinc-200"
              >
                <Check className="size-3 text-white" />
                {capability}
              </div>
            ))}
          </div>
        </section>
        <section className="mt-20 border-y border-zinc-800 py-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Next step
              </p>
              <h2 className="mt-3 font-sans text-3xl tracking-tight text-white">
                Bring one real run.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-zinc-500">
                Start with the workflow you need to understand today, then
                connect the rest of the lifecycle when the evidence is ready.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-white px-5 py-3 font-mono text-xs uppercase tracking-widest text-black hover:bg-zinc-200"
            >
              Start tracing <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
