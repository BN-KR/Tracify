"use client";

import React, { useId, useState } from "react";

type EvalSourceOptionData = {
  label: string;
  extracted: string;
  redacted: string;
  category?: string;
};

export function EvalSourceOption(): React.ReactNode {
  return null;
}

export function EvalSourceExplorer({
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
    .map((child) => (child as React.ReactElement<EvalSourceOptionData>).props)
    .filter((props): props is EvalSourceOptionData => typeof props?.label === "string");

  const [activeIndex, setActiveIndex] = useState(0);
  const active = options[activeIndex];

  if (options.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>
      {intro ? <p className="mt-2 text-sm leading-6 text-black/70">{intro}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Evaluation dataset source signals">
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
          {active.category ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
              Maps to category: <span className="text-black">{active.category}</span>
            </p>
          ) : null}
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
            Fields extracted into the test case
          </p>
          <p className="mt-1 text-sm leading-6">{active.extracted}</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
            Fields redacted or dropped
          </p>
          <p className="mt-1 text-sm leading-6">{active.redacted}</p>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-black/60">
        This is a static reference bound to one fixed, illustrative trace: selecting a source signal swaps locally
        rendered text. It does not read production data or call a model.
      </p>
    </section>
  );
}
