"use client";

import React, { useId, useState } from "react";

type RubricSelectorOptionData = {
  label: string;
  layer: string;
  fixedLogic: string;
  subjectiveJudgment: string;
  reason: string;
};

export function RubricSelectorOption(): React.ReactNode {
  return null;
}

const layerToneClass: Record<string, string> = {
  Deterministic: "bg-white text-black border-black",
  "LLM judge": "bg-[#f4d44d] text-black border-black",
  Human: "bg-black text-white border-black",
};

function layerTone(layer: string): string {
  const key = Object.keys(layerToneClass).find((candidate) => layer.startsWith(candidate));
  return key ? layerToneClass[key] : "bg-white text-black border-black";
}

export function RubricSelector({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  const headingId = useId();
  const options = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => (child as React.ReactElement<RubricSelectorOptionData>).props)
    .filter((props): props is RubricSelectorOptionData => typeof props?.label === "string");

  const [activeIndex, setActiveIndex] = useState(0);
  const active = options[activeIndex];

  if (options.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>
      {intro ? <p className="mt-2 text-sm leading-6 text-black/70">{intro}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Evaluation criteria">
        {options.map((option, index) => (
          <button
            key={option.label}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={`border border-black px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] ${
              index === activeIndex ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {active ? (
        <div role="tabpanel" className="mt-5 border-t border-black/20 pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">Recommended layer</p>
          <p className={`mt-2 inline-block border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${layerTone(active.layer)}`}>
            {active.layer}
          </p>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
            Can this be checked with fixed logic?
          </p>
          <p className="mt-1 text-sm leading-6">{active.fixedLogic}</p>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
            Does it require subjective or comparative judgment a rubric can describe?
          </p>
          <p className="mt-1 text-sm leading-6">{active.subjectiveJudgment}</p>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">Why this layer</p>
          <p className="mt-1 text-sm leading-6">{active.reason}</p>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-black/60">
        This is a static reference bound to a fixed, illustrative mapping: selecting a criterion swaps locally
        rendered text answering the two routing questions. It does not call a model or read production data.
      </p>
    </section>
  );
}
