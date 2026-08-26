"use client";

import { useId, useMemo, useState } from "react";

type ContextBudgetCalculatorProps = {
  title: string;
  contextLimit: number;
  systemPromptTokens: number;
  toolDefinitionTokens: number;
  historyTokens: number;
  scratchTokens: number;
};

const MODEL_PRESETS: Array<{ label: string; tokens: number }> = [
  { label: "8K context", tokens: 8_000 },
  { label: "32K context", tokens: 32_000 },
  { label: "128K context", tokens: 128_000 },
  { label: "200K context", tokens: 200_000 },
  { label: "1M context", tokens: 1_000_000 },
];

function formatTokens(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function Slider({
  id,
  label,
  value,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.1em] text-black">
          {label}
        </label>
        <span className="font-mono text-xs text-black/70">{formatTokens(value)} tok</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={Math.max(1, Math.round(max / 200))}
        value={value}
        aria-valuetext={`${formatTokens(value)} tokens`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none border border-black bg-white accent-black"
      />
    </div>
  );
}

export function ContextBudgetCalculator({
  title,
  contextLimit,
  systemPromptTokens,
  toolDefinitionTokens,
  historyTokens,
  scratchTokens,
}: ContextBudgetCalculatorProps) {
  const headingId = useId();
  const [limit, setLimit] = useState(contextLimit);
  const [systemPrompt, setSystemPrompt] = useState(systemPromptTokens);
  const [tools, setTools] = useState(toolDefinitionTokens);
  const [history, setHistory] = useState(historyTokens);
  const [scratch, setScratch] = useState(scratchTokens);

  const total = systemPrompt + tools + history + scratch;
  const remaining = limit - total;
  const usedPct = useMemo(() => Math.min(100, (total / limit) * 100), [total, limit]);
  const isOver = remaining < 0;
  const isNearLimit = !isOver && usedPct >= 85;

  const segments = [
    { key: "system", label: "System prompt", value: systemPrompt, color: "#000000" },
    { key: "tools", label: "Tool definitions", value: tools, color: "#4b4b4b" },
    { key: "history", label: "Conversation history", value: history, color: "#8a8a8a" },
    { key: "scratch", label: "Scratch / working memory", value: scratch, color: "#f4d44d" },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="my-8 border border-black bg-white p-5 text-black"
    >
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Model context limit">
        {MODEL_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setLimit(preset.tokens)}
            aria-pressed={limit === preset.tokens}
            className={`border border-black px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] ${
              limit === preset.tokens ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Slider id="cbc-system" label="System prompt" value={systemPrompt} max={Math.max(4_000, limit / 8)} onChange={setSystemPrompt} />
        <Slider id="cbc-tools" label="Tool definitions" value={tools} max={Math.max(6_000, limit / 6)} onChange={setTools} />
        <Slider id="cbc-history" label="Conversation history" value={history} max={Math.max(20_000, limit)} onChange={setHistory} />
        <Slider id="cbc-scratch" label="Scratch / working memory" value={scratch} max={Math.max(8_000, limit / 4)} onChange={setScratch} />
      </div>

      <div
        className="mt-5 flex h-4 w-full overflow-hidden border border-black"
        role="img"
        aria-label={`Budget usage: ${segments.map((segment) => `${segment.label} ${formatTokens(segment.value)} tokens`).join(", ")}. Limit ${formatTokens(limit)} tokens.`}
      >
        {segments.map((segment) => (
          <div
            key={segment.key}
            style={{
              width: `${Math.max(0, (segment.value / limit) * 100)}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
        <div>
          <dt className="uppercase tracking-[0.08em] text-black/60">Total used</dt>
          <dd className="mt-1 text-sm">{formatTokens(total)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.08em] text-black/60">Limit</dt>
          <dd className="mt-1 text-sm">{formatTokens(limit)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.08em] text-black/60">Remaining</dt>
          <dd className="mt-1 text-sm">{formatTokens(Math.abs(remaining))}{isOver ? " over" : ""}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.08em] text-black/60">Used</dt>
          <dd className="mt-1 text-sm">{usedPct.toFixed(1)}%</dd>
        </div>
      </dl>

      <p
        role="status"
        className={`mt-4 border p-3 text-sm ${
          isOver
            ? "border-black bg-black text-white"
            : isNearLimit
              ? "border-black bg-[#f4d44d] text-black"
              : "border-black/30 bg-white text-black/70"
        }`}
      >
        {isOver
          ? `Over budget by ${formatTokens(Math.abs(remaining))} tokens. Trim history, offload to retrieval, or summarize before the next call.`
          : isNearLimit
            ? `Within ${formatTokens(remaining)} tokens of the limit. Plan a compaction pass before the next few turns.`
            : `${formatTokens(remaining)} tokens of headroom left in this budget.`}
      </p>

      <p className="mt-3 text-xs text-black/60">
        This is a static planning tool: it sums the four components against a chosen context window and does not call a model,
        read live telemetry, or store input beyond this page view.
      </p>
    </section>
  );
}
