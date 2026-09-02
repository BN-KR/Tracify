"use client";

import { useId, useMemo, useState } from "react";

type ChangeType = "prompt" | "model" | "tool" | "retrieval" | "orchestration";
type CheckLevel = "required" | "recommended" | "optional";

type ChecklistItem = {
  check: string;
  level: CheckLevel;
  detail: string;
};

const CHANGE_TYPES: Array<{ value: ChangeType; label: string; hint: string }> = [
  { value: "prompt", label: "Prompt", hint: "Wording, instructions, or few-shot examples change" },
  { value: "model", label: "Model", hint: "Provider, model family, or model version changes" },
  { value: "tool", label: "Tool", hint: "A tool is added, removed, or its schema changes" },
  { value: "retrieval", label: "Retrieval", hint: "Index, embedding model, or retrieval logic changes" },
  { value: "orchestration", label: "Orchestration", hint: "Control flow, routing, or step order changes" },
];

const CHECKLISTS: Record<ChangeType, ChecklistItem[]> = {
  prompt: [
    {
      check: "Contract check",
      level: "recommended",
      detail: "Confirm output format and required fields still parse; a wording change rarely breaks structure but can.",
    },
    {
      check: "Eval suite",
      level: "required",
      detail: "Run the targeted regression cases the prompt change is meant to affect, plus a small general sample.",
    },
    {
      check: "Staged exposure",
      level: "recommended",
      detail: "A small traffic slice for low-risk wording changes; skip only when the change is trivial and reversible in seconds.",
    },
    {
      check: "Rollback trigger",
      level: "required",
      detail: "Define the eval-score or error-rate threshold that reverts the prompt version before exposure begins.",
    },
    { check: "Owner", level: "required", detail: "Name who watches the exposure window and can revert the prompt version." },
  ],
  model: [
    {
      check: "Contract check",
      level: "required",
      detail: "Verify output format, tool-call syntax, and stop behavior against the new model; format drift is common across model versions.",
    },
    {
      check: "Eval suite",
      level: "required",
      detail: "Run the full representative dataset, not a targeted subset — a model swap can shift behavior anywhere in the distribution.",
    },
    {
      check: "Staged exposure",
      level: "required",
      detail: "Route a limited share of traffic first; a model change affects cost, tool-call frequency, and quality simultaneously.",
    },
    {
      check: "Rollback trigger",
      level: "required",
      detail: "Set thresholds for quality, error rate, and cost per run — a model change can regress any of the three independently.",
    },
    { check: "Owner", level: "required", detail: "Name an owner who can compare cost and quality dashboards during the window, not just uptime." },
  ],
  tool: [
    {
      check: "Contract check",
      level: "required",
      detail: "Confirm the tool's argument schema, permission scope, and error shape match what the agent expects.",
    },
    {
      check: "Eval suite",
      level: "recommended",
      detail: "Run cases that exercise the tool directly and cases where the model must choose between it and similar tools.",
    },
    {
      check: "Staged exposure",
      level: "required",
      detail: "Especially for a write or irreversible tool, expose to a narrow cohort with active monitoring before full rollout.",
    },
    {
      check: "Rollback trigger",
      level: "required",
      detail: "Define a tool-error-rate and unauthorized-call threshold; a broken tool integration should stop routing immediately.",
    },
    { check: "Owner", level: "required", detail: "Name the owner of the tool integration, not only the agent — the fix may live in either system." },
  ],
  retrieval: [
    {
      check: "Contract check",
      level: "recommended",
      detail: "Confirm the retrieved-document shape and citation fields the agent depends on are unchanged.",
    },
    {
      check: "Eval suite",
      level: "required",
      detail: "Run groundedness and relevance cases; an index or embedding-model change can silently shift what gets retrieved.",
    },
    {
      check: "Staged exposure",
      level: "recommended",
      detail: "A partial rollout catches stale or degraded retrieval before it reaches every user.",
    },
    {
      check: "Rollback trigger",
      level: "required",
      detail: "Set a groundedness or citation-accuracy threshold; a quiet drop here rarely shows up in error rate alone.",
    },
    { check: "Owner", level: "required", detail: "Name whoever owns the retrieval pipeline and indexing job." },
  ],
  orchestration: [
    {
      check: "Contract check",
      level: "required",
      detail: "Confirm step order, terminal states, and handoff formats between steps still match downstream expectations.",
    },
    {
      check: "Eval suite",
      level: "required",
      detail: "Run multi-step and edge-case scenarios; a routing or control-flow change can affect outcomes far from the changed step.",
    },
    {
      check: "Staged exposure",
      level: "required",
      detail: "Orchestration changes tend to have the widest blast radius — start narrow and watch every downstream step.",
    },
    {
      check: "Rollback trigger",
      level: "required",
      detail: "Define thresholds per affected step, not only the final outcome, so a mid-workflow regression is caught early.",
    },
    { check: "Owner", level: "required", detail: "Name the owner of the overall workflow, since the failure may span several individually-owned components." },
  ],
};

const LEVEL_STYLES: Record<CheckLevel, string> = {
  required: "border-black bg-black text-white",
  recommended: "border-black bg-[#f4d44d] text-black",
  optional: "border-black/40 bg-white text-black",
};

export function ReleaseReadinessChecklist({ title }: { title: string }) {
  const headingId = useId();
  const groupId = useId();
  const [changeType, setChangeType] = useState<ChangeType>("model");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const items = useMemo(() => CHECKLISTS[changeType], [changeType]);

  function toggle(check: string) {
    const key = `${changeType}:${check}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>

      <fieldset className="mt-4 flex flex-col gap-2">
        <legend className="font-mono text-[11px] uppercase tracking-[0.1em] text-black">Change type</legend>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
          {CHANGE_TYPES.map((option) => {
            const inputId = `${groupId}-${option.value}`;
            const selected = changeType === option.value;
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
                    onChange={() => setChangeType(option.value)}
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

      <div role="status" className="mt-5 flex flex-col gap-2">
        {items.map((item) => {
          const key = `${changeType}:${item.check}`;
          const isChecked = Boolean(checked[key]);
          return (
            <label
              key={item.check}
              className={`flex cursor-pointer items-start gap-3 border p-3 text-left transition-colors ${
                isChecked ? "border-black bg-[#f7f7f0]" : "border-black/30 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(item.check)}
                className="mt-1 h-4 w-4 accent-[#f4d44d]"
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className={`${isChecked ? "line-through decoration-black/50" : ""} font-medium`}>{item.check}</span>
                  <span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${LEVEL_STYLES[item.level]}`}>
                    {item.level}
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-6 text-black/70">{item.detail}</span>
              </span>
            </label>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-black/60">
        This is a static decision aid: selecting a change type reveals a fixed subset of the Change-Type Release Matrix on
        this page. It does not call a model, read live telemetry, or store your selections beyond this browser tab.
      </p>
    </section>
  );
}
