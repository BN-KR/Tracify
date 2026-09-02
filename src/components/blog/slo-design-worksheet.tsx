"use client";

import { useId, useMemo, useState } from "react";

type IndicatorType = "availability" | "reliability" | "quality" | "efficiency";

type WorksheetTemplate = {
  label: string;
  hint: string;
  sliDefinition: string;
  measurementWindow: string;
  thresholdRange: string;
  watchOut: string;
};

const INDICATOR_TYPES: Array<{ value: IndicatorType; label: string; hint: string }> = [
  { value: "availability", label: "Availability", hint: "Can the agent be reached and does it respond at all" },
  { value: "reliability", label: "Reliability", hint: "Do runs complete without erroring, timing out, or looping" },
  { value: "quality", label: "Quality", hint: "Are completed outputs correct, grounded, and well-formed" },
  { value: "efficiency", label: "Efficiency", hint: "Cost and latency per successful task, not per call" },
];

const TEMPLATES: Record<IndicatorType, WorksheetTemplate> = {
  availability: {
    label: "Availability",
    hint: "Can the agent be reached and does it respond at all",
    sliDefinition:
      "Proportion of invocation attempts that receive any response (success or handled error) within a fixed timeout, out of all attempts.",
    measurementWindow: "Rolling 30-day window, reviewed weekly.",
    thresholdRange:
      "A team might start around 99.5% for an internal tool and revise upward once real traffic patterns are known.",
    watchOut:
      "A green availability number says nothing about whether the response was correct — pair it with a reliability and quality SLI, never publish it alone.",
  },
  reliability: {
    label: "Reliability",
    hint: "Do runs complete without erroring, timing out, or looping",
    sliDefinition:
      "Proportion of runs that reach a terminal, non-error state without exceeding a defined retry or step-count ceiling, out of all runs that started.",
    measurementWindow: "Rolling 7-day window, reviewed at each release.",
    thresholdRange:
      "A team might start around 97% completion-without-error for a multi-step workflow and tighten it as instrumentation matures.",
    watchOut:
      "A run that retries three times and eventually succeeds still cost money and time — track retry rate as a companion signal, not just the pass/fail outcome.",
  },
  quality: {
    label: "Quality",
    hint: "Are completed outputs correct, grounded, and well-formed",
    sliDefinition:
      "Proportion of completed runs that pass a defined evaluation bar (a rubric, a groundedness check, or a schema check) on a sampled or fully-scored basis.",
    measurementWindow: "Rolling 14-day window, reviewed biweekly alongside the evaluation dataset.",
    thresholdRange:
      "A team might start around 90% pass rate on a rubric-scored sample and treat that number as provisional until a full release cycle of data exists.",
    watchOut:
      "Quality is rarely one number — a single composite score can hide a schema-format regression behind an unchanged accuracy figure. Track format compliance and correctness as separate SLIs.",
  },
  efficiency: {
    label: "Efficiency",
    hint: "Cost and latency per successful task, not per call",
    sliDefinition:
      "Total cost (model, tool, and retry cost) and end-to-end latency divided by the count of successfully completed tasks in the window.",
    measurementWindow: "Rolling 7-day window, reviewed at each release and after any model or pricing change.",
    thresholdRange:
      "A team might start with a hypothetical ceiling like $0.15 per successful task and a p95 latency ceiling of 12 seconds, both specific to their own workflow.",
    watchOut:
      "Cost per run and cost per successful task diverge fast under a high retry rate — a cheaper-looking model can be more expensive once failed attempts are counted.",
  },
};

export function SloDesignWorksheet({ title }: { title: string }) {
  const headingId = useId();
  const groupId = useId();
  const [indicator, setIndicator] = useState<IndicatorType>("quality");

  const template = useMemo(() => TEMPLATES[indicator], [indicator]);

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>

      <fieldset className="mt-4 flex flex-col gap-2">
        <legend className="font-mono text-[11px] uppercase tracking-[0.1em] text-black">Indicator type</legend>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
          {INDICATOR_TYPES.map((option) => {
            const inputId = `${groupId}-${option.value}`;
            const selected = indicator === option.value;
            return (
              <label
                key={option.value}
                htmlFor={inputId}
                className={`flex min-w-[10rem] flex-1 cursor-pointer flex-col gap-0.5 border p-2.5 text-left transition-colors ${
                  selected ? "border-black bg-black text-white" : "border-black/40 bg-white text-black hover:border-black"
                }`}
              >
                <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.06em]">
                  <input
                    id={inputId}
                    type="radio"
                    name={groupId}
                    value={option.value}
                    checked={selected}
                    onChange={() => setIndicator(option.value)}
                    className="h-3.5 w-3.5 accent-[#f4d44d]"
                  />
                  {option.label}
                </span>
                <span className={`text-[11px] leading-snug ${selected ? "text-white/80" : "text-black/60"}`}>{option.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div role="status" className="mt-5 flex flex-col gap-3">
        <div className="border border-black/30 bg-[#f7f7f0] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-black/60">SLI definition</p>
          <p className="mt-1 text-sm leading-6 text-black/80">{template.sliDefinition}</p>
        </div>
        <div className="border border-black/30 bg-[#f7f7f0] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-black/60">Suggested measurement window</p>
          <p className="mt-1 text-sm leading-6 text-black/80">{template.measurementWindow}</p>
        </div>
        <div className="border border-black/30 bg-[#f7f7f0] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-black/60">Example threshold range</p>
          <p className="mt-1 text-sm leading-6 text-black/80">{template.thresholdRange}</p>
        </div>
        <div className="border border-black bg-white p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-black/60">What this indicator does not catch</p>
          <p className="mt-1 text-sm leading-6 text-black/80">{template.watchOut}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-black/60">
        This is a static decision aid: selecting an indicator type reveals a fixed worksheet template on this page. It does
        not call a model, read live telemetry, or store your selection beyond this browser tab. All threshold examples are
        illustrative starting points, not industry-standard figures.
      </p>
    </section>
  );
}
