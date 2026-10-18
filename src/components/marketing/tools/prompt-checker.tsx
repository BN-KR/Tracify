"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { analyzePrompt } from "@/lib/tools/prompt-checker";
import { callCost, getModel, models, money } from "@/lib/tools/models";
import { countFor, heuristicTokens } from "@/lib/tools/tokens";
import { Badge, buttonClass, Caption, CopyButton, ghostClass, Metric, MetricGrid, NumberField, SelectModel, TableFrame, td, TextArea, th } from "./ui";
import { useTokenizer } from "./use-tokenizer";
import { samplePrompt } from "./samples";

const COMPARE = ["gpt-5.4-mini", "gpt-4o", "claude-haiku-5-5", "claude-sonnet-5-5", "gemini-3.8-flash", "deepseek-v4-flash"];

export function PromptChecker() {
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState("gpt-4o");
  const [reply, setReply] = useState(300);
  const [callsPerMonth, setCalls] = useState(100_000);
  const { tokenizer, status } = useTokenizer();
  const deferred = useDeferredValue(text);
  const model = getModel(modelId) ?? models[0];

  const analysis = useMemo(() => analyzePrompt(deferred.slice(0, 500_000), tokenizer ? tokenizer.count : heuristicTokens), [deferred, tokenizer]);
  const ratio = analysis.tokens > 0 ? analysis.shortenedTokens / analysis.tokens : 1;
  const tokensBefore = countFor(model.family, deferred, tokenizer ? analysis.tokens : null).tokens;
  const tokensAfter = Math.round(tokensBefore * ratio);
  const costBefore = callCost(model, tokensBefore, reply);
  const costAfter = callCost(model, tokensAfter, reply);
  const savedPct = tokensBefore > 0 ? Math.round(((tokensBefore - tokensAfter) / tokensBefore) * 100) : 0;
  const empty = !deferred.trim();
  const applied = analysis.suggestions.filter((s) => s.applied);
  const advice = analysis.suggestions.filter((s) => !s.applied);

  const compare = useMemo(() => COMPARE.map((id) => getModel(id)).filter((m): m is NonNullable<typeof m> => !!m).map((m) => {
    const b = countFor(m.family, deferred, tokenizer ? analysis.tokens : null).tokens;
    return { m, before: callCost(m, b, reply), after: callCost(m, Math.round(b * ratio), reply) };
  }), [deferred, tokenizer, analysis.tokens, ratio, reply]);

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <TextArea label="Your prompt" value={text} onChange={setText} rows={16} placeholder="Paste a system prompt or a full prompt here…" hint={status === "failed" ? "The OpenAI tokenizer could not load, so counts are rough estimates." : "Nothing is uploaded. Counts use the real OpenAI tokenizer; other families are scaled estimates."} />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={buttonClass} onClick={() => setText(samplePrompt)}>Try an example</button>
            <button type="button" className={ghostClass} onClick={() => setText("")} disabled={!text}>Clear</button>
          </div>
        </div>
        <div className="space-y-4">
          <TextArea label="Shorter version (safe changes only)" value={empty ? "" : analysis.shortened} onChange={() => {}} rows={16} placeholder="The shortened prompt appears here." hint={applied.length ? "Only changes that keep the meaning exactly are applied. Read it before you use it." : undefined} />
          <div className="flex flex-wrap items-center gap-3">
            <CopyButton text={analysis.shortened} label="Copy shorter prompt" disabled={empty} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <SelectModel label="Price it on" value={modelId} onChange={setModelId} />
        <NumberField label="Expected reply (tokens)" value={reply} onChange={(v) => setReply(Math.max(0, v))} step={50} hint="Output costs more than input." />
        <NumberField label="Calls per month" value={callsPerMonth} onChange={(v) => setCalls(Math.max(0, v))} step={10000} hint="To work out the monthly saving." />
      </div>

      {empty ? (
        <p className="border border-dashed border-black/40 p-6 text-sm leading-6 text-black/65">Paste a prompt, or try the example, to see how many tokens it uses, a shorter version, and what each call costs.</p>
      ) : (
        <>
          <MetricGrid label="Prompt size and cost">
            <Metric strong label="Tokens saved per call" value={(tokensBefore - tokensAfter).toLocaleString("en-US")} note={`${tokensBefore.toLocaleString("en-US")} → ${tokensAfter.toLocaleString("en-US")} tokens (${savedPct}% shorter)`} />
            <Metric label="Saved per month" value={money(Math.max(0, costBefore - costAfter) * callsPerMonth)} note={`${callsPerMonth.toLocaleString("en-US")} calls on ${model.name}`} />
            <Metric label="Cost per call now" value={money(costBefore)} note={`With a ${reply.toLocaleString("en-US")} token reply`} />
            <Metric label="Cost per call after" value={money(costAfter)} note={`${analysis.stats.words.toLocaleString("en-US")} words, ${analysis.stats.lines.toLocaleString("en-US")} lines`} />
          </MetricGrid>

          <div>
            <Caption>What was changed and what to look at</Caption>
            <ul className="mt-4 space-y-3">
              {analysis.suggestions.length === 0 ? (
                <li className="border border-black bg-white p-4 text-sm leading-6 md:p-5">Nothing obvious to cut. This prompt is already tight. The biggest remaining saving is usually fewer calls, a cache-friendly prompt start, or a cheaper model for easy steps.</li>
              ) : null}
              {[...applied, ...advice].map((s) => (
                <li key={s.id} className="border border-black bg-white p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={s.applied ? "ok" : "tip"}>{s.applied ? "Applied" : "Your call"}</Badge>
                    <p className="font-medium">{s.title}</p>
                    {s.applied && s.savedTokens > 0 ? <span className="ml-auto font-mono text-xs text-black/60">−{s.savedTokens.toLocaleString("en-US")} tokens</span> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-black/70">{s.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Caption>Cost per 1,000 calls on popular models</Caption>
            <div className="mt-4">
              <TableFrame label="Cost per 1000 calls, before and after">
                <table className="w-full min-w-[520px] border-collapse">
                  <thead><tr><th className={th}>Model</th><th className={`${th} text-right`}>Now</th><th className={`${th} text-right`}>After</th><th className={`${th} text-right`}>Saved</th></tr></thead>
                  <tbody>
                    {compare.map(({ m, before: b, after: a }) => (
                      <tr key={m.id}>
                        <td className={td}>{m.name}</td>
                        <td className={`${td} text-right tabular-nums`}>{money(b * 1000)}</td>
                        <td className={`${td} text-right tabular-nums`}>{money(a * 1000)}</td>
                        <td className={`${td} text-right tabular-nums`}>{money(Math.max(0, b - a) * 1000)}</td>
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
