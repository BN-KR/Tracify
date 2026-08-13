import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Fragment } from "react";
import { FutureAction, FutureBand, FuturePage } from "@/components/marketing/future19-page";

type Detail = { title: string; body: string };
type FeaturePage = {
  title: string;
  eyebrow: string;
  description: string;
  outcome: string;
  bestFor: string;
  details: readonly Detail[];
  workflow: readonly Detail[];
  visual: "trace" | "cost" | "tools" | "models" | "failures" | "reports" | "control" | "evaluation" | "lifecycle";
  related: readonly [string, string];
};

const productFeatures = {
  "trace-viewer": {
    title: "Trace Viewer",
    eyebrow: "Debug one run without losing the system around it",
    description: "Follow an agent request from its root span through model calls, tools, retries, and the final output. The trace keeps timing, cost, payloads, environment, release, and quality evidence in one inspection path.",
    outcome: "Move from a failed answer to the exact operation that produced it.",
    bestFor: "Engineers investigating wrong answers, slow runs, unexpected tool behavior, or regressions tied to a release.",
    details: [
      { title: "Nested execution", body: "Read parent and child spans as a timeline or graph so parallel work, handoffs, and repeated operations remain visible." },
      { title: "Payload inspection", body: "Inspect recorded inputs and outputs beside model, tool, latency, token, and cost fields instead of correlating separate logs." },
      { title: "Error-first navigation", body: "Jump to the first failed span, then retain the surrounding trace context needed to understand what led into it." },
      { title: "Quality beside telemetry", body: "View evaluator scores, feedback, and review evidence on the same run rather than treating quality as a separate report." },
    ],
    workflow: [
      { title: "Open the affected run", body: "Filter by environment, release, model, cost, or error state and open the trace that represents the user-visible behavior." },
      { title: "Locate the divergent span", body: "Use the waterfall, graph, retry markers, and payloads to isolate where execution changed course." },
      { title: "Preserve the evidence", body: "Share the run, comment on the relevant span, or add it to an evaluation dataset for regression coverage." },
    ],
    visual: "trace",
    related: ["evaluation-engine", "failures"],
  },
  "cost-dashboard": {
    title: "Cost Dashboard",
    eyebrow: "Explain spend at the level where it is created",
    description: "Break agent cost down by day, run, model, and tool. Separate ordinary execution from retry and fallback overhead, then open the traces behind an expensive change.",
    outcome: "Turn a rising invoice into a ranked set of engineering decisions.",
    bestFor: "Teams comparing model choices, investigating cost regressions, or setting practical budgets for production agents.",
    details: [
      { title: "Cost over time", body: "Read daily spend and tokens across a selected range without losing the run-level records behind each aggregate." },
      { title: "Model attribution", body: "Compare calls, latency, and total cost by model to find expensive defaults or unexpected routing behavior." },
      { title: "Tool attribution", body: "See tool activity and cost alongside model usage, including workflows where external calls dominate runtime." },
      { title: "Retry and fallback overhead", body: "Separate recoverability cost from primary execution so resilience policy can be tuned with evidence." },
    ],
    workflow: [
      { title: "Choose a comparison window", body: "Start with the release or time range where spend changed rather than an all-time average." },
      { title: "Rank the contributors", body: "Compare models, tools, retries, and fallback cost to identify the few operations worth inspecting." },
      { title: "Open representative traces", body: "Confirm whether a cost pattern is necessary work, duplicated work, or a policy problem before changing it." },
    ],
    visual: "cost",
    related: ["runtime-control", "llm-calls"],
  },
  "tool-calls": {
    title: "Tool Calls",
    eyebrow: "Treat every agent action as an inspectable contract",
    description: "See which tool was called, the arguments it received, what it returned, how long it took, and whether it failed. Keep the call attached to the reasoning path that selected it.",
    outcome: "Distinguish a reasoning failure from an integration failure.",
    bestFor: "Agent teams operating search, database, browser, API, and internal function tools in production.",
    details: [
      { title: "Arguments and results", body: "Inspect the recorded input and output for an individual call while retaining its parent trace and neighboring operations." },
      { title: "Timing and failure state", body: "Find slow, failed, or repeated calls and compare their latency with the rest of the run." },
      { title: "Per-tool summaries", body: "Aggregate activity by tool name to identify noisy integrations and the tools most associated with cost or delay." },
      { title: "Trace-level context", body: "See the model call that selected the tool and the downstream output that consumed its result." },
    ],
    workflow: [
      { title: "Start from the user-visible symptom", body: "Open the trace for the wrong, incomplete, or delayed result." },
      { title: "Check selection and execution", body: "Confirm whether the agent chose the wrong tool, supplied bad arguments, or received a bad response." },
      { title: "Add a durable check", body: "Turn the corrected behavior into a deterministic evaluator, dataset item, or runtime policy where appropriate." },
    ],
    visual: "tools",
    related: ["trace-viewer", "failures"],
  },
  "llm-calls": {
    title: "LLM Calls",
    eyebrow: "Make model behavior measurable inside the workflow",
    description: "Capture model identity, inputs, outputs, tokens, cost, latency, and time to first token for every generation. Compare calls in context instead of judging the final response alone.",
    outcome: "Know which model interaction changed quality, latency, or cost.",
    bestFor: "Teams routing across models, tuning prompts, or diagnosing quality and performance at generation level.",
    details: [
      { title: "Model attribution", body: "Record the model used on each span so routing and fallback behavior can be verified against the actual trace." },
      { title: "Token accounting", body: "Keep input and output token counts with each generation and aggregate them into the run total." },
      { title: "Latency and TTFT", body: "Separate total call latency from time to first token when streaming responsiveness matters." },
      { title: "Prompt and release context", body: "Use trace metadata to compare model behavior across prompts, environments, and releases." },
    ],
    workflow: [
      { title: "Find the generation", body: "Open the trace and select the model span responsible for a decision or final response." },
      { title: "Compare the complete call", body: "Inspect payload, token mix, latency, cost, retry state, and downstream effects together." },
      { title: "Evaluate the alternative", body: "Use a versioned dataset and evaluator suite before promoting a prompt or model change." },
    ],
    visual: "models",
    related: ["cost-dashboard", "evaluation-engine"],
  },
  failures: {
    title: "Failure Analysis",
    eyebrow: "Find the first broken assumption, not only the final error",
    description: "Surface failed runs, error spans, retry storms, latency breaches, and fallback outcomes. Connect alerts to the trace evidence needed for triage.",
    outcome: "Reduce the distance between an alert and an actionable cause.",
    bestFor: "On-call engineers and agent owners responsible for production reliability and recovery behavior.",
    details: [
      { title: "Error-bearing spans", body: "Expose the operation, error message, and stack evidence inside the full run rather than flattening the incident into one status." },
      { title: "Retry visibility", body: "Record retry count and orchestration metadata so repeated work and exhausted attempts are visible." },
      { title: "Latency thresholds", body: "Use duration and time-to-first-token evidence to distinguish a stall from a hard failure." },
      { title: "Slack notification path", body: "Send configured project alerts to a validated Slack webhook and route responders back to the relevant project evidence." },
    ],
    workflow: [
      { title: "Receive the signal", body: "Start from the failure or threshold alert and identify the affected environment and release." },
      { title: "Reconstruct the run", body: "Open the trace, jump to the first error, and inspect retries, fallbacks, and upstream inputs." },
      { title: "Close the recurrence path", body: "Adjust code or policy, then add evaluation coverage and monitor the next release." },
    ],
    visual: "failures",
    related: ["trace-viewer", "runtime-control"],
  },
  reports: {
    title: "Project Reports",
    eyebrow: "Give stakeholders the operating record without the dashboard tour",
    description: "Create a print-friendly project summary covering run volume, spend, failures, model and tool usage, and alert activity. Keep the report grounded in the same telemetry engineers inspect.",
    outcome: "Share a compact operational review that can survive outside the dashboard.",
    bestFor: "Engineering leads, product owners, and review meetings that need a stable account of a project window.",
    details: [
      { title: "Project totals", body: "Summarize run activity, cost, and failure counts for a clear operating snapshot." },
      { title: "Model and tool breakdowns", body: "Show where execution and spend concentrate without exporting raw traces into a spreadsheet first." },
      { title: "Failure evidence", body: "Include failed-run context so a reliability summary remains connected to concrete incidents." },
      { title: "Browser print workflow", body: "Use a purpose-built print layout for PDF export or a physical review packet." },
    ],
    workflow: [
      { title: "Select the project", body: "Open the report from the project whose telemetry and configuration define the review boundary." },
      { title: "Review the summary", body: "Check totals and breakdowns against the questions stakeholders need answered." },
      { title: "Print or save", body: "Use the browser print flow to preserve the report for the meeting or operating record." },
    ],
    visual: "reports",
    related: ["cost-dashboard", "failures"],
  },
  "runtime-control": {
    title: "Runtime Control",
    eyebrow: "Turn observed limits into explicit execution policy",
    description: "Configure per-run and daily cost ceilings, latency budgets, ordered model fallbacks, and retry behavior. Start in observe mode, then enforce when the policy matches production reality.",
    outcome: "Keep recovery behavior and resource limits deliberate under pressure.",
    bestFor: "Platform teams that need consistent guardrails across agent runs without hiding the policy in application code.",
    details: [
      { title: "Observe or enforce", body: "Evaluate a policy without blocking runs, then move to enforcement when its thresholds are understood." },
      { title: "Cost ceilings", body: "Set positive per-run and daily limits that can be checked by the orchestration path." },
      { title: "Fallback chains", body: "Define an ordered list of model identifiers for recovery rather than allowing implicit provider behavior." },
      { title: "Retry and latency policy", body: "Control attempt count, initial backoff, multiplier, retryable error classes, and latency budget." },
    ],
    workflow: [
      { title: "Measure the baseline", body: "Use traces and cost analysis to understand ordinary and worst-case execution before selecting limits." },
      { title: "Observe the proposed policy", body: "Record what would have been blocked or rerouted without changing live behavior." },
      { title: "Enforce and monitor", body: "Enable enforcement deliberately and watch fallback cost, retries, latency, and failures after release." },
    ],
    visual: "control",
    related: ["cost-dashboard", "failures"],
  },
  "evaluation-engine": {
    title: "Evaluation Engine",
    eyebrow: "Attach repeatable quality evidence to agent behavior",
    description: "Build versioned datasets, configure deterministic or model-based evaluators, run offline suites, score live traces, route failures to review, and monitor quality thresholds.",
    outcome: "Replace subjective spot checks with a trace-linked evaluation record.",
    bestFor: "Teams validating prompt, model, retrieval, policy, and workflow changes before and after release.",
    details: [
      { title: "Versioned datasets", body: "Collect inputs, expected outputs, metadata, and selected production traces into controlled test sets." },
      { title: "Typed evaluators", body: "Use code checks or model judges and persist numeric, boolean, categorical, or text results with explanations." },
      { title: "Offline and online runs", body: "Run suites over datasets and attach live scores to traces or spans using the same evaluator versions." },
      { title: "Review and monitors", body: "Queue failed evidence for annotation and alert on failure rate, averages, counts, or categorical rates over a defined window." },
    ],
    workflow: [
      { title: "Define the behavior", body: "Choose examples and expected outcomes that represent the product promise or risk being tested." },
      { title: "Run and inspect", body: "Apply versioned evaluators, compare aggregate results, and open individual trace-linked explanations." },
      { title: "Monitor production", body: "Sample live traffic, collect user or human feedback, and alert when a score distribution crosses its threshold." },
    ],
    visual: "evaluation",
    related: ["lifecycle", "trace-viewer"],
  },
  lifecycle: {
    title: "AI Engineering Lifecycle",
    eyebrow: "Keep production evidence connected to the next release",
    description: "Move from traces and sessions to datasets, prompts, experiments, review, and release monitoring without rebuilding context at each stage.",
    outcome: "Create a closed improvement loop from production behavior to verified change.",
    bestFor: "AI product teams coordinating debugging, prompt work, evaluations, experiments, and release decisions.",
    details: [
      { title: "Observe", body: "Capture traces, sessions, model and tool spans, cost, latency, errors, feedback, environment, and release context." },
      { title: "Curate", body: "Promote representative production cases into versioned datasets with expected outputs and metadata." },
      { title: "Experiment", body: "Compare prompt or model candidates over the same cases and score their outputs with repeatable evaluators." },
      { title: "Release and watch", body: "Use evaluation evidence to inform promotion, then monitor the new release against live quality and reliability signals." },
    ],
    workflow: [
      { title: "Production reveals a case", body: "A trace, session, user signal, or monitor identifies behavior worth preserving or correcting." },
      { title: "The case becomes a test", body: "Add it to a dataset, define the expected behavior, and evaluate candidate changes." },
      { title: "The release stays observable", body: "Carry release context into live traces and compare the deployed behavior with the evaluated expectation." },
    ],
    visual: "lifecycle",
    related: ["evaluation-engine", "trace-viewer"],
  },
} as const satisfies Record<string, FeaturePage>;

type Feature = keyof typeof productFeatures;

export function generateStaticParams() {
  return Object.keys(productFeatures).map((feature) => ({ feature }));
}

export async function generateMetadata({ params }: { params: Promise<{ feature: string }> }): Promise<Metadata> {
  const { feature } = await params;
  const page = productFeatures[feature as Feature];
  return page ? { title: page.title, description: page.description, alternates: { canonical: `/product/${feature}` } } : { title: "Product" };
}

function ProductBreadcrumb({ title, slug }: { title: string; slug: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tracify", item: "https://www.tracify.tech/" },
      { "@type": "ListItem", position: 2, name: title, item: `https://www.tracify.tech/product/${slug}` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

function ProductHero({ page, index }: { page: FeaturePage; index: number }) {
  const align = index % 3;
  return (
    <header className={`border-b border-black ${align === 0 ? "bg-black text-white" : align === 1 ? "bg-[#eceae3]" : "bg-[#f4d44d]"}`}>
      <div className={`mx-auto grid min-h-[440px] max-w-[1240px] border-x border-current ${align === 1 ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-[1fr_340px]"}`}>
        <div className={`flex flex-col justify-between px-5 py-10 sm:px-8 md:px-10 md:py-14 ${align === 1 ? "md:order-2 md:border-l" : "md:border-r"}`}>
          <p className="max-w-xl font-mono text-[9px] uppercase tracking-[0.15em] opacity-55">{page.eyebrow}</p>
          <div className="my-12">
            <h1 className="max-w-4xl text-balance font-pixel text-[clamp(3.4rem,7vw,6.8rem)] leading-[0.84] tracking-[-0.065em]">{page.title}</h1>
            <p className="mt-7 max-w-2xl text-pretty text-base leading-7 opacity-68 md:text-lg">{page.description}</p>
          </div>
          <div className="flex flex-wrap gap-3"><FutureAction href="/demo" inverted={align === 0}>Explore the demo</FutureAction><FutureAction href="/docs" inverted={align === 0}>Read the docs</FutureAction></div>
        </div>
        <div className={`flex min-h-48 flex-col justify-between p-6 ${align === 1 ? "md:order-1" : ""} ${align === 0 ? "bg-[#f4d44d] text-black" : "bg-black text-white"}`}>
          <span className="font-pixel text-7xl leading-none opacity-16">0{index + 1}</span>
          <div><div className="mb-5 h-2 w-16 bg-[#f4d44d]" /><p className="font-mono text-[9px] uppercase leading-5 tracking-[0.12em] opacity-65">{page.outcome}</p></div>
        </div>
      </div>
    </header>
  );
}

const traceRows = [
  ["agent.run", "2.84s", "root"], ["llm.plan", "640ms", "model"], ["tool.search", "1.21s", "tool"], ["llm.answer", "810ms", "model"],
];

function FeatureInstrument({ type }: { type: FeaturePage["visual"] }) {
  if (type === "trace") return <div className="space-y-3 p-6 md:p-10">{traceRows.map(([name, time, kind], i) => <div key={name} className="grid grid-cols-[80px_1fr_60px] items-center gap-3"><span className="font-mono text-[8px] uppercase opacity-50">{kind}</span><div className="border border-white/20 p-3" style={{ marginLeft: `${i * 7}%`, width: `${92 - i * 8}%` }}><span className="font-mono text-xs">{name}</span></div><span className="text-right font-mono text-[9px] text-[#f4d44d]">{time}</span></div>)}</div>;
  if (type === "cost") return <div className="grid grid-cols-4 items-end gap-3 p-6 md:p-10">{[[38,"MON"],[62,"TUE"],[47,"WED"],[84,"THU"]].map(([height,label]) => <div key={String(label)}><div className="bg-[#f4d44d]" style={{ height: `${height}px` }} /><p className="mt-3 border-t border-white/25 pt-2 font-mono text-[8px]">{label}</p></div>)}<div className="col-span-4 mt-5 grid grid-cols-2 border border-white/20 font-mono text-[9px]"><span className="p-3">PRIMARY $18.42</span><span className="border-l border-white/20 p-3 text-[#f4d44d]">RECOVERY $2.18</span></div></div>;
  if (type === "tools") return <div className="p-6 md:p-10"><div className="font-mono text-[9px] text-white/45">TOOL CALL / search_docs</div><pre className="mt-5 overflow-x-auto border border-white/20 p-5 text-xs leading-6 text-[#f4d44d]">{`{\n  "query": "retry policy",\n  "limit": 5\n}`}</pre><div className="mt-4 grid grid-cols-3 border border-white/20 text-center font-mono text-[8px]"><span className="p-3">200 OK</span><span className="border-x border-white/20 p-3">412 MS</span><span className="p-3">5 RESULTS</span></div></div>;
  if (type === "models") return <div className="p-6 md:p-10"><div className="grid grid-cols-2 border border-white/20 font-mono text-[9px]"><span className="p-4">MODEL</span><span className="border-l border-white/20 p-4 text-[#f4d44d]">gpt-5</span>{[["INPUT","1,842 TOK"],["OUTPUT","326 TOK"],["TTFT","284 MS"],["COST","$0.014"]].flatMap(([a,b]) => [<span key={a} className="border-t border-white/20 p-4 text-white/50">{a}</span>,<span key={b} className="border-l border-t border-white/20 p-4">{b}</span>])}</div></div>;
  if (type === "failures") return <div className="space-y-2 p-6 md:p-10">{[["01","timeout","retry scheduled"],["02","timeout","fallback selected"],["03","provider_5xx","run failed"]].map(([n,error,state],i) => <div key={n} className={`grid grid-cols-[44px_1fr] border p-4 ${i === 2 ? "border-[#f4d44d]" : "border-white/20"}`}><span className="font-pixel text-3xl text-white/25">{n}</span><div><p className="font-mono text-[10px]">{error}</p><p className="mt-1 text-xs text-white/45">{state}</p></div></div>)}</div>;
  if (type === "reports") return <div className="p-6 md:p-10"><div className="bg-[#eceae3] p-6 text-black"><div className="flex justify-between border-b border-black pb-4 font-mono text-[8px]"><span>PROJECT REPORT</span><span>OPERATING RECORD</span></div><p className="mt-8 font-pixel text-4xl">Weekly review</p><div className="mt-8 grid grid-cols-3 border border-black text-center"><span className="p-3 font-mono text-[8px]">RUNS<br/><b className="text-lg">1,248</b></span><span className="border-x border-black p-3 font-mono text-[8px]">COST<br/><b className="text-lg">$42</b></span><span className="p-3 font-mono text-[8px]">FAILED<br/><b className="text-lg">18</b></span></div></div></div>;
  if (type === "control") return <div className="p-6 md:p-10"><div className="grid border border-white/20 font-mono text-[9px]">{[["MODE","OBSERVE"],["RUN CEILING","$0.25"],["DAILY CEILING","$75.00"],["LATENCY BUDGET","8,000 MS"],["RETRIES","2 × 1,000 MS"]].map(([a,b],i) => <div key={a} className={`grid grid-cols-2 ${i ? "border-t border-white/20" : ""}`}><span className="p-4 text-white/45">{a}</span><span className="border-l border-white/20 p-4 text-[#f4d44d]">{b}</span></div>)}</div></div>;
  if (type === "evaluation") return <div className="p-6 md:p-10"><div className="grid grid-cols-[1fr_repeat(3,70px)] border border-white/20 font-mono text-[8px]"><span className="p-3 text-white/45">CASE</span>{["VALID","GROUND","POLICY"].map(x=><span key={x} className="border-l border-white/20 p-3 text-center text-white/45">{x}</span>)}{["refund request","account lookup","unsafe input"].map((x,i)=><Fragment key={x}><span className="border-t border-white/20 p-3">{x}</span>{[0,1,2].map(j=><span key={`${x}-${j}`} className={`border-l border-t border-white/20 p-3 text-center ${i === 2 && j === 2 ? "text-[#f4d44d]" : ""}`}>{i === 2 && j === 2 ? "FAIL" : "PASS"}</span>)}</Fragment>)}</div></div>;
  return <div className="p-6 md:p-10"><div className="grid gap-3 md:grid-cols-5">{["TRACE","DATASET","EVALUATE","RELEASE","MONITOR"].map((step,i)=><div key={step} className={`border p-4 ${i === 2 ? "border-[#f4d44d] bg-[#f4d44d] text-black" : "border-white/20"}`}><span className="font-pixel text-3xl opacity-25">0{i+1}</span><p className="mt-12 font-mono text-[8px]">{step}</p></div>)}</div></div>;
}

function DetailGrid({ details, visual }: { details: readonly Detail[]; visual: FeaturePage["visual"] }) {
  const reverse = ["cost", "tools", "control", "reports"].includes(visual);
  return <div className={`grid border-x border-black lg:grid-cols-[1.05fr_0.95fr] ${reverse ? "lg:grid-cols-[0.95fr_1.05fr]" : ""}`}><div className={`bg-black text-white ${reverse ? "lg:order-2 lg:border-l" : "lg:border-r"}`}><FeatureInstrument type={visual} /></div><div className={reverse ? "lg:order-1" : ""}><div className="grid sm:grid-cols-2">{details.map((detail,index)=><article key={detail.title} className={`min-h-56 p-6 md:p-8 ${index < 2 ? "border-b border-black" : ""} ${index % 2 === 0 ? "sm:border-r sm:border-black" : ""}`}><span className="font-pixel text-4xl text-black/15">0{index+1}</span><h2 className="mt-8 font-mono text-[10px] uppercase tracking-[0.13em]">{detail.title}</h2><p className="mt-4 text-sm leading-6 text-black/58">{detail.body}</p></article>)}</div></div></div>;
}

function Workflow({ page }: { page: FeaturePage }) {
  const vertical = ["failures", "reports", "evaluation"].includes(page.visual);
  return <div className={`border-x border-black ${vertical ? "divide-y divide-black" : "grid md:grid-cols-3"}`}>{page.workflow.map((step,index)=><article key={step.title} className={`p-6 md:p-9 ${!vertical && index < 2 ? "border-b border-black md:border-b-0 md:border-r" : ""} ${vertical ? "grid gap-5 md:grid-cols-[100px_240px_1fr] md:items-start" : "min-h-64"}`}><span className="font-pixel text-5xl text-black/15">0{index+1}</span><h2 className={`font-mono text-[10px] uppercase tracking-[0.13em] ${vertical ? "md:pt-2" : "mt-14"}`}>{step.title}</h2><p className={`text-sm leading-6 text-black/58 ${vertical ? "md:pt-1" : "mt-4"}`}>{step.body}</p></article>)}</div>;
}

export default async function ProductFeaturePage({ params }: { params: Promise<{ feature: string }> }) {
  const { feature } = await params;
  const page = productFeatures[feature as Feature];
  if (!page) notFound();
  const index = Object.keys(productFeatures).indexOf(feature);
  return <FuturePage>
    <ProductBreadcrumb title={page.title} slug={feature} />
    <ProductHero page={page} index={index} />
    <FutureBand label="Operating outcome"><div className="grid border-x border-black md:grid-cols-[1fr_1.25fr]"><p className="border-b border-black bg-[#f4d44d] p-7 font-pixel text-4xl leading-[0.92] tracking-[-0.045em] md:border-b-0 md:border-r md:p-10">{page.outcome}</p><div className="p-7 md:p-10"><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-black/45">Use it when</p><p className="mt-5 max-w-2xl text-base leading-7 text-black/65">{page.bestFor}</p></div></div></FutureBand>
    <FutureBand label={`${page.title} / working surface`}><DetailGrid details={page.details} visual={page.visual} /></FutureBand>
    <FutureBand label="From signal to action"><Workflow page={page} /></FutureBand>
    <FutureBand tone="ink" label="Continue through the system"><div className="grid border-x border-white/20 md:grid-cols-[1fr_360px]"><div className="p-7 md:p-10"><p className="max-w-3xl font-pixel text-5xl leading-[0.9] tracking-[-0.055em] md:text-7xl">The evidence stays connected after the page ends.</p><div className="mt-9 flex flex-wrap gap-3"><FutureAction href="/demo" inverted>Open the demo</FutureAction><FutureAction href="/sign-up" inverted>Start free</FutureAction></div></div><nav aria-label="Related product capabilities" className="border-t border-white/20 md:border-l md:border-t-0">{page.related.map((slug)=><Link key={slug} href={`/product/${slug}`} className="flex min-h-24 items-center justify-between border-b border-white/20 px-6 font-mono text-[9px] uppercase tracking-[0.12em] last:border-b-0 hover:bg-[#f4d44d] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#f4d44d]"><span>{productFeatures[slug as Feature].title}</span><ArrowRight className="size-4" aria-hidden="true" /></Link>)}</nav></div></FutureBand>
  </FuturePage>;
}
