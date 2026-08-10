"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleDot, Play, ShieldCheck } from "lucide-react";

const sandboxSpans = [
  {
    name: "agent.run",
    type: "Run",
    time: "3.8s",
    state: "ok",
    detail: "Support request received and routed.",
  },
  {
    name: "model.plan",
    type: "Model",
    time: "620ms",
    state: "ok",
    detail: "Planned account lookup before composing the answer.",
  },
  {
    name: "tool.account",
    type: "Tool",
    time: "2.4s",
    state: "slow",
    detail: "Account API consumed 63% of the latency budget.",
  },
  {
    name: "retry.account",
    type: "Retry",
    time: "780ms",
    state: "failed",
    detail: "Retry began after the remaining latency budget was exhausted.",
  },
] as const;

export function FutureSandbox() {
  const [selected, setSelected] = useState(2);
  return (
    <div className="grid border border-white/15 bg-black lg:grid-cols-[0.85fr_1.15fr]">
      <div className="border-b border-white/15 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500">
          <span>run_8f21a9</span>
          <span className="flex items-center gap-2 text-[#7ee0b8]">
            <CircleDot className="size-3" /> interactive
          </span>
        </div>
        {sandboxSpans.map((span, index) => (
          <button
            type="button"
            key={span.name}
            onClick={() => setSelected(index)}
            aria-pressed={selected === index}
            className={`grid w-full grid-cols-[32px_1fr_auto] items-center gap-4 border-b border-white/10 p-5 text-left transition-colors ${selected === index ? "bg-white text-black" : "hover:bg-white/5"}`}
          >
            <span className="font-mono text-[9px] opacity-40">
              0{index + 1}
            </span>
            <span>
              <span className="block font-mono text-[10px]">{span.name}</span>
              <span className="mt-1 block font-mono text-[8px] uppercase opacity-45">
                {span.type}
              </span>
            </span>
            <span className="font-mono text-[9px]">{span.time}</span>
          </button>
        ))}
      </div>
      <div className="flex min-h-[420px] flex-col justify-between p-7">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-600">
            Selected evidence
          </p>
          <h3 className="mt-5 font-pixel text-5xl tracking-[-0.06em]">
            {sandboxSpans[selected].name}
          </h3>
          <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-400">
            {sandboxSpans[selected].detail}
          </p>
        </div>
        <div>
          <div className="grid grid-cols-3 border-y border-white/15 py-5">
            <div>
              <p className="font-mono text-[8px] text-zinc-600">STATUS</p>
              <p className="mt-2 text-sm">{sandboxSpans[selected].state}</p>
            </div>
            <div>
              <p className="font-mono text-[8px] text-zinc-600">COST</p>
              <p className="mt-2 text-sm">$0.041</p>
            </div>
            <div>
              <p className="font-mono text-[8px] text-zinc-600">QUALITY</p>
              <p className="mt-2 text-sm">0.94</p>
            </div>
          </div>
          <p className="mt-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#f4d44d]">
            <Play className="size-3" /> Click any span to investigate
          </p>
        </div>
      </div>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em]">
        <span>{label}</span>
        <span>
          {value.toLocaleString()}
          {suffix}
        </span>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-black"
      />
    </label>
  );
}

export function RoiCalculator() {
  const [runs, setRuns] = useState(100000);
  const [incidents, setIncidents] = useState(14);
  const [hours, setHours] = useState(5);
  const monthlyHours = Math.round(incidents * hours * 0.42);
  const monthlyValue = monthlyHours * 140 + Math.round(runs * 0.0009);
  return (
    <div className="grid border border-black/20 bg-[#f4d44d] lg:grid-cols-[1fr_0.82fr]">
      <div className="space-y-9 p-7 md:p-10">
        <RangeControl
          label="Agent runs / month"
          value={runs}
          min={10000}
          max={1000000}
          step={10000}
          onChange={setRuns}
        />
        <RangeControl
          label="Incidents / month"
          value={incidents}
          min={2}
          max={60}
          step={1}
          onChange={setIncidents}
        />
        <RangeControl
          label="Hours per incident"
          value={hours}
          min={1}
          max={16}
          step={1}
          onChange={setHours}
        />
        <p className="font-mono text-[8px] uppercase leading-5 tracking-[0.12em] opacity-55">
          Illustrative model only. Uses 42% modeled debugging-time reduction and
          $140/hour blended engineering cost.
        </p>
      </div>
      <div className="flex flex-col justify-between bg-black p-7 text-white md:p-10">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500">
            Modeled monthly opportunity
          </p>
          <p className="mt-7 font-pixel text-8xl leading-none tracking-[-0.09em]">
            ${monthlyValue.toLocaleString()}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 border-t border-white/15 pt-6">
          <div>
            <p className="font-pixel text-5xl tracking-[-0.06em]">
              {monthlyHours}h
            </p>
            <p className="mt-2 font-mono text-[8px] uppercase text-zinc-600">
              engineering time
            </p>
          </div>
          <div>
            <p className="font-pixel text-5xl tracking-[-0.06em]">
              {Math.round((monthlyValue * 12) / 1000)}k
            </p>
            <p className="mt-2 font-mono text-[8px] uppercase text-zinc-600">
              annualized value
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const candidates = [
  {
    name: "Prompt v17",
    quality: 71,
    latency: "11.6s",
    cost: "$0.082",
    status: "Baseline",
    color: "#ff655a",
  },
  {
    name: "Prompt v18",
    quality: 94,
    latency: "3.1s",
    cost: "$0.039",
    status: "Recommended",
    color: "#7ee0b8",
  },
  {
    name: "Prompt v19",
    quality: 88,
    latency: "2.7s",
    cost: "$0.044",
    status: "Fastest",
    color: "#8b7cff",
  },
] as const;

export function EvaluationPlayground() {
  const [selected, setSelected] = useState(1);
  return (
    <div className="border border-white/15">
      <div className="grid border-b border-white/15 md:grid-cols-3">
        {candidates.map((candidate, index) => (
          <button
            key={candidate.name}
            type="button"
            onClick={() => setSelected(index)}
            aria-pressed={selected === index}
            className={`p-5 text-left transition-colors ${selected === index ? "bg-white text-black" : "border-b border-white/15 hover:bg-white/5 md:border-b-0 md:border-r"}`}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-50">
              {candidate.status}
            </p>
            <p className="mt-3 font-pixel text-3xl tracking-[-0.05em]">
              {candidate.name}
            </p>
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
        <div className="border-b border-white/15 p-7 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-600">
            Candidate score
          </p>
          <p
            className="mt-8 font-pixel text-9xl leading-none tracking-[-0.09em]"
            style={{ color: candidates[selected].color }}
          >
            {candidates[selected].quality}
          </p>
          <p className="mt-3 text-sm text-zinc-500">Composite quality</p>
        </div>
        <div className="p-7">
          <div className="grid grid-cols-2 gap-px bg-white/15">
            <div className="bg-black p-5">
              <p className="font-mono text-[8px] text-zinc-600">LATENCY</p>
              <p className="mt-3 font-pixel text-4xl">
                {candidates[selected].latency}
              </p>
            </div>
            <div className="bg-black p-5">
              <p className="font-mono text-[8px] text-zinc-600">COST / RUN</p>
              <p className="mt-3 font-pixel text-4xl">
                {candidates[selected].cost}
              </p>
            </div>
          </div>
          <div
            className="mt-6 border-l-4 p-5"
            style={{
              borderColor: candidates[selected].color,
              background: `${candidates[selected].color}12`,
            }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.12em]">
              {selected === 1
                ? "Quality gate passed · ready to promote"
                : "Compare against the production baseline"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CostSimulator() {
  const [runs, setRuns] = useState(180000);
  const [retries, setRetries] = useState(8);
  const [modelCost, setModelCost] = useState(4);
  const base = runs * (modelCost / 100000);
  const retryCost = base * (retries / 100) * 0.82;
  const optimized = base + retryCost * 0.28;
  return (
    <div className="grid border border-black/20 bg-white lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-9 p-7 md:p-10">
        <RangeControl
          label="Runs / month"
          value={runs}
          min={10000}
          max={1000000}
          step={10000}
          onChange={setRuns}
        />
        <RangeControl
          label="Retry rate"
          value={retries}
          min={0}
          max={30}
          step={1}
          suffix="%"
          onChange={setRetries}
        />
        <RangeControl
          label="Base cost / 1k runs"
          value={modelCost}
          min={1}
          max={20}
          step={1}
          suffix="$"
          onChange={setModelCost}
        />
      </div>
      <div className="bg-[#ff655a] p-7 md:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.13em]">
          Monthly cost anatomy
        </p>
        <div className="mt-8 space-y-5">
          <div className="flex items-end justify-between border-b border-black/20 pb-4">
            <span>Base workload</span>
            <span className="font-pixel text-4xl">${base.toFixed(0)}</span>
          </div>
          <div className="flex items-end justify-between border-b border-black/20 pb-4">
            <span>Retry overhead</span>
            <span className="font-pixel text-4xl">${retryCost.toFixed(0)}</span>
          </div>
          <div className="flex items-end justify-between border-b border-black/20 pb-4">
            <span>Modeled after controls</span>
            <span className="font-pixel text-4xl">${optimized.toFixed(0)}</span>
          </div>
        </div>
        <p className="mt-8 font-pixel text-6xl tracking-[-0.07em]">
          Save ${(base + retryCost - optimized).toFixed(0)}
          <span className="ml-2 font-sans text-sm tracking-normal">
            / month
          </span>
        </p>
      </div>
    </div>
  );
}

const gateItems = [
  "Quality score ≥ 0.90",
  "P95 latency ≤ 4.0s",
  "Cost per run ≤ $0.05",
  "Policy checks passed",
  "Human review complete",
];

export function ReleaseGateBuilder() {
  const [enabled, setEnabled] = useState([true, true, true, false, false]);
  const passed = enabled.filter(Boolean).length;
  return (
    <div className="grid border border-white/15 lg:grid-cols-[1fr_0.72fr]">
      <div>
        {gateItems.map((item, index) => (
          <button
            type="button"
            key={item}
            onClick={() =>
              setEnabled((current) =>
                current.map((value, itemIndex) =>
                  itemIndex === index ? !value : value,
                ),
              )
            }
            aria-pressed={enabled[index]}
            className="flex w-full items-center justify-between border-b border-white/10 p-5 text-left hover:bg-white/5"
          >
            <span className="flex items-center gap-4">
              <span
                className={`flex size-6 items-center justify-center border ${enabled[index] ? "border-[#7ee0b8] bg-[#7ee0b8] text-black" : "border-white/20"}`}
              >
                {enabled[index] ? <Check className="size-3" /> : null}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                {item}
              </span>
            </span>
            <span className="font-mono text-[8px] text-zinc-600">
              {enabled[index] ? "Required" : "Optional"}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col justify-between bg-[#111] p-7">
        <div>
          <ShieldCheck className="size-7 text-[#7ee0b8]" />
          <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500">
            Release gate coverage
          </p>
          <p className="mt-4 font-pixel text-8xl leading-none tracking-[-0.09em]">
            {passed}/5
          </p>
        </div>
        <div className="mt-12">
          <div className="h-2 bg-white/10">
            <div
              className="h-full bg-[#7ee0b8] transition-[width]"
              style={{ width: `${passed * 20}%` }}
            />
          </div>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
            {passed === 5
              ? "Promotion policy complete"
              : "Choose the evidence required to promote"}
          </p>
        </div>
      </div>
    </div>
  );
}

const personas = [
  {
    name: "Developer",
    headline: "Find the exact call that changed the result.",
    features: ["Trace viewer", "Payload inspection", "Deep links"],
  },
  {
    name: "AI lead",
    headline: "Compare quality, latency, and cost before release.",
    features: ["Evaluations", "Experiments", "Release gates"],
  },
  {
    name: "Product",
    headline: "Connect customer outcomes to agent behavior.",
    features: ["Sessions", "Human review", "Reports"],
  },
  {
    name: "Security",
    headline: "Understand the path, access, and retention.",
    features: ["RBAC", "Audit path", "Security review"],
  },
] as const;

export function PersonaRouter() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid border border-black/20 bg-[#eceae3] lg:grid-cols-[0.45fr_1.55fr]">
      <div className="border-b border-black/20 lg:border-b-0 lg:border-r">
        {personas.map((persona, index) => (
          <button
            type="button"
            key={persona.name}
            onClick={() => setActive(index)}
            aria-pressed={active === index}
            className={`flex w-full items-center justify-between border-b border-black/15 p-5 text-left font-mono text-[9px] uppercase tracking-[0.12em] ${active === index ? "bg-black text-white" : "hover:bg-black/5"}`}
          >
            <span>{persona.name}</span>
            <ArrowRight className="size-3" />
          </button>
        ))}
      </div>
      <div className="p-8 md:p-12">
        <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500">
          For the {personas[active].name}
        </p>
        <h3 className="mt-6 max-w-3xl font-pixel text-7xl leading-[0.84] tracking-[-0.07em]">
          {personas[active].headline}
        </h3>
        <div className="mt-10 flex flex-wrap gap-3">
          {personas[active].features.map((feature) => (
            <span
              key={feature}
              className="border border-black/20 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.11em]"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
