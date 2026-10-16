/**
 * Content for the /compare and /integrations/[slug] landing pages.
 * Competitor statements are deliberately high level and conservative; each page tells readers to check the other
 * product's own site for current details. Tracify statements must match the docs and pricing pages.
 */

export type Faq = { q: string; a: string };

export type Comparison = {
  slug: string;
  name: string;
  /** Blog post with the long-form comparison, if one exists. */
  post?: string;
  oneLine: string;
  theirs: string;
  pickThem: readonly string[];
  pickTracify: readonly string[];
  rows: readonly (readonly [string, string, string])[];
  faq: readonly Faq[];
};

const tracifyRows = {
  tracing: "Traces for agent runs, model calls and tool calls, ingested over OpenTelemetry (OTLP) or the TypeScript and Python SDKs",
  cost: "Cost, tokens and latency per run, with alerts",
  eval: "Evaluation datasets, scores and release gates in the same product",
  region: "EU region available",
} as const;

export const comparisons: readonly Comparison[] = [
  {
    slug: "langfuse",
    name: "Langfuse",
    post: "langfuse-vs-tracify",
    oneLine: "Langfuse is an open-source LLM engineering platform you can self-host. Tracify is a managed agent observability and evaluation platform.",
    theirs: "Open-source tracing, prompt management and evaluation that you can run on your own infrastructure or use as a hosted service.",
    pickThem: ["You must self-host everything and want to modify the source", "You already run the infrastructure it needs", "You want a large open-source community around the tool"],
    pickTracify: ["You want tracing, cost, alerts and evaluation managed for you", "You want to be sending traces in minutes with an SDK or plain OpenTelemetry", "You need an EU-hosted option without running servers"],
    rows: [
      ["Tracing", "Traces and spans for LLM apps and agents", tracifyRows.tracing],
      ["Hosting", "Self-host or hosted cloud", "Managed cloud; EU region available"],
      ["Cost tracking", "Token and cost tracking per generation", tracifyRows.cost],
      ["Evaluation", "Datasets, scores and evaluators", tracifyRows.eval],
      ["Open source", "Yes", "No; SDKs and docs are public"],
    ],
    faq: [
      { q: "Is Tracify an alternative to Langfuse?", a: "Yes. Both trace LLM applications and agents and track cost and quality. Langfuse is open source and can be self-hosted, while Tracify is a managed platform with an EU region and built-in alerts and evaluation." },
      { q: "Can I use OpenTelemetry with Tracify instead of a proprietary SDK?", a: "Yes. Tracify accepts spans over OTLP HTTP, so any OpenTelemetry-instrumented library can send traces. The TypeScript and Python SDKs are optional." },
    ],
  },
  {
    slug: "langsmith",
    name: "LangSmith",
    post: "langsmith-vs-tracify",
    oneLine: "LangSmith is the observability and evaluation product from the LangChain team. Tracify is framework-neutral and built around OpenTelemetry.",
    theirs: "Tracing, evaluation and prompt tooling made by the LangChain team, with the tightest fit for LangChain and LangGraph applications.",
    pickThem: ["Your stack is almost entirely LangChain or LangGraph", "You want tooling from the framework's own maintainers"],
    pickTracify: ["You use several frameworks or call model providers directly", "You want one standard (OpenTelemetry) rather than a framework-specific integration", "You need an EU-hosted option"],
    rows: [
      ["Tracing", "Traces for LLM apps, strongest for LangChain and LangGraph", tracifyRows.tracing],
      ["Framework fit", "Built by the LangChain team", "Framework-neutral; works with LangGraph, CrewAI, OpenAI, Anthropic and more"],
      ["Cost tracking", "Token and cost tracking", tracifyRows.cost],
      ["Evaluation", "Datasets and evaluators", tracifyRows.eval],
    ],
    faq: [
      { q: "Do I need LangChain to use Tracify?", a: "No. Tracify works with any code that emits OpenTelemetry spans, and wraps for OpenAI, Anthropic and LangGraph are in the docs." },
      { q: "Is Tracify a LangSmith alternative?", a: "Yes, for teams who want framework-neutral tracing, cost tracking and evaluation in one managed product." },
    ],
  },
  {
    slug: "helicone",
    name: "Helicone",
    oneLine: "Helicone focuses on logging and analytics for LLM requests, often through a proxy. Tracify focuses on whole agent runs, with evaluation and alerts.",
    theirs: "Request logging, caching and analytics for LLM API calls, commonly set up by routing traffic through its gateway.",
    pickThem: ["You mainly want request-level logs and analytics with a gateway in front of providers", "You want the simplest possible drop-in logging"],
    pickTracify: ["Your product is an agent, so you need the full run with its tool calls, not only single requests", "You want evaluation and release gates alongside traces", "You prefer SDK or OpenTelemetry instrumentation to a proxy in the request path"],
    rows: [
      ["Setup style", "Proxy or gateway in front of providers, or SDK", "SDK or OpenTelemetry; no proxy in your request path"],
      ["Unit of observation", "LLM requests and sessions", "Whole agent runs with nested model and tool calls"],
      ["Cost tracking", "Per-request cost analytics", tracifyRows.cost],
      ["Evaluation", "Basic scoring and experiments", tracifyRows.eval],
    ],
    faq: [{ q: "Does Tracify sit in the request path?", a: "No. Tracify receives traces after the work is done, so it cannot add latency or a failure point to your model calls." }],
  },
  {
    slug: "arize-phoenix",
    name: "Arize Phoenix",
    post: "arize-vs-tracify",
    oneLine: "Arize and Phoenix come from an ML observability background and offer open-source tracing. Tracify is built specifically for agent runs.",
    theirs: "ML and LLM observability from Arize, with the open-source Phoenix project for tracing and evaluation built on OpenTelemetry conventions.",
    pickThem: ["You also monitor classical ML models and want one vendor for both", "You want an open-source tool you run yourself"],
    pickTracify: ["Agents are your main workload and you want runs, tool calls and cost front and center", "You want a managed product with alerts, saved views and an EU region"],
    rows: [
      ["Focus", "ML observability and LLM tracing", "AI agent observability and evaluation"],
      ["Tracing", "OpenTelemetry-based tracing", tracifyRows.tracing],
      ["Cost tracking", "Token and cost tracking", tracifyRows.cost],
      ["Evaluation", "Evaluators and experiments", tracifyRows.eval],
    ],
    faq: [{ q: "Is Tracify built on OpenTelemetry?", a: "Tracify ingests OpenTelemetry (OTLP) spans, so instrumentation you write for one OpenTelemetry-compatible tool carries over." }],
  },
  {
    slug: "braintrust",
    name: "Braintrust",
    post: "braintrust-vs-tracify",
    oneLine: "Braintrust is centered on evaluation and experiments. Tracify starts from production traces and adds evaluation on top.",
    theirs: "An evaluation and experimentation platform with logging, datasets and scoring for AI products.",
    pickThem: ["Evaluation and experiment workflows are your top priority"],
    pickTracify: ["You want to start from what happened in production and turn traces into test cases", "You want cost, alerts and failure debugging in the same place as evals"],
    rows: [
      ["Starting point", "Evaluation and experiments", "Production traces, then evaluation"],
      ["Tracing", "Logging and tracing", tracifyRows.tracing],
      ["Cost tracking", "Cost per log and experiment", tracifyRows.cost],
      ["Alerts", "Monitoring and alerting features", "Rule-based alerts checked every 5 minutes, by email"],
    ],
    faq: [{ q: "Can I build evaluation datasets from production traces in Tracify?", a: "Yes. Traces can be turned into dataset cases so a real failure becomes a repeatable test. See the evaluation docs." }],
  },
  {
    slug: "datadog",
    name: "Datadog LLM Observability",
    post: "datadog-vs-tracify",
    oneLine: "Datadog adds LLM monitoring to a general infrastructure platform. Tracify is purpose-built for agents and priced for AI teams.",
    theirs: "LLM observability as part of Datadog's broader monitoring platform, useful if the rest of your stack already lives there.",
    pickThem: ["Your whole company already runs on Datadog and wants one pane of glass"],
    pickTracify: ["You want agent-specific views (runs, tool calls, retries, cost per task) rather than generic APM views", "You want evaluation and prompt tooling in the same product", "You want a focused tool for the AI team without a platform rollout"],
    rows: [
      ["Scope", "Full-stack monitoring platform with an LLM product", "Focused on AI agents"],
      ["Tracing", "LLM spans inside APM traces", tracifyRows.tracing],
      ["Cost tracking", "Token and cost metrics", tracifyRows.cost],
      ["Evaluation", "Quality evaluations", tracifyRows.eval],
    ],
    faq: [{ q: "Can I use Tracify and Datadog together?", a: "Yes. Teams often keep Datadog for infrastructure and use Tracify for agent behavior, cost and evaluation." }],
  },
] as const;

export type IntegrationPage = {
  slug: string;
  name: string;
  title: string;
  description: string;
  answer: string;
  captures: readonly string[];
  language: "typescript" | "python" | "bash";
  code: string;
  doc: string;
  faq: readonly Faq[];
};

export const integrationPages: readonly IntegrationPage[] = [
  {
    slug: "openai",
    name: "OpenAI",
    title: "Trace OpenAI calls",
    description: "Trace every OpenAI API call with model, tokens, latency and cost in Tracify using the TypeScript or Python SDK.",
    answer: "To trace OpenAI calls with Tracify, wrap your OpenAI client with the Tracify SDK. Each request is then recorded as a span with the model, token counts, latency, cost and any error.",
    captures: ["Model name and parameters", "Input, cached and output tokens", "Latency and errors", "Cost per call, rolled up to the run"],
    language: "typescript",
    code: `import OpenAI from "openai";
import { wrapOpenAI } from "tracify-sdk";

const openai = wrapOpenAI(new OpenAI());

const reply = await openai.responses.create({
  model: process.env.OPENAI_MODEL!,
  input: "Hello",
});`,
    doc: "provider-integrations",
    faq: [{ q: "Does tracing OpenAI calls change my responses?", a: "No. Tracify records each call and sends it to the backend; your request and response are unchanged." }],
  },
  {
    slug: "anthropic",
    name: "Anthropic Claude",
    title: "Trace Anthropic Claude calls",
    description: "Trace Claude API calls, tool use and streaming in Tracify with tokens, latency and cost.",
    answer: "To trace Claude calls with Tracify, wrap the Anthropic client with the Tracify SDK. Messages, tool use and streamed responses are recorded as spans with tokens, latency and cost.",
    captures: ["Model and parameters", "Tool use blocks and results", "Streaming time to first token", "Token usage and cost"],
    language: "python",
    code: `import tracify
from anthropic import Anthropic

anthropic = tracify.wrap_anthropic(Anthropic())

reply = anthropic.messages.create(
    model=MODEL,
    max_tokens=100,
    messages=[{"role": "user", "content": "Hello"}],
)`,
    doc: "provider-integrations",
    faq: [{ q: "Can I trace tool use with Claude?", a: "Yes. Each tool call the model requests is recorded and linked to the run that made it." }],
  },
  {
    slug: "langgraph",
    name: "LangGraph",
    title: "Trace LangGraph agents",
    description: "See every node, model call and tool call of a LangGraph agent as one trace in Tracify.",
    answer: "To trace a LangGraph agent with Tracify, add the Tracify integration to your graph. Each node run, model call and tool call becomes a span inside a single trace for the run.",
    captures: ["One trace per graph run", "Spans for nodes, model calls and tools", "Loops and retries visible in order", "Cost and latency per node"],
    language: "typescript",
    code: `import { TracifyLangGraphHandler } from "tracify-sdk";

await graph.invoke(input, { callbacks: [new TracifyLangGraphHandler()] });`,
    doc: "provider-integrations",
    faq: [{ q: "Do I have to use LangChain to trace LangGraph?", a: "Tracify traces LangGraph through its integration; for other frameworks you can use OpenTelemetry." }],
  },
  {
    slug: "opentelemetry",
    name: "OpenTelemetry",
    title: "Send OpenTelemetry traces to Tracify",
    description: "Send LLM and agent traces to Tracify over OTLP HTTP using any OpenTelemetry-instrumented library.",
    answer: "Tracify accepts traces over the standard OTLP HTTP protocol. Point your OpenTelemetry exporter at the Tracify endpoint with your project key and spans from any instrumented library appear as traces.",
    captures: ["Any OTLP-compatible span", "LLM semantic attributes such as model and tokens", "Parent and child relationships", "Errors and timing"],
    language: "bash",
    code: `# Send OTLP HTTP JSON to the /api/otel endpoint, authenticated with a project API key.
curl -X POST https://tracify.tech/api/otel \\
  -H "Authorization: Bearer tracify_sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d @otlp-traces.json`,
    doc: "api",
    faq: [{ q: "Which OpenTelemetry protocol does Tracify support?", a: "OTLP over HTTP with JSON." }],
  },
  {
    slug: "crewai",
    name: "CrewAI",
    title: "Monitor CrewAI agents",
    description: "Trace CrewAI multi-agent workflows in Tracify with the Python SDK.",
    answer: "To monitor CrewAI with Tracify, instrument your crew with the Python SDK. Each agent step, tool call and model call is recorded in one trace for the crew run.",
    captures: ["Agent and task steps", "Tool calls between agents", "Cost per crew run", "Failures and retries"],
    language: "python",
    code: `import tracify
from openai import OpenAI

# Wrap the provider client your crew uses; calls join the current run.
openai = tracify.wrap_openai(OpenAI())`,
    doc: "python",
    faq: [{ q: "Can I see which agent in a crew caused a failure?", a: "Yes, each agent's steps are separate spans, so you can open the failing span directly." }],
  },
  {
    slug: "vercel-ai-sdk",
    name: "Vercel AI SDK",
    title: "Trace the Vercel AI SDK",
    description: "Trace streaming calls, tools and multi-step generations from the Vercel AI SDK in Tracify.",
    answer: "To trace the Vercel AI SDK with Tracify, use the TypeScript SDK or OpenTelemetry telemetry. Streaming calls, tool use and each step of a multi-step generation are recorded as spans.",
    captures: ["Streaming generations", "Tool calls per step", "Tokens and cost", "Route handler timing in Next.js"],
    language: "typescript",
    code: `import { traceAgent } from "tracify-sdk";

// Wrap your route handler's work in a run; model calls inside it join the trace.
// See the TypeScript docs for the full traceAgent signature.`,
    doc: "typescript",
    faq: [{ q: "Does it work with Next.js route handlers?", a: "Yes. The TypeScript SDK traces server-side code including route handlers and Server Actions." }],
  },
] as const;
