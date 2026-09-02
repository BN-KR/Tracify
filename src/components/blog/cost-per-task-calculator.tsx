"use client";

import { useId, useMemo, useState } from "react";

type CostPerTaskCalculatorProps = {
  title: string;
  modelCostPerRun: number;
  toolCostPerRun: number;
  retryRate: number;
  successRate: number;
};

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.1em] text-black">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => {
            const next = Number(event.target.value);
            onChange(Number.isFinite(next) ? Math.min(max, Math.max(min, next)) : min);
          }}
          className="w-full border border-black bg-white px-2.5 py-1.5 font-mono text-sm text-black"
        />
        {suffix ? <span className="font-mono text-xs text-black/60">{suffix}</span> : null}
      </div>
    </div>
  );
}

/**
 * Illustrative client-side arithmetic only. No data leaves the page, no
 * model or billing API is called, and the pre-filled values are a
 * hypothetical worked example, not a benchmark or a real customer figure.
 */
export function CostPerTaskCalculator({
  title,
  modelCostPerRun,
  toolCostPerRun,
  retryRate,
  successRate,
}: CostPerTaskCalculatorProps) {
  const headingId = useId();
  const [modelCost, setModelCost] = useState(modelCostPerRun);
  const [toolCost, setToolCost] = useState(toolCostPerRun);
  const [retry, setRetry] = useState(retryRate);
  const [success, setSuccess] = useState(successRate);

  const result = useMemo(() => {
    const retryFraction = Math.min(0.95, Math.max(0, retry / 100));
    const successFraction = Math.min(1, Math.max(0.0001, success / 100));

    // Illustrative formula: each retry attempt adds one more model + tool
    // call before a run finally lands (success or not). Total cost per run
    // then gets divided by the successful-task fraction to reach cost per
    // successful task.
    const perAttemptCost = modelCost + toolCost;
    const expectedAttempts = 1 / (1 - retryFraction);
    const costPerRun = perAttemptCost * expectedAttempts;
    const costPerSuccessfulTask = costPerRun / successFraction;
    const multiplier = costPerSuccessfulTask / perAttemptCost;

    return { costPerRun, costPerSuccessfulTask, multiplier };
  }, [modelCost, toolCost, retry, success]);

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField
          id="cptc-model"
          label="Model cost per run"
          value={modelCost}
          min={0}
          max={5}
          step={0.001}
          suffix="USD"
          onChange={setModelCost}
        />
        <NumberField
          id="cptc-tool"
          label="Tool / API cost per run"
          value={toolCost}
          min={0}
          max={5}
          step={0.001}
          suffix="USD"
          onChange={setToolCost}
        />
        <NumberField
          id="cptc-retry"
          label="Retry rate"
          value={retry}
          min={0}
          max={95}
          step={1}
          suffix="%"
          onChange={setRetry}
        />
        <NumberField
          id="cptc-success"
          label="Success rate"
          value={success}
          min={1}
          max={100}
          step={1}
          suffix="%"
          onChange={setSuccess}
        />
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-black/20 pt-4 font-mono text-xs sm:grid-cols-3">
        <div>
          <dt className="uppercase tracking-[0.08em] text-black/60">Cost per run</dt>
          <dd className="mt-1 text-sm">{formatUsd(result.costPerRun)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.08em] text-black/60">Cost per successful task</dt>
          <dd className="mt-1 text-base font-semibold">{formatUsd(result.costPerSuccessfulTask)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.08em] text-black/60">Multiple of raw model+tool cost</dt>
          <dd className="mt-1 text-sm">{result.multiplier.toFixed(1)}x</dd>
        </div>
      </dl>

      <p role="status" className="mt-4 border border-black/30 bg-white p-3 text-sm text-black/70">
        At {retry}% retries and {success}% success, cost per successful task is {result.multiplier.toFixed(1)}x the
        raw model-plus-tool cost of a single attempt. Lower the success rate further and watch the multiple grow
        faster than the retry rate alone would suggest.
      </p>

      <p className="mt-3 text-xs text-black/60">
        Static planning tool: it computes cost per successful task from the four inputs above using the formula in
        this article. It does not call a model or billing API, and the pre-filled values are a hypothetical worked
        example, not a benchmark.
      </p>
    </section>
  );
}
