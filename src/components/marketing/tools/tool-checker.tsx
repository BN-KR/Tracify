"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { checkTools, type Level } from "@/lib/tools/tool-checker";
import { heuristicTokens } from "@/lib/tools/tokens";
import { Badge, buttonClass, Caption, ghostClass, Metric, MetricGrid, TableFrame, td, TextArea, th } from "./ui";
import { useTokenizer } from "./use-tokenizer";
import { sampleTools } from "./samples";

const tone: Record<Level, "error" | "warning" | "tip"> = { error: "error", warning: "warning", tip: "tip" };
const levelLabel: Record<Level, string> = { error: "Fix", warning: "Should fix", tip: "Nice to fix" };
const formatName = { openai: "OpenAI", "openai-responses": "OpenAI Responses", anthropic: "Anthropic", mcp: "MCP", gemini: "Gemini", unknown: "Unknown" } as const;

export function ToolChecker() {
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Level | "all">("all");
  const { tokenizer } = useTokenizer();
  const deferred = useDeferredValue(text);
  const report = useMemo(() => (deferred.trim() ? checkTools(deferred.slice(0, 1_000_000), tokenizer ? tokenizer.count : heuristicTokens) : null), [deferred, tokenizer]);

  const counts = report?.ok ? { error: report.issues.filter((i) => i.level === "error").length, warning: report.issues.filter((i) => i.level === "warning").length, tip: report.issues.filter((i) => i.level === "tip").length } : null;
  const issues = report?.ok ? report.issues.filter((i) => filter === "all" || i.level === filter) : [];

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <TextArea
          label="Paste your tool definitions (JSON)"
          value={text}
          onChange={setText}
          rows={14}
          mono
          placeholder={'An array of tools in OpenAI, Anthropic, MCP or Gemini format, for example:\n[{"name": "get_weather", "description": "…", "input_schema": {…}}]'}
          hint="Nothing is uploaded. Slightly broken JSON (single quotes, trailing commas) is repaired for you."
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={buttonClass} onClick={() => setText(sampleTools)}>Try an example with mistakes</button>
          <button type="button" className={ghostClass} onClick={() => setText("")} disabled={!text}>Clear</button>
        </div>
      </div>

      {!report ? (
        <p className="border border-dashed border-black/40 p-6 text-sm leading-6 text-black/65">Paste the tools array you send to the model. You will get a score, a list of problems in plain words, and how many tokens the definitions cost on every call.</p>
      ) : !report.ok ? (
        <div role="alert" className="border border-black bg-white p-6">
          <p className="font-medium">Could not read this.</p>
          <p className="mt-2 text-sm leading-6 text-black/70">{report.error}</p>
        </div>
      ) : (
        <>
          <MetricGrid label="Tool definition summary">
            <Metric strong={report.score < 70} label="Score" value={`${report.score} / 100`} note={report.score >= 90 ? "Looks solid" : report.score >= 70 ? "Good, with things to tidy" : "Likely to cause wrong tool calls"} />
            <Metric label="Problems" value={`${counts?.error ?? 0} fix · ${counts?.warning ?? 0} should fix`} note={`${counts?.tip ?? 0} small suggestions`} />
            <Metric label="Tools read" value={String(report.tools.length)} note={`Format: ${report.formats.map((f) => formatName[f]).join(", ")}${report.repaired ? ". The JSON was repaired first." : ""}`} />
            <Metric label="Cost on every call" value={`${report.totalTokens.toLocaleString("en-US")} tokens`} note="Definitions are sent with each request" />
          </MetricGrid>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Caption>What to fix</Caption>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter problems">
                {(["all", "error", "warning", "tip"] as const).map((f) => (
                  <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`min-h-11 border border-black px-3 font-mono text-[11px] uppercase tracking-[0.1em] ${filter === f ? "bg-black text-[#eceae3]" : "hover:bg-[#f4d44d]"}`}>
                    {f === "all" ? `All (${report.issues.length})` : `${levelLabel[f]} (${counts?.[f] ?? 0})`}
                  </button>
                ))}
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {issues.length === 0 ? <li className="border border-black bg-white p-5 text-sm">{report.issues.length === 0 ? "No problems found. Nice work." : "Nothing in this group."}</li> : null}
              {issues.slice(0, 200).map((i, idx) => (
                <li key={idx} className="border border-black bg-white p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={tone[i.level]}>{levelLabel[i.level]}</Badge>
                    <p className="font-medium">{i.title}</p>
                    {i.tool ? <span className="ml-auto font-mono text-xs text-black/55">{i.tool}{i.path ? ` · ${i.path}` : ""}</span> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-black/70">{i.detail}</p>
                  <p className="mt-2 text-sm leading-6"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">Fix </span>{i.fix}</p>
                </li>
              ))}
            </ul>
            {issues.length > 200 ? <p className="mt-2 text-xs text-black/60">Showing the first 200 of {issues.length}.</p> : null}
          </div>

          <div>
            <Caption>Your tools</Caption>
            <div className="mt-4">
              <TableFrame label="Tools found">
                <table className="w-full min-w-[520px] border-collapse">
                  <thead><tr><th className={th}>Tool</th><th className={th}>Format</th><th className={`${th} text-right`}>Parameters</th><th className={`${th} text-right`}>Required</th><th className={`${th} text-right`}>Tokens</th></tr></thead>
                  <tbody>
                    {report.tools.slice(0, 200).map((t, i) => (
                      <tr key={`${t.name}-${i}`}>
                        <td className={`${td} break-words`}>{t.name}</td>
                        <td className={td}>{formatName[t.format]}</td>
                        <td className={`${td} text-right tabular-nums`}>{t.parameters}</td>
                        <td className={`${td} text-right tabular-nums`}>{t.required}</td>
                        <td className={`${td} text-right tabular-nums`}>{t.tokens.toLocaleString("en-US")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableFrame>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
