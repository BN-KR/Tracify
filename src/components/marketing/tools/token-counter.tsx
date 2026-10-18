"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { callCost, formatTokens, models, money, PRICES_CHECKED_LABEL } from "@/lib/tools/models";
import { countFor, methodLabel } from "@/lib/tools/tokens";
import { Badge, buttonClass, Caption, ghostClass, Metric, MetricGrid, NumberField, TableFrame, td, TextArea, th } from "./ui";
import { useTokenizer } from "./use-tokenizer";

const MAX_CHARS = 1_000_000;
const SAMPLE = `You are a support agent for an online shop. Look up the order with the get_order tool before you answer.

Customer: Hi, my order #48213 hasn't arrived and it's been 9 days. Can you check where it is and tell me if I can get a refund?

Reply in two short paragraphs. Be kind, be specific, and never promise a refund before you have checked the policy.`;

type Sort = "provider" | "cheapest" | "tokens";

export function TokenCounter() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState(0);
  const [sort, setSort] = useState<Sort>("provider");
  const [showPieces, setShowPieces] = useState(false);
  const { status, tokenizer } = useTokenizer();
  const deferred = useDeferredValue(text);
  const clipped = deferred.length > MAX_CHARS;
  const body = clipped ? deferred.slice(0, MAX_CHARS) : deferred;

  const openaiCount = useMemo(() => (tokenizer ? tokenizer.count(body) : null), [tokenizer, body]);
  const rows = useMemo(() => {
    const list = models.map((model) => {
      const count = countFor(model.family, body, openaiCount);
      const inputCost = callCost(model, count.tokens, 0);
      const total = callCost(model, count.tokens, reply);
      return { model, count, inputCost, total, windowShare: count.tokens / model.context };
    });
    if (sort === "cheapest") list.sort((a, b) => a.total - b.total);
    if (sort === "tokens") list.sort((a, b) => b.count.tokens - a.count.tokens);
    return list;
  }, [body, openaiCount, reply, sort]);

  const pieces = useMemo(() => (showPieces && tokenizer && body ? tokenizer.pieces(body, 400) : null), [showPieces, tokenizer, body]);
  const words = (body.match(/\S+/g) ?? []).length;
  const gpt = rows.find((r) => r.model.id === "gpt-4o");
  const claude = rows.find((r) => r.model.id === "claude-sonnet-5-5");
  const cheapest = rows.length ? rows.reduce((a, b) => (b.total < a.total ? b : a)) : undefined;
  const empty = body.length === 0;

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <TextArea label="Your text or prompt" value={text} onChange={setText} rows={14} placeholder="Paste a prompt, a document or a chat history here…" hint={<>Nothing is uploaded. {status === "loading" ? "Loading the OpenAI tokenizer…" : status === "failed" ? "The OpenAI tokenizer could not load, so every number below is a rough estimate." : "OpenAI counts use the real tokenizer."}</>} />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={buttonClass} onClick={() => setText(SAMPLE)}>Try an example</button>
            <button type="button" className={ghostClass} onClick={() => setText("")} disabled={empty}>Clear</button>
            <label className="ml-auto flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em]">
              <input type="checkbox" checked={showPieces} onChange={(e) => setShowPieces(e.target.checked)} className="size-4 accent-black" disabled={!tokenizer} />
              Show how it is split
            </label>
          </div>
          {clipped ? <p className="text-xs leading-5 text-black/70">That is a very long text. Only the first million characters were counted.</p> : null}
        </div>

        <div className="space-y-6">
          <MetricGrid label="Token counts">
            <Metric strong label="GPT-4o and newer" value={gpt ? gpt.count.tokens.toLocaleString("en-US") : "0"} note={tokenizer ? "Exact count, real tokenizer" : "Rough estimate"} />
            <Metric label="Claude (estimate)" value={claude ? claude.count.tokens.toLocaleString("en-US") : "0"} note="Scaled from the real count, about ±15%" />
            <Metric label="Characters" value={body.length.toLocaleString("en-US")} note={`${words.toLocaleString("en-US")} words`} />
            <Metric label="Cheapest to run" value={cheapest && !empty ? money(cheapest.total) : "—"} note={cheapest && !empty ? `${cheapest.model.name}${reply ? ", with the reply" : ", input only"}` : "Paste text to see"} />
          </MetricGrid>
          <NumberField label="Reply length to include (tokens)" value={reply} onChange={(v) => setReply(Math.max(0, v))} step={50} hint="Optional. Add the tokens you expect the model to write back to see the full price of one call." />
        </div>
      </div>

      {pieces ? (
        <div>
          <Caption>How OpenAI models split your text ({pieces.total.toLocaleString("en-US")} tokens{pieces.total > 400 ? ", first 400 shown" : ""})</Caption>
          <p className="mt-3 border border-black bg-white p-3 font-mono text-[13px] leading-7" aria-label="Token pieces">
            {pieces.pieces.map((piece, i) => (
              <span key={i} className={`whitespace-pre-wrap ${i % 2 ? "bg-[#f4d44d]/60" : "bg-[#f4d44d]/25"}`}>{piece.replace(/\n/g, "↵\n")}</span>
            ))}
          </p>
        </div>
      ) : null}

      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Caption>Every model, same text</Caption>
            <p className="mt-2 text-xs leading-5 text-black/60">Prices are US dollars, checked {PRICES_CHECKED_LABEL}. Cost is for one call with this text as the prompt{reply ? ` and ${reply.toLocaleString("en-US")} tokens written back` : ""}.</p>
          </div>
          <label className="font-mono text-[11px] uppercase tracking-[0.08em]">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="ml-2 min-h-11 border border-black bg-white px-2 font-mono text-xs normal-case">
              <option value="provider">By provider</option>
              <option value="cheapest">Cheapest first</option>
              <option value="tokens">Most tokens first</option>
            </select>
          </label>
        </div>
        <div className="mt-4">
          <TableFrame label="Token counts and cost by model">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Model</th>
                  <th className={`${th} text-right`}>Tokens</th>
                  <th className={th}>How counted</th>
                  <th className={`${th} text-right`}>Cost of this call</th>
                  <th className={`${th} text-right`}>Window used</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ model, count, total, windowShare }) => (
                  <tr key={model.id} className={cheapest && !empty && model.id === cheapest.model.id ? "bg-[#f4d44d]/25" : ""}>
                    <td className={td}>{model.name}<span className="block text-[11px] text-black/50">{model.provider}</span></td>
                    <td className={`${td} text-right tabular-nums`}>{empty ? "—" : count.tokens.toLocaleString("en-US")}</td>
                    <td className={td}><Badge tone={count.exact ? "ok" : "tip"}>{empty ? "—" : methodLabel(count)}</Badge></td>
                    <td className={`${td} text-right tabular-nums`}>{empty ? "—" : money(total)}</td>
                    <td className={`${td} text-right tabular-nums`}>{empty ? "—" : windowShare < 0.0001 ? "<0.01%" : `${(windowShare * 100).toFixed(windowShare < 0.1 ? 2 : 1)}%`}<span className="block text-[11px] text-black/50">of {formatTokens(model.context)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        </div>
      </div>
    </div>
  );
}
