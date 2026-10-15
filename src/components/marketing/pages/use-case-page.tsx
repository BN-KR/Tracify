"use client";

import { ArtBand, CapabilityGrid, EndCta, PageHero, SignalTicker, StickyStory } from "./page-kit";
import { CodeSection, snippets } from "./code-section";
import { ChainStage, type ChainRow, type Meter } from "./stages";

export type UseCaseData = {
  title: string;
  statement: string;
  description: string;
  failure: string;
  signals: readonly string[];
  scene: readonly string[];
};

type Cfg = {
  lead: string;
  hero: string;
  band: string;
  eyebrow: string;
  facts: readonly (readonly [string, string])[];
  kicker: string;
  story: string;
  flagTag: string;
  rows: readonly ChainRow[];
  steps: readonly string[];
  meter?: Meter;
  cta: string;
};

const config: Record<string, Cfg> = {
  research: {
    lead: "Research agents write fluent answers whether or not the evidence is there. Trace every search, source and claim so an unsupported statement is a flagged step, not a surprise.",
    hero: "/images/pages/research-hero.png",
    band: "/images/landing/uc-research.png",
    eyebrow: "Use case / Research agents",
    facts: [["Sources", "Per claim"], ["Citations", "Checked"], ["Gaps", "Flagged"]],
    kicker: "Evidence trail",
    story: "Every claim needs a route back.",
    flagTag: "gap",
    cta: "Trace a research run.",
    rows: [
      { label: "Question received", note: "“Compare vendor refund policies for 2026.”" },
      { label: "Search plan built", note: "Four queries across docs and the open web." },
      { label: "12 sources opened", note: "Two paywalled, one outdated." },
      { label: "3 claims unsupported", note: "No source supports the 14-day window.", flag: true },
      { label: "Answer held for review", note: "Held until the gap is visible to a person." },
    ],
    steps: [
      "The run starts with the user's question, so every later step can be judged against it.",
      "See which queries the agent planned and which it quietly dropped.",
      "Each opened source is a span with its own timing, tokens and result.",
      "Claims with no source are marked, instead of hiding inside a fluent paragraph.",
      "Hold the answer, or ship it with the gap shown to the reader.",
    ],
  },
  support: {
    lead: "A support agent gives one answer and hides a dozen decisions. See the account data it had, the policy it checked, the tool it was blocked from and why it escalated.",
    hero: "/images/pages/support-hero.png",
    band: "/images/landing/uc-support.png",
    eyebrow: "Use case / Support agents",
    facts: [["Handoffs", "Explained"], ["Policy checks", "Recorded"], ["Context", "Attached"]],
    kicker: "Decision record",
    story: "The decision behind every escalation.",
    flagTag: "blocked",
    cta: "Trace the next escalation.",
    rows: [
      { label: "Ticket classified", note: "Billing · refund request · priority normal." },
      { label: "Account loaded", note: "Plan, last invoice and open tickets." },
      { label: "Policy checked", note: "Policy page last updated 11 months ago." },
      { label: "Refund tool blocked", note: "Role cannot issue refunds above $100.", flag: true },
      { label: "Human context attached", note: "Summary, tools tried and the blocker." },
    ],
    steps: [
      "Every ticket becomes a trace, so the first classification is on the record.",
      "See exactly which account data the agent had when it answered.",
      "Spot answers built on stale policy before a customer notices.",
      "Permissions are visible: which action was attempted and who stopped it.",
      "The human who takes over sees the whole path, not just the last message.",
    ],
  },
  automation: {
    lead: "Automations fail in the middle, retry, and sometimes do the same thing twice. Follow the whole chain, including retries, queues and fallbacks, to see what really ran.",
    hero: "/images/pages/automation-hero.png",
    band: "/images/landing/uc-automation.png",
    eyebrow: "Use case / Automation agents",
    facts: [["Retries", "Lineage"], ["Side effects", "Tracked"], ["Fallbacks", "Visible"]],
    kicker: "Execution chain",
    story: "Debug the chain, not the final error.",
    flagTag: "retry",
    cta: "Trace an automation.",
    meter: { label: "Duplicate side effects", to: 1, decimals: 0 },
    rows: [
      { label: "Trigger accepted", note: "Webhook from the billing system." },
      { label: "Plan compiled", note: "Eight steps, two external calls." },
      { label: "Tool timed out", note: "Retried with the same payload.", flag: true },
      { label: "Fallback executed", note: "Queue picked up the same job." },
      { label: "Duplicate prevented", note: "Idempotency key matched the first attempt." },
    ],
    steps: [
      "Each trigger starts a trace, so you can find the run behind any outcome.",
      "The compiled plan shows what the agent meant to do before anything happened.",
      "A timeout is just one span. The retry lineage shows what it caused next.",
      "Fallbacks are recorded with the step they replaced.",
      "Idempotency checks show whether the same action ran twice or was stopped.",
    ],
  },
  "tool-calling": {
    lead: "Models pick tools, invent arguments and loop. Record every call with its payload, result and cost so a rejected schema or a runaway loop stands out immediately.",
    hero: "/images/pages/tool-loop-hero.png",
    band: "/images/landing/uc-tools.png",
    eyebrow: "Use case / Tool-calling agents",
    facts: [["Arguments", "Recorded"], ["Loops", "Detected"], ["Cost", "Per call"]],
    kicker: "Payload inspector",
    story: "What the model asked the world to do.",
    flagTag: "rejected",
    cta: "Trace a tool call.",
    meter: { label: "Cost of the loop", to: 1.42, prefix: "$", decimals: 2 },
    rows: [
      { label: "Intent parsed", note: "“Refund the last order.”" },
      { label: "Tool selected", note: "issue_refund, chosen from nine tools." },
      { label: "Schema rejected", note: "currency must be lowercase.", flag: true },
      { label: "Arguments repaired", note: "Retried four times before it worked." },
      { label: "Result verified", note: "Refund confirmed, run cost $1.42." },
    ],
    steps: [
      "Start from what the user asked and which tool the model reached for.",
      "Selection is its own span, so wrong tool and wrong arguments are separate problems.",
      "Schema failures show the exact payload that was rejected.",
      "Repeated repairs are the loop. Count them and see what each one cost.",
      "The final result is checked against the call that produced it.",
    ],
  },
};



const all: [string, string][] = [
  ["Research agents", "/use-cases/research"],
  ["Support agents", "/use-cases/support"],
  ["Automation agents", "/use-cases/automation"],
  ["Tool-calling agents", "/use-cases/tool-calling"],
];

export function UseCasePage({ slug, page }: { slug: string; page: UseCaseData }) {
  const c = config[slug];
  const signals = page.signals.map((s) => {
    const [title, ...rest] = s.split(" — ");
    return { title, body: rest.join(" — ") || "Recorded on every run, so it can be searched, compared and alerted on." };
  });
  const steps = page.scene.map((t, i) => ({ title: t, body: c.steps[i] }));
  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={page.statement} lead={c.lead} img={c.hero} facts={c.facts} primary={["Start tracing free", "/sign-up"]} secondary={["Read the docs", "/docs"]} />
      <SignalTicker items={page.signals.map((s) => s.split(" — ")[0])} />
      <StickyStory kicker={c.kicker} heading={c.story} steps={steps} stage={(s) => <ChainStage {...s} rows={c.rows} title={page.title} flagTag={c.flagTag} meter={c.meter} />} />
      <CodeSection snippet={snippets[slug]} />
      <ArtBand img={c.band} label="The failure to catch" statement={page.failure} aside={page.description} />
      <CapabilityGrid heading="What Tracify watches." items={signals} />
      <EndCta heading={c.cta} links={all.filter(([, h]) => !h.endsWith(slug))} />
    </>
  );
}
