import type { Metadata } from "next";
import Link from "next/link";
import { FutureAction, FutureBand, FutureMasthead, FuturePage } from "@/components/marketing/future19-page";

type Term = {
  slug: string;
  term: string;
  definition: string;
  expansion: string;
  related: readonly string[];
};

const terms: readonly Term[] = [
  {
    slug: "llm-observability",
    term: "LLM observability",
    definition:
      "LLM observability is the practice of recording traces, model calls, tool calls, cost, latency, and errors for LLM-powered applications so their behavior can be inspected and debugged in production.",
    expansion:
      "Unlike traditional application logging, LLM observability keeps prompts, model outputs, token usage, and quality evidence attached to the run that produced them, since a single user-visible answer can depend on several chained model and tool calls.",
    related: ["ai-agent-trace", "llm-tracing", "tool-call"],
  },
  {
    slug: "ai-agent-trace",
    term: "AI agent trace",
    definition:
      "An AI agent trace is the complete recorded execution path of a single agent run, from the initial request through every model call, tool call, and retry, down to the final output.",
    expansion:
      "A trace is made of spans: individual operations such as one model generation or one tool call, each with its own timing, inputs, outputs, and status. Traces let engineers move from a bad final answer to the exact operation that produced it.",
    related: ["llm-observability", "span", "tool-call"],
  },
  {
    slug: "span",
    term: "Span",
    definition:
      "A span is a single recorded operation inside a trace, such as one model call, one tool call, or one retrieval step, with its own start time, duration, inputs, outputs, and status.",
    expansion:
      "Spans nest inside a parent trace, forming a timeline or graph. Parallel work, handoffs between agents, and repeated operations all show up as sibling or child spans under the same run.",
    related: ["ai-agent-trace", "llm-tracing"],
  },
  {
    slug: "tool-call",
    term: "Tool call",
    definition:
      "A tool call is an action an AI agent takes outside the language model itself, such as a search, database query, browser action, or API request, recorded with its arguments, result, latency, and failure state.",
    expansion:
      "Tool calls are attached to the reasoning span that selected them, which makes it possible to tell whether a bad outcome came from the agent choosing the wrong tool or from the tool itself failing.",
    related: ["ai-agent-trace", "agent-evaluation"],
  },
  {
    slug: "llm-tracing",
    term: "LLM tracing",
    definition:
      "LLM tracing is the technique of recording the sequence of model and tool calls behind a single AI agent response so it can be replayed and inspected step by step.",
    expansion:
      "LLM tracing typically builds on distributed tracing concepts (spans, parent-child relationships) extended with AI-specific fields: tokens, cost, model identity, prompt and completion payloads, and time to first token.",
    related: ["llm-observability", "ai-agent-trace", "time-to-first-token"],
  },
  {
    slug: "agent-evaluation",
    term: "Agent evaluation",
    definition:
      "Agent evaluation is the practice of scoring AI agent behavior against versioned datasets using deterministic or model-based evaluators, instead of relying on manual spot checks.",
    expansion:
      "Evaluations can run offline, over a fixed dataset before a release, or online, scoring live production traces continuously. Both modes attach a repeatable score to a specific version of the agent, prompt, or model being tested.",
    related: ["tool-call", "ai-engineering-lifecycle"],
  },
  {
    slug: "time-to-first-token",
    term: "Time to first token (TTFT)",
    definition:
      "Time to first token is the delay between sending a request to a language model and receiving the first streamed token of its response.",
    expansion:
      "TTFT is tracked separately from total call latency because it drives perceived responsiveness in streaming interfaces, even when total generation time is unchanged.",
    related: ["llm-tracing"],
  },
  {
    slug: "ai-engineering-lifecycle",
    term: "AI engineering lifecycle",
    definition:
      "The AI engineering lifecycle is the loop from observing production agent behavior, to curating datasets from that behavior, to running experiments, to releasing and monitoring the result.",
    expansion:
      "The lifecycle closes the gap between production evidence and the next release: a trace or user signal becomes a dataset case, the case evaluates a candidate change, and the release is then monitored against the same evaluation criteria.",
    related: ["agent-evaluation", "llm-observability"],
  },
] as const;

export const metadata: Metadata = {
  title: "AI Observability Glossary — Tracify",
  description:
    "Plain-language definitions of LLM observability, AI agent tracing, spans, tool calls, and agent evaluation terms used across the Tracify platform.",
  alternates: { canonical: "/glossary" },
};

function GlossarySchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "AI Observability Glossary",
    url: "https://www.tracify.tech/glossary",
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `https://www.tracify.tech/glossary#${t.slug}`,
      name: t.term,
      description: t.definition,
      inDefinedTermSet: "https://www.tracify.tech/glossary",
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function GlossaryPage() {
  return (
    <FuturePage>
      <GlossarySchema />
      <FutureMasthead
        eyebrow="Reference / definitions"
        title="AI observability glossary"
        description="Short, direct definitions for the terms used across agent tracing, LLM observability, and evaluation — written to be quoted, not just read."
      />
      <FutureBand label="Terms">
        <div className="divide-y divide-black border-x border-black">
          {terms.map((t) => (
            <article key={t.slug} id={t.slug} className="scroll-mt-24 p-6 md:p-10">
              <h2 className="font-pixel text-3xl leading-none tracking-[-0.04em] md:text-4xl">{t.term}</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-black/75">{t.definition}</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-black/55">{t.expansion}</p>
              {t.related.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-black/45">
                  <span>Related:</span>
                  {t.related.map((slug) => (
                    <Link key={slug} href={`/glossary#${slug}`} className="underline decoration-[#d1af18] decoration-2 underline-offset-4 hover:text-black">
                      {terms.find((x) => x.slug === slug)?.term ?? slug}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </FutureBand>
      <FutureBand tone="ink" label="Go deeper">
        <div className="grid border-x border-white/20 md:grid-cols-[1fr_360px]">
          <div className="p-7 md:p-10">
            <p className="max-w-3xl font-pixel text-5xl leading-[0.9] tracking-[-0.055em] md:text-7xl">
              See these terms as live traces, not just definitions.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <FutureAction href="/demo" inverted>
                Open the demo
              </FutureAction>
              <FutureAction href="/docs" inverted>
                Read the docs
              </FutureAction>
            </div>
          </div>
          <nav aria-label="Related reading" className="border-t border-white/20 md:border-l md:border-t-0">
            <Link href="/product/trace-viewer" className="flex min-h-24 items-center px-6 font-mono text-[9px] uppercase tracking-[0.12em] border-b border-white/20 hover:bg-[#f4d44d] hover:text-black">
              Trace viewer
            </Link>
            <Link href="/blog/what-is-ai-observability" className="flex min-h-24 items-center px-6 font-mono text-[9px] uppercase tracking-[0.12em] border-b border-white/20 hover:bg-[#f4d44d] hover:text-black">
              What is AI observability?
            </Link>
            <Link href="/blog/llm-tracing-explained" className="flex min-h-24 items-center px-6 font-mono text-[9px] uppercase tracking-[0.12em] hover:bg-[#f4d44d] hover:text-black">
              LLM tracing explained
            </Link>
          </nav>
        </div>
      </FutureBand>
    </FuturePage>
  );
}
