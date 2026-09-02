"use client";

import React, { useId, useState } from "react";

type LayerAnswer = "apm" | "ai-observability" | "both";

type LayerScenarioData = {
  scenario: string;
  answer: LayerAnswer;
  reason: string;
};

const LAYER_LABELS: Record<LayerAnswer, string> = {
  apm: "APM",
  "ai-observability": "AI observability",
  both: "Both layers",
};

export function LayerScenario(): React.ReactNode {
  return null;
}

export function LayerScenarioQuiz({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  const headingId = useId();
  const scenarios = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => (child as React.ReactElement<LayerScenarioData>).props)
    .filter((props): props is LayerScenarioData => typeof props?.scenario === "string");

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<LayerAnswer | null>(null);

  if (scenarios.length === 0) return null;
  const current = scenarios[index];
  const isCorrect = picked === current.answer;

  function choose(answer: LayerAnswer) {
    setPicked(answer);
  }

  function next() {
    setPicked(null);
    setIndex((i) => (i + 1) % scenarios.length);
  }

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>
      {intro ? <p className="mt-2 text-sm leading-6 text-black/70">{intro}</p> : null}

      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
        Scenario {index + 1} of {scenarios.length}
      </p>
      <p className="mt-1 text-sm leading-6">{current.scenario}</p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose which layer would have caught this">
        {(["apm", "ai-observability", "both"] as LayerAnswer[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={picked === option}
            onClick={() => choose(option)}
            className={`border border-black px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] ${
              picked === option ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
            }`}
          >
            {LAYER_LABELS[option]}
          </button>
        ))}
      </div>

      {picked ? (
        <div className="mt-4 border-t border-black/20 pt-4" role="status">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/60">
            {isCorrect ? "Correct" : "Not quite"} — the answer is {LAYER_LABELS[current.answer]}
          </p>
          <p className="mt-1 text-sm leading-6">{current.reason}</p>
          <button
            type="button"
            onClick={next}
            className="mt-3 border border-black bg-white px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] hover:bg-black/5"
          >
            Next scenario
          </button>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-black/60">
        This is a static reference with five fixed scenarios: choosing an answer reveals locally rendered text. It
        does not run a model, read production telemetry, or send any data.
      </p>
    </section>
  );
}
