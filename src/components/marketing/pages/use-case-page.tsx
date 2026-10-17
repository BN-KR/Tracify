"use client";

import { ArtBand, CapabilityGrid, EndCta, PageHero, SignalTicker, StickyStory, type CapsVariant, type HeroVariant, type StoryLook } from "./page-kit";
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
  coding: {
    lead: "Coding agents edit files, run tests and try again. Trace every edit and every test run so a broken patch points back to the step that caused it.",
    hero: "/images/pages/coding-hero.png",
    band: "/images/landing/uc-coding.png",
    eyebrow: "Use case / Coding agents",
    facts: [["Edits", "Recorded"], ["Test runs", "Linked"], ["Retries", "Counted"]],
    kicker: "Edit and test loop",
    story: "The step where the patch went wrong.",
    flagTag: "failed",
    cta: "Trace a coding agent.",
    rows: [
      { label: "Task received", note: "“Fix the date bug in the invoice export.”" },
      { label: "Repo searched", note: "Six files read, two edited." },
      { label: "Patch written", note: "One change in the export function." },
      { label: "Test failed", note: "One test fails on a leap-year date.", flag: true },
      { label: "Retry with the error", note: "The error is sent back and the patch is rewritten." },
    ],
    steps: [
      "Each task starts a trace so every later step can be judged against it.",
      "See which files the agent read before it edited anything.",
      "Edits are spans, so a change and its reason sit side by side.",
      "A failing test is attached to the exact patch that produced it.",
      "Retries show what the agent changed after seeing the error, and what it cost.",
    ],
  },
  rag: {
    lead: "A RAG app can sound sure while using the wrong document. Trace the query, the chunks and the answer together, and a bad source is a visible step.",
    hero: "/images/pages/rag-hero.png",
    band: "/images/landing/uc-rag.png",
    eyebrow: "Use case / RAG apps",
    facts: [["Chunks", "Per answer"], ["Ranking", "Visible"], ["Grounding", "Checked"]],
    kicker: "Retrieval record",
    story: "Which chunk the answer came from.",
    flagTag: "off-topic",
    cta: "Trace a RAG run.",
    rows: [
      { label: "Question embedded", note: "“What is the refund window for annual plans?”" },
      { label: "Top 8 chunks fetched", note: "Scores from 0.82 down to 0.61." },
      { label: "Off-topic chunk ranked", note: "A 2022 pricing page ranks above the policy.", flag: true },
      { label: "Answer generated", note: "The reply quotes the older page." },
      { label: "Source shown", note: "The chunk used is stored next to the answer." },
    ],
    steps: [
      "The run starts with the question so retrieval can be judged against it.",
      "See the chunks the model was handed, with their scores.",
      "A wrong chunk is a flagged step, not a mystery in the final text.",
      "The answer is stored next to the context that produced it.",
      "Show or log the source so a reviewer can check it in seconds.",
    ],
  },
  voice: {
    lead: "Voice agents live or die by delay. Time each turn through speech recognition, the model and speech output, and the slow step is obvious.",
    hero: "/images/pages/voice-hero.png",
    band: "/images/landing/uc-voice.png",
    eyebrow: "Use case / Voice agents",
    facts: [["Turns", "Timed"], ["First token", "Measured"], ["Tool waits", "Visible"]],
    kicker: "Turn timeline",
    story: "Where the pause came from.",
    flagTag: "slow",
    cta: "Trace a voice call.",
    rows: [
      { label: "Caller speaks", note: "Audio received, 3.2 seconds long." },
      { label: "Transcript ready", note: "Speech recognition took 410 ms." },
      { label: "Model thinking", note: "First token after 700 ms." },
      { label: "Tool wait", note: "Order lookup took 1.9 seconds.", flag: true },
      { label: "Reply spoken", note: "Speech output started after a long gap." },
    ],
    steps: [
      "Each call is a trace with one run per turn.",
      "Recognition time is separate from model time.",
      "Time to first token tells you how fast the reply started.",
      "A slow tool call shows up as the longest bar in the turn.",
      "Compare turns to see which ones callers waited on.",
    ],
  },
  browser: {
    lead: "Browser agents click, type and wait on pages that change. Record each action so a missed click or a stuck loop is easy to find.",
    hero: "/images/pages/browser-hero.png",
    band: "/images/landing/uc-browser.png",
    eyebrow: "Use case / Browser agents",
    facts: [["Actions", "Recorded"], ["Retries", "Counted"], ["Time on page", "Measured"]],
    kicker: "Action log",
    story: "What the agent did on the page.",
    flagTag: "missed",
    cta: "Trace a browser run.",
    rows: [
      { label: "Page opened", note: "Booking page loaded in 1.2 seconds." },
      { label: "Form located", note: "Date and party size found." },
      { label: "Click missed", note: "The submit button had moved.", flag: true },
      { label: "Same click repeated", note: "Four more tries, same target." },
      { label: "Run stopped", note: "Step budget reached." },
    ],
    steps: [
      "Each run starts with the goal the agent was given.",
      "Page loads are spans with their own timing.",
      "A missed click is flagged with the selector that was used.",
      "Repeated actions are the loop, counted and costed.",
      "The run ends with a clear reason instead of a silent timeout.",
    ],
  },
  "multi-agent": {
    lead: "When several agents share a job, failures hide between them. Keep every agent in one trace and each handoff becomes a step you can inspect.",
    hero: "/images/pages/multi-agent-hero.png",
    band: "/images/landing/uc-multi-agent.png",
    eyebrow: "Use case / Multi-agent systems",
    facts: [["Handoffs", "Traced"], ["Agents", "One trace"], ["Loops", "Detected"]],
    kicker: "Handoff map",
    story: "Where the work stopped moving.",
    flagTag: "dropped",
    cta: "Trace a multi-agent run.",
    rows: [
      { label: "Planner starts", note: "Goal split into three tasks." },
      { label: "Work split", note: "Three workers start in parallel." },
      { label: "Worker returns", note: "Two of three results arrive." },
      { label: "Handoff dropped", note: "The third result never reaches the reviewer.", flag: true },
      { label: "Run times out", note: "The reviewer waits for a result that never comes." },
    ],
    steps: [
      "Every agent in the run reports into the same trace.",
      "Splits and parallel work show up as sibling spans.",
      "Each result is linked to the agent that produced it.",
      "A missing handoff is the gap in the tree.",
      "Cost and time can be read per agent, not just per run.",
    ],
  },
  mcp: {
    lead: "MCP lets an agent reach many tools. Trace each server call with its arguments, result and timing so one slow or failing server does not hide.",
    hero: "/images/pages/mcp-hero.png",
    band: "/images/landing/uc-mcp.png",
    eyebrow: "Use case / MCP servers",
    facts: [["Servers", "Per call"], ["Arguments", "Recorded"], ["Latency", "Measured"]],
    kicker: "Tool call record",
    story: "Which server was slow.",
    flagTag: "timed out",
    cta: "Trace MCP tool calls.",
    rows: [
      { label: "Tools listed", note: "Seven tools across three servers." },
      { label: "Tool chosen", note: "search_tickets from the support server." },
      { label: "Server called", note: "Arguments sent as the model wrote them." },
      { label: "Call timed out", note: "No answer after 30 seconds.", flag: true },
      { label: "Fallback used", note: "The agent answered without the tool." },
    ],
    steps: [
      "The run records which tools were available.",
      "Tool choice is its own span, separate from the call.",
      "Arguments are stored exactly as the model produced them.",
      "Timeouts name the server and tool that caused them.",
      "Fallbacks show what the agent did without the answer.",
    ],
  },
};



const all: [string, string][] = [
  ["Research agents", "/use-cases/research"],
  ["Support agents", "/use-cases/support"],
  ["Automation agents", "/use-cases/automation"],
  ["Tool-calling agents", "/use-cases/tool-calling"],
  ["Coding agents", "/use-cases/coding"],
  ["RAG apps", "/use-cases/rag"],
  ["Voice agents", "/use-cases/voice"],
  ["Browser agents", "/use-cases/browser"],
  ["Multi-agent systems", "/use-cases/multi-agent"],
  ["MCP servers", "/use-cases/mcp"],
];

const looks: Record<string, { hero: HeroVariant; story: StoryLook; caps: CapsVariant; order: readonly ("story" | "code" | "band" | "caps")[]; band?: { flip?: boolean; dark?: boolean } }> = {
  research: { hero: "paper", story: { side: "right" }, caps: "sticky", order: ["story", "code", "band", "caps"] },
  support: { hero: "left", story: { side: "stack", tone: "yellow" }, caps: "rows", order: ["band", "story", "caps", "code"], band: { dark: true } },
  automation: { hero: "full", story: { side: "left" }, caps: "cards", order: ["story", "caps", "band", "code"], band: { flip: true } },
  coding: { hero: "split", story: { side: "left" }, caps: "rows", order: ["story", "code", "band", "caps"], band: { dark: true } },
  rag: { hero: "paper", story: { side: "stack", tone: "yellow" }, caps: "cards", order: ["band", "story", "caps", "code"], band: { flip: true } },
  voice: { hero: "split", story: { side: "right" }, caps: "sticky", order: ["story", "caps", "code", "band"], band: { dark: true } },
  browser: { hero: "left", story: { side: "stack" }, caps: "rows", order: ["code", "story", "band", "caps"], band: { flip: true } },
  "multi-agent": { hero: "split", story: { side: "right" }, caps: "cards", order: ["story", "caps", "band", "code"], band: { dark: true, flip: true } },
  mcp: { hero: "paper", story: { side: "left" }, caps: "sticky", order: ["band", "story", "code", "caps"], band: { flip: true } },
  "tool-calling": { hero: "split", story: { side: "stack" }, caps: "sticky", order: ["code", "story", "band", "caps"], band: { dark: true, flip: true } },
};

export function UseCasePage({ slug, page }: { slug: string; page: UseCaseData }) {
  const c = config[slug];
  const look = looks[slug];
  const signals = page.signals.map((s) => {
    const [title, ...rest] = s.split(" — ");
    return { title, body: rest.join(" — ") || "Recorded on every run, so it can be searched, compared and alerted on." };
  });
  const steps = page.scene.map((t, i) => ({ title: t, body: c.steps[i] }));
  const blocks = {
    story: <StickyStory key="story" kicker={c.kicker} heading={c.story} steps={steps} look={look.story} stage={(s) => <ChainStage {...s} rows={c.rows} title={page.title} flagTag={c.flagTag} meter={c.meter} />} />,
    code: <CodeSection key="code" snippet={snippets[slug]} />,
    band: <ArtBand key="band" img={c.band} label="The failure to catch" statement={page.failure} aside={page.description} {...look.band} />,
    caps: <CapabilityGrid key="caps" heading="What Tracify watches." items={signals} variant={look.caps} />,
  };
  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={page.statement} lead={c.lead} img={c.hero} facts={c.facts} primary={["Start tracing free", "/sign-up"]} secondary={["Read the docs", "/docs"]} variant={look.hero} />
      <SignalTicker items={page.signals.map((s) => s.split(" — ")[0])} />
      {look.order.map((k) => blocks[k])}
      <EndCta heading={c.cta} links={all.filter(([, h]) => !h.endsWith(slug))} />
    </>
  );
}
