"use client";

import React, { useId, useState } from "react";

type FailureModeOptionData = {
  label: string;
  symptom: string;
  strategy: string;
  code?: string;
};

export function FailureModeOption(): React.ReactNode {
  return null;
}

export function FailureModeExplorer({
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
    .map((child) => (child as React.ReactElement<FailureModeOptionData>).props)
    .filter((props): props is FailureModeOptionData => typeof props?.label === "string");

  const [activeIndex, setActiveIndex] = useState(0);
  const active = options[activeIndex];

  if (options.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>
      {intro ? <p className="mt-2 text-sm leading-6 text-black/70">{intro}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Tool-call failure modes">
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
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">Symptom</p>
          <p className="mt-1 text-sm leading-6">{active.symptom}</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">Recommended handling</p>
          <p className="mt-1 text-sm leading-6">{active.strategy}</p>
          {active.code ? (
            <pre className="mt-3 overflow-x-auto border border-black bg-black p-3 font-mono text-xs leading-6 text-[#f5f5f2]">
              <code>{active.code}</code>
            </pre>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-xs text-black/60">
        This is a static reference: selecting a failure mode swaps locally rendered text and a code snippet. It does not
        execute a call, run a model, or read production data.
      </p>
    </section>
  );
}
