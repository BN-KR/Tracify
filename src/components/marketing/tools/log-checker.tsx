"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { analyzeLog, formatMs, type Severity } from "@/lib/tools/log-checker";
import { callCost, getModel, models, money } from "@/lib/tools/models";
import { Badge, buttonClass, Caption, ghostClass, Metric, MetricGrid, TableFrame, td, TextArea, th } from "./ui";
import { sampleLog, sampleTrace } from "./samples";

const tone: Record<Severity, "problem" | "warning" | "tip"> = { problem: "problem", warning: "warning", tip: "tip" };
const toneLabel: Record<Severity, string> = { problem: "Problem", warning: "Warning", tip: "Tip" };
const formatLabel = { "json-trace": "JSON trace", "json-lines": "JSON lines", messages: "Chat messages", "text-log": "Plain text log", empty: "Nothing read" } as const;

export function LogChecker() {
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState("gpt-4o");
  const [fileNote, setFileNote] = useState("");
  const deferred = useDeferredValue(text);
  const analysis = useMemo(() => analyzeLog(deferred), [deferred]);
  const model = getModel(modelId) ?? models[0];
  const t = analysis.totals;
  const hasInput = text.trim().length > 0;
  const maxDuration = Math.max(1, ...analysis.steps.map((s) => s.durationMs ?? 0));
  const cost = callCost(model, t.inputTokens, t.outputTokens);
  const wasteCost = callCost(model, t.wastedTokens * 0.8, t.wastedTokens * 0.2); // rough split: waste is mostly input

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 4_000_000) {
      setFileNote("That file is over 4 MB. Paste the part around the failure instead.");
      return;
    }
    try {
      setText(await file.text());
      setFileNote(`Loaded ${file.name}`);
    } catch {
      setFileNote("Could not read that file.");
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <TextArea
          label="Paste your agent log or trace"
          value={text}
          onChange={setText}
          rows={14}
          mono
          placeholder={'JSON trace, JSON lines, a chat message list with tool calls, an OpenTelemetry export or a plain text log.\n\n[{"name": "search", "type": "tool", "duration_ms": 420}, …]'}
          hint="Nothing is uploaded. It is read in your browser and gone when you close the tab. Remove secrets first anyway."
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={buttonClass} onClick={() => setText(sampleTrace)}>Example: failing JSON trace</button>
          <button type="button" className={buttonClass} onClick={() => setText(sampleLog)}>Example: text log</button>
          <label className={`${buttonClass} inline-flex cursor-pointer items-center`}>
            Open a file
            <input type="file" accept=".json,.jsonl,.log,.txt,.ndjson,text/*,application/json" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          <button type="button" className={ghostClass} onClick={() => { setText(""); setFileNote(""); }} disabled={!hasInput}>Clear</button>
          {fileNote ? <span className="text-xs text-black/60" role="status">{fileNote}</span> : null}
        </div>
      </div>

      {!hasInput ? (
        <p className="border border-dashed border-black/40 p-6 text-sm leading-6 text-black/65">Paste a log above, or try an example. You will get the first failure, the slow steps, repeated calls and wasted tokens, each with something to try next.</p>
      ) : t.steps === 0 ? (
        <div role="status" className="border border-black bg-white p-6">
          <p className="font-medium">Nothing here looked like an agent step.</p>
          {analysis.notes.map((n) => <p key={n} className="mt-2 text-sm leading-6 text-black/65">{n}</p>)}
        </div>
      ) : (
        <>
          <MetricGrid label="Summary of the run">
            <Metric strong={t.errors > 0} label="Result" value={t.errors > 0 ? `${t.errors} failed` : "No failures"} note={`${t.steps} steps read as ${formatLabel[analysis.format].toLowerCase()}${t.llmCalls ? `, ${t.llmCalls} model calls, ${t.toolCalls} tool calls` : ""}`} />
            <Metric label="Total time" value={t.wallMs !== undefined ? formatMs(t.wallMs) : "Unknown"} note={t.wallMs === undefined ? "No timestamps or durations found" : undefined} />
            <Metric label={`Tokens${t.tokensEstimated ? " (partly estimated)" : ""}`} value={(t.inputTokens + t.outputTokens).toLocaleString("en-US")} note={t.inputTokens + t.outputTokens ? `${t.inputTokens.toLocaleString("en-US")} in, ${t.outputTokens.toLocaleString("en-US")} out, about ${money(cost)} on ${model.name}` : "No token counts found"} />
            <Metric label="Wasted tokens" value={t.wastedTokens.toLocaleString("en-US")} note={t.wastedTokens ? `Repeats and failed calls, about ${money(wasteCost)} on ${model.name}` : "No model tokens were lost to repeats or failed calls"} />
          </MetricGrid>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Caption>What we found</Caption>
              <label className="font-mono text-[11px] uppercase tracking-[0.08em]">
                Price tokens as
                <select value={modelId} onChange={(e) => setModelId(e.target.value)} className="ml-2 min-h-11 border border-black bg-white px-2 font-mono text-xs normal-case">
                  {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
            </div>
            <ul className="mt-4 space-y-3">
              {analysis.findings.map((f) => (
                <li key={f.id} className="border border-black bg-white p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={tone[f.severity]}>{toneLabel[f.severity]}</Badge>
                    <p className="font-medium">{f.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-black/70">{f.detail}</p>
                  {f.fix ? <p className="mt-2 text-sm leading-6"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">Try this </span>{f.fix}</p> : null}
                </li>
              ))}
            </ul>
            {analysis.notes.length ? (
              <ul className="mt-4 space-y-1 text-xs leading-5 text-black/60">{analysis.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            ) : null}
          </div>

          <div>
            <Caption>Step by step</Caption>
            <div className="mt-4">
              <TableFrame label="Steps in the run">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr>
                      <th className={th}>#</th>
                      <th className={th}>Step</th>
                      <th className={th}>Kind</th>
                      <th className={th}>Result</th>
                      <th className={th}>Time</th>
                      <th className={`${th} text-right`}>Tokens in / out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.steps.slice(0, 300).map((s) => (
                      <tr key={s.index} className={s.status === "error" ? "bg-[#f4d44d]/30" : ""}>
                        <td className={`${td} tabular-nums text-black/50`}>{s.index + 1}</td>
                        <td className={`${td} max-w-[260px] break-words`}>{s.name}{s.model ? <span className="block text-[11px] text-black/50">{s.model}</span> : null}</td>
                        <td className={`${td} text-black/60`}>{s.kind}</td>
                        <td className={`${td} max-w-[280px]`}>{s.status === "error" ? <><Badge tone="error">Failed</Badge><span className="mt-1 block break-words text-[11px] leading-4 text-black/60">{s.error}</span></> : <span className="text-black/50">ok</span>}</td>
                        <td className={`${td} min-w-[150px]`}>
                          {s.durationMs !== undefined ? (
                            <>
                              <span className="tabular-nums">{formatMs(s.durationMs)}</span>
                              <span className="mt-1 block h-1.5 bg-black/10" aria-hidden="true"><span className="block h-full bg-black" style={{ width: `${Math.max(2, Math.round((s.durationMs / maxDuration) * 100))}%` }} /></span>
                            </>
                          ) : <span className="text-black/40">—</span>}
                        </td>
                        <td className={`${td} text-right tabular-nums`}>{s.inputTokens !== undefined || s.outputTokens !== undefined ? `${(s.inputTokens ?? 0).toLocaleString("en-US")} / ${(s.outputTokens ?? 0).toLocaleString("en-US")}${s.tokensEstimated ? " ~" : ""}` : <span className="text-black/40">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableFrame>
              {analysis.steps.length > 300 ? <p className="mt-2 text-xs text-black/60">Showing the first 300 of {analysis.steps.length} steps. The findings above cover all of them.</p> : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
