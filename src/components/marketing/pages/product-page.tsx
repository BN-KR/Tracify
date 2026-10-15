"use client";

import { ArtBand, CapabilityGrid, EndCta, Faq, PageHero, SignalTicker, StickyStory } from "./page-kit";
import { CostStage, FailureStage, ModelStage, ToolStage, TraceStage } from "./stages";

export type ProductPageData = {
  title: string;
  description: string;
  outcome: string;
  bestFor: string;
  details: readonly { title: string; body: string }[];
  workflow: readonly { title: string; body: string }[];
  faq: readonly { q: string; a: string }[];
  related: readonly string[];
};

const config = {
  "trace-viewer": {
    hero: "/images/pages/trace-hero.png",
    band: "/images/landing/span-anatomy.png",
    eyebrow: "Product / Trace viewer",
    headline: "Every step of one run.",
    facts: [["Spans per run", "Hundreds"], ["Retries", "Visible"], ["Payloads", "Inline"]],
    ticker: ["agent.run", "llm.plan", "tool.search", "retry", "llm.answer", "fallback"],
    kicker: "Debug one run",
    story: "Watch the run play back.",
    Stage: TraceStage,
    statement: "From a wrong answer to the exact span.",
  },
  "cost-dashboard": {
    hero: "/images/pages/cost-hero.png",
    band: "/images/landing/cost-city.png",
    eyebrow: "Product / Cost dashboard",
    headline: "Know where the money went.",
    facts: [["Granularity", "Per step"], ["Retry cost", "Separated"], ["Models", "Ranked"]],
    ticker: ["by day", "by run", "by model", "by tool", "retries", "fallbacks"],
    kicker: "Explain the bill",
    story: "Follow a spike to its cause.",
    Stage: CostStage,
    statement: "One retry loop can triple a bill.",
  },
  "tool-calls": {
    hero: "/images/pages/tools-hero.png",
    band: "/images/landing/capture-streams.png",
    eyebrow: "Product / Tool calls",
    headline: "Every action, inspectable.",
    facts: [["Arguments", "Recorded"], ["Results", "Recorded"], ["Failures", "Flagged"]],
    ticker: ["search", "database", "browser", "api call", "internal function", "schema check"],
    kicker: "Tell the failures apart",
    story: "Was it the agent or the tool?",
    Stage: ToolStage,
    statement: "Bad reasoning or a broken integration?",
  },
  "llm-calls": {
    hero: "/images/pages/models-hero.png",
    band: "/images/landing/globe-orbits.png",
    eyebrow: "Product / LLM calls",
    headline: "Model behavior you can measure.",
    facts: [["Tokens", "In and out"], ["Latency", "+ first token"], ["Cost", "Per call"]],
    ticker: ["model", "prompt", "tokens in", "tokens out", "latency", "first token", "cost"],
    kicker: "Compare generations",
    story: "Judge the call, not just the answer.",
    Stage: ModelStage,
    statement: "Which generation changed the result?",
  },
  failures: {
    hero: "/images/pages/failures-hero.png",
    band: "/images/landing/failure-shatter.png",
    eyebrow: "Product / Failure analysis",
    headline: "Find the first crack.",
    facts: [["Alerts", "To Slack"], ["Retries", "Counted"], ["Cause", "Traced"]],
    ticker: ["error span", "retry storm", "latency breach", "fallback", "alert", "first crack"],
    kicker: "Alert to cause",
    story: "Failures start earlier than they show.",
    Stage: FailureStage,
    statement: "The error shows up late. The cause is earlier.",
  },
} as const;

export type ProductSlug = keyof typeof config;


const names: Record<string, [string, string]> = {
  "trace-viewer": ["Trace viewer", "/product/trace-viewer"],
  "cost-dashboard": ["Cost dashboard", "/product/cost-dashboard"],
  "tool-calls": ["Tool calls", "/product/tool-calls"],
  "llm-calls": ["LLM calls", "/product/llm-calls"],
  failures: ["Failure analysis", "/product/failures"],
};

export function ProductPage({ slug, page }: { slug: ProductSlug; page: ProductPageData }) {
  const c = config[slug];
  const Stage = c.Stage;
  const others = (Object.keys(names) as string[]).filter((k) => k !== slug).map((k) => names[k]);
  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.headline} lead={page.description} img={c.hero} facts={c.facts} primary={["Start tracing free", "/sign-up"]} secondary={["Read the docs", "/docs"]} />
      <SignalTicker items={c.ticker} />
      <StickyStory kicker={c.kicker} heading={c.story} steps={page.workflow} stage={(s) => <Stage {...s} />} />
      <CapabilityGrid heading={page.outcome} items={page.details} />
      <ArtBand img={c.band} label="Who it is for" statement={c.statement} aside={page.bestFor} />
      <Faq items={page.faq} />
      <EndCta heading="See your own runs like this." links={others} />
    </>
  );
}
