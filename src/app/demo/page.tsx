"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  DollarSign,
  FlaskConical,
  GitBranch,
  MessageSquareText,
} from "lucide-react";
import type React from "react";

const traces = [
  {
    id: "run_8f21a9",
    title: "Support escalation",
    status: "completed",
    latency: "1.84s",
    cost: "$0.014",
    score: "0.92",
    spans: 12,
  },
  {
    id: "run_8f21b0",
    title: "Refund lookup",
    status: "failed",
    latency: "4.21s",
    cost: "$0.038",
    score: "0.41",
    spans: 19,
  },
  {
    id: "run_8f21b4",
    title: "Plan recommendation",
    status: "completed",
    latency: "1.12s",
    cost: "$0.009",
    score: "0.88",
    spans: 8,
  },
];

export default function DemoPage() {
  const [active, setActive] = useState("overview");
  const tabs = [
    ["overview", "Overview"],
    ["prompts", "Prompts"],
    ["evaluation", "Evaluation"],
    ["datasets", "Datasets"],
    ["experiments", "Experiments"],
  ];
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="mx-auto max-w-[1280px] px-6 pb-24 pt-32">
        <div className="flex flex-col justify-between gap-8 border-b border-zinc-800 pb-10 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              Interactive demo project / support-agent
            </p>
            <h1 className="mt-4 max-w-3xl font-mono text-4xl tracking-tight md:text-6xl">
              From trace to better answers.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
              Explore the complete Tracify improvement loop with seeded data:
              inspect a run, compare prompt versions, review quality, and
              promote the change that wins.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 border border-white px-5 py-3 font-mono text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black"
          >
            Create a project <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={
                active === id
                  ? "border border-white bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-black"
                  : "border border-zinc-800 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:border-zinc-500"
              }
            >
              {label}
            </button>
          ))}
        </div>
        {active === "overview" ? <Overview /> : null}
        {active === "prompts" ? <Prompts /> : null}
        {active === "evaluation" ? <Evaluation /> : null}
        {active === "datasets" ? <Datasets /> : null}
        {active === "experiments" ? <Experiments /> : null}
      </main>
    </div>
  );
}

function Overview() {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Traces", "1,284", "↑ 18.4%"],
          ["Quality", "0.86", "↑ 0.12"],
          ["Avg latency", "1.48s", "↓ 24%"],
          ["Spend / day", "$18.42", "↓ 11%"],
        ].map(([label, value, delta]) => (
          <div
            key={label}
            className="border border-zinc-800 bg-zinc-950/60 p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {label}
            </p>
            <p className="mt-3 text-2xl text-white">{value}</p>
            <p className="mt-2 font-mono text-[10px] text-emerald-400">
              {delta}
            </p>
          </div>
        ))}
      </div>
      <section className="border border-zinc-800 bg-zinc-950/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Latest traces
            </p>
            <h2 className="mt-2 text-xl text-white">
              What happened in production
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase text-zinc-500">
            live sample
          </span>
        </div>
        <div className="mt-5 space-y-2">
          {traces.map((trace) => (
            <div
              key={trace.id}
              className="flex flex-wrap items-center justify-between gap-4 border border-zinc-800 p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    trace.status === "failed"
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }
                >
                  {trace.status === "failed" ? (
                    <CircleAlert className="size-4" />
                  ) : (
                    <Check className="size-4" />
                  )}
                </span>
                <div>
                  <p className="text-sm text-white">{trace.title}</p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {trace.id} · {trace.spans} spans
                  </p>
                </div>
              </div>
              <div className="flex gap-5 font-mono text-[10px] uppercase text-zinc-500">
                <span>
                  <Clock3 className="mr-1 inline size-3" />
                  {trace.latency}
                </span>
                <span>
                  <DollarSign className="mr-1 inline size-3" />
                  {trace.cost}
                </span>
                <span>score {trace.score}</span>
                <ChevronRight className="size-4 text-zinc-400" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Prompts() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <DemoCard
        icon={<MessageSquareText className="size-4" />}
        eyebrow="Prompt management"
        title="support-reply"
        description="Version 3 is labeled production. Version 4 is being tested against the support regression dataset."
      />
      <div className="border border-zinc-800 bg-zinc-950/60 p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Version comparison
        </p>
        <div className="mt-5 space-y-3">
          <Version label="production" version="v3" score="0.86" cost="$0.014" />
          <Version
            label="candidate"
            version="v4"
            score="0.92"
            cost="$0.011"
            recommended
          />
        </div>
        <div className="mt-6 border-t border-zinc-800 pt-5 font-mono text-xs text-zinc-400">
          v4 removes the redundant policy paragraph and improves resolution
          accuracy on refund cases.
        </div>
      </div>
    </div>
  );
}

function Evaluation() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <DemoCard
        icon={<Check className="size-4" />}
        eyebrow="Scores"
        title="0.92 quality"
        description="Composite score from correctness, helpfulness, and policy compliance evaluators."
      />
      <DemoCard
        icon={<CircleAlert className="size-4" />}
        eyebrow="Review queue"
        title="3 traces waiting"
        description="Human reviewers are labeling edge cases to expand the regression dataset."
      />
      <DemoCard
        icon={<GitBranch className="size-4" />}
        eyebrow="Dataset"
        title="support-regression"
        description="248 examples with expected outputs and metadata from production traces."
      />
    </div>
  );
}

function Datasets() {
  const examples = [
    [
      "refund_042",
      "Can I get a refund?",
      "Explain eligibility and ask for the order number.",
    ],
    [
      "policy_117",
      "Is expedited shipping available?",
      "State the policy and avoid promising unavailable options.",
    ],
    [
      "handoff_203",
      "I need to speak to a person.",
      "Acknowledge the request and create a human handoff.",
    ],
  ];
  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DemoCard
          icon={<Database className="size-4" />}
          eyebrow="Dataset"
          title="support-regression"
          description="Version 12 · 248 examples · project access"
        />
        <Metric label="Expected outputs" value="248" />
        <Metric label="Source traces" value="1,024" />
      </div>
      <section className="border border-zinc-800 bg-zinc-950/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Examples
            </p>
            <h2 className="mt-2 text-xl text-white">
              Curated from production edge cases
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase text-emerald-400">
            version 12 · shared
          </span>
        </div>
        <div className="mt-5 space-y-2">
          {examples.map(([id, input, expected]) => (
            <div
              key={id}
              className="grid gap-3 border border-zinc-800 p-4 md:grid-cols-[120px_1fr_1fr]"
            >
              <span className="font-mono text-[10px] uppercase text-zinc-500">
                {id}
              </span>
              <p className="text-sm text-zinc-300">{input}</p>
              <p className="text-sm text-zinc-500">{expected}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Experiments() {
  const [promoted, setPromoted] = useState(false);
  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DemoCard
          icon={<FlaskConical className="size-4" />}
          eyebrow="Experiment"
          title="support-v4"
          description="248 dataset items · completed 4m ago"
        />
        <Metric label="Quality" value="+0.12" />
        <Metric label="Cost" value="-21%" />
      </div>
      <section className="border border-zinc-800 bg-zinc-950/60 p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Decision
        </p>
        <h2 className="mt-2 text-xl text-white">
          {promoted ? "Candidate v4 is live" : "Promote candidate v4"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          The candidate improves quality and lowers cost across the same
          dataset.{" "}
          {promoted
            ? "The production label is now active in this demo and linked traces will use v4."
            : "In a real project, promotion is protected by a passed evaluation gate and linked traces can be watched after release."}
        </p>
        <button
          type="button"
          onClick={() => setPromoted(true)}
          disabled={promoted}
          className="mt-5 border border-white px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:bg-white hover:text-black disabled:cursor-default disabled:border-emerald-400/50 disabled:text-emerald-300"
        >
          {promoted ? "Production active" : "Promote to production"}
        </button>
      </section>
    </div>
  );
}

function DemoCard({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-5">
      <div className="flex items-center gap-2 text-zinc-400">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-widest">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-4 text-xl text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}
function Version({
  label,
  version,
  score,
  cost,
  recommended,
}: {
  label: string;
  version: string;
  score: string;
  cost: string;
  recommended?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border border-zinc-800 p-4">
      <div>
        <span className="font-mono text-sm text-white">{version}</span>
        <span className="ml-3 font-mono text-[9px] uppercase text-zinc-500">
          {label}
        </span>
      </div>
      <div className="flex gap-5 font-mono text-xs text-zinc-400">
        <span>{score}</span>
        <span>{cost}</span>
        {recommended ? <span className="text-emerald-400">winner</span> : null}
      </div>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-2xl text-emerald-400">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">vs production baseline</p>
    </div>
  );
}
