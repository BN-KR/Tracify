"use client";

import { useId, useMemo, useState } from "react";

type TrafficVolume = "low" | "medium" | "high";
type BlastRadius = "low" | "medium" | "high";
type EvalMaturity = "none" | "basic" | "mature";

type Recommendation = {
  strategy: string;
  reason: string;
  prerequisite: string;
};

const TRAFFIC_OPTIONS: Array<{ value: TrafficVolume; label: string; hint: string }> = [
  { value: "low", label: "Low", hint: "Fewer than ~1,000 runs a day" },
  { value: "medium", label: "Medium", hint: "Roughly 1,000-100,000 runs a day" },
  { value: "high", label: "High", hint: "More than ~100,000 runs a day" },
];

const BLAST_RADIUS_OPTIONS: Array<{ value: BlastRadius; label: string; hint: string }> = [
  { value: "low", label: "Low tolerance", hint: "Actions are irreversible or customer-facing" },
  { value: "medium", label: "Medium tolerance", hint: "Mistakes are visible but recoverable" },
  { value: "high", label: "High tolerance", hint: "Internal, read-only, or easily undone" },
];

const EVAL_OPTIONS: Array<{ value: EvalMaturity; label: string; hint: string }> = [
  { value: "none", label: "None yet", hint: "No dataset, no automatic quality signal" },
  { value: "basic", label: "Basic", hint: "A dataset and a few checks, mostly manual review" },
  { value: "mature", label: "Mature", hint: "Versioned dataset, automatic scoring, known thresholds" },
];

function recommend(traffic: TrafficVolume, blast: BlastRadius, evals: EvalMaturity): Recommendation {
  if (evals === "none") {
    return {
      strategy: "Shadow deployment only",
      reason:
        "With no automatic quality signal, a live canary has no reliable way to detect regressions before users notice. Run the new version alongside the old one on real traffic, compare outputs offline, and do not route any live traffic to it yet.",
      prerequisite: "Build a first evaluation dataset and at least one automatic quality check before considering a canary.",
    };
  }

  if (blast === "low" && evals !== "mature") {
    return {
      strategy: "Shadow deployment, then a feature-flagged canary at low volume",
      reason:
        "Low blast-radius tolerance means an undetected regression is expensive. Basic evals catch obvious breaks but not subtle drift, so extend shadow comparison until confidence is high, then open a small, flag-gated canary with a human reviewing every routed run.",
      prerequisite: "Add regression coverage for the specific failure modes this workflow cannot afford before increasing canary share.",
    };
  }

  if (blast === "low" && evals === "mature") {
    return {
      strategy: "Canary release with automatic rollback",
      reason:
        "Mature evals plus low blast-radius tolerance is the classic case for an automated canary: route a small, fixed percentage of traffic, score it against the same thresholds used in the eval suite, and roll back automatically the moment quality or error rate crosses a defined line.",
      prerequisite: "Confirm the rollback trigger fires on a replayed failing run before trusting it in production.",
    };
  }

  if (traffic === "high" && evals === "mature") {
    return {
      strategy: "Canary release, ramping by cohort",
      reason:
        "High traffic gives a canary statistical power quickly, so a small percentage still yields a meaningful sample within minutes. Ramp exposure in fixed steps, gated by the same automatic thresholds, rather than jumping straight to full traffic.",
      prerequisite: "Segment metrics by cohort so a regression on one segment cannot hide inside a healthy global average.",
    };
  }

  if (traffic === "low" && blast === "high") {
    return {
      strategy: "Blue-green deployment with a fast manual cutover",
      reason:
        "Low traffic makes a canary slow to reach a confident sample, and high blast-radius tolerance means a full cutover carries acceptable risk. Run the new version as a complete standby environment, verify it manually, then flip all traffic at once and keep the old version ready for instant rollback.",
      prerequisite: "Keep the previous version's environment warm and routable until the new version has run cleanly through a full traffic cycle.",
    };
  }

  return {
    strategy: "Canary release with staged ramp-up",
    reason:
      "This combination does not force the extremes: blast radius is manageable and there is at least a basic quality signal. Start with a small canary slice, verify it against your evals, and increase the percentage in stages rather than committing all traffic at once.",
    prerequisite: "Write down the exact percentage steps and the metric thresholds that gate each step before starting the rollout.",
  };
}

function OptionGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  groupId,
}: {
  legend: string;
  options: Array<{ value: T; label: string; hint: string }>;
  value: T;
  onChange: (next: T) => void;
  groupId: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-mono text-[11px] uppercase tracking-[0.1em] text-black">{legend}</legend>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
        {options.map((option) => {
          const inputId = `${groupId}-${option.value}`;
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`flex min-w-[9rem] flex-1 cursor-pointer flex-col gap-0.5 border p-2.5 text-left transition-colors ${
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
                  onChange={() => onChange(option.value)}
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
  );
}

export function RolloutStrategyPicker({ title }: { title: string }) {
  const headingId = useId();
  const groupBase = useId();
  const [traffic, setTraffic] = useState<TrafficVolume>("medium");
  const [blast, setBlast] = useState<BlastRadius>("medium");
  const [evals, setEvals] = useState<EvalMaturity>("basic");

  const recommendation = useMemo(() => recommend(traffic, blast, evals), [traffic, blast, evals]);

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>

      <div className="mt-4 flex flex-col gap-5">
        <OptionGroup legend="Traffic volume" options={TRAFFIC_OPTIONS} value={traffic} onChange={setTraffic} groupId={`${groupBase}-traffic`} />
        <OptionGroup legend="Blast-radius tolerance" options={BLAST_RADIUS_OPTIONS} value={blast} onChange={setBlast} groupId={`${groupBase}-blast`} />
        <OptionGroup legend="Evaluation maturity" options={EVAL_OPTIONS} value={evals} onChange={setEvals} groupId={`${groupBase}-evals`} />
      </div>

      <div role="status" className="mt-5 border border-black bg-[#f4d44d] p-4 text-black">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Recommended strategy</p>
        <p className="mt-2 text-lg font-medium">{recommendation.strategy}</p>
        <p className="mt-2 text-sm leading-6">{recommendation.reason}</p>
        <p className="mt-3 border-t border-black/30 pt-2 text-xs leading-5">
          <span className="font-mono uppercase tracking-[0.08em]">Before you start: </span>
          {recommendation.prerequisite}
        </p>
      </div>

      <p className="mt-3 text-xs text-black/60">
        This is a static decision aid: it maps three inputs to a recommendation using fixed rules on this page. It does not
        call a model, read live telemetry, or store your selections beyond this browser tab.
      </p>
    </section>
  );
}
