"use client";

import { useMemo, useState } from "react";
import { defaultRate, rateLimits, type RateInput } from "@/lib/tools/calculators";
import { Badge, Caption, ghostClass, Metric, MetricGrid, NumberField } from "./ui";

const n = (v: number, digits = 0) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: digits }) : "No limit");
const users = (v: number) => (!Number.isFinite(v) ? "No limit" : v >= 100 ? n(Math.floor(v)) : n(v, 1));

export function RateLimitCalculator() {
  const [input, setInput] = useState<RateInput>(defaultRate);
  const set = <K extends keyof RateInput>(key: K, value: RateInput[K]) => setInput((c) => ({ ...c, [key]: value }));
  const r = useMemo(() => rateLimits(input), [input]);
  const verdictText = r.verdict === "ok" ? "You have room" : r.verdict === "tight" ? "Close to the limit" : "You would hit your limit";
  const need = Math.ceil(r.neededRpm);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="space-y-10">
        <fieldset className="min-w-0">
          <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">Your provider&rsquo;s limits</legend>
          <p className="mt-2 text-xs leading-5 text-black/60">Find these on your provider&rsquo;s dashboard under limits or usage tiers. The numbers below are examples.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <NumberField label="Requests per minute" value={input.rpm} onChange={(v) => set("rpm", v)} step={50} hint="Zero means no request limit." />
            <NumberField label={input.separateOutputLimit ? "Input tokens per minute" : "Tokens per minute"} value={input.tpm} onChange={(v) => set("tpm", v)} step={10000} hint="Zero means no token limit." />
            {input.separateOutputLimit ? <NumberField label="Output tokens per minute" value={input.otpm} onChange={(v) => set("otpm", v)} step={5000} hint="Zero means no output limit." /> : null}
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm leading-6">
            <input type="checkbox" checked={input.separateOutputLimit} onChange={(e) => set("separateOutputLimit", e.target.checked)} className="mt-1.5 size-4 accent-black" />
            <span>My provider limits input and output tokens separately <span className="text-black/55">(Anthropic does. OpenAI counts them together.)</span></span>
          </label>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">What one user action costs</legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <NumberField label="Model calls per action" value={input.callsPerAction} onChange={(v) => set("callsPerAction", v)} step={1} hint="An agent answering one question might make 4 to 10." />
            <NumberField label="Failed calls tried again" value={input.retryRate} onChange={(v) => set("retryRate", Math.min(99, v))} step={1} suffix="%" hint="Retries count against your limit too." />
            <NumberField label="Input tokens per call" value={input.inputTokens} onChange={(v) => set("inputTokens", v)} step={100} />
            <NumberField label="Output tokens per call" value={input.outputTokens} onChange={(v) => set("outputTokens", v)} step={50} />
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">Your traffic</legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <NumberField label="Users active at once" value={input.targetUsers} onChange={(v) => set("targetUsers", v)} step={10} hint="Online at the same time, not total sign-ups." />
            <NumberField label="Seconds between actions" value={input.secondsBetweenActions} onChange={(v) => set("secondsBetweenActions", Math.max(1, v))} step={5} min={1} hint="How often one active user asks for something." />
            <NumberField label="Busiest minute vs average" value={input.peakFactor} onChange={(v) => set("peakFactor", Math.max(1, v))} step={0.5} min={1} suffix="×" hint="2 means the busiest minute is twice the average." />
          </div>
        </fieldset>
        <button type="button" className={ghostClass} onClick={() => setInput(defaultRate)}>Reset to examples</button>
      </div>

      <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
        <MetricGrid label="Rate limit result">
          <Metric strong={r.verdict !== "ok"} label="Verdict" value={verdictText} note={Number.isFinite(r.headroom) ? `${r.headroom >= 100 ? "100×+" : `${r.headroom.toFixed(r.headroom < 10 ? 2 : 1)}×`} your ${n(input.targetUsers)} users at peak` : "No limit set, so nothing to hit"} />
          <Metric label="Users you can serve" value={users(r.maxUsersPeak)} note={`In your busiest minute. ${users(r.maxUsersNormal)} at average traffic.`} />
          <Metric label="Limit you hit first" value={r.limitingFactor === "none" ? "None set" : r.limitingFactor} note={Number.isFinite(r.maxCallsPerMinute) ? `Allows ${n(r.maxCallsPerMinute, 1)} calls a minute` : undefined} />
          <Metric label="Calls per action" value={n(r.callsPerActionWithRetries, 1)} note="Including retries" />
        </MetricGrid>

        <div className="border border-black bg-white p-5 md:p-6">
          <Caption>What your {n(input.targetUsers)} users need at peak</Caption>
          <dl className="mt-4 divide-y divide-black/10 text-sm">
            <Row label="Requests per minute" need={need} have={input.rpm} />
            <Row label={input.separateOutputLimit ? "Input tokens per minute" : "Tokens per minute"} need={Math.ceil(r.neededTpm)} have={input.tpm} />
            {input.separateOutputLimit ? <Row label="Output tokens per minute" need={Math.ceil(r.neededOtpm)} have={input.otpm} /> : null}
          </dl>
          {r.verdict !== "ok" && Number.isFinite(r.maxCallsPerMinute) ? (
            <div className="mt-5 border-t border-black/15 pt-4 text-sm leading-6 text-black/70">
              <p className="font-medium text-black">How to get more room</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Ask for a higher tier, or spread load over more than one key or region.</li>
                <li>Cut input tokens: shorter prompts and summarised history raise the token limit&rsquo;s reach.</li>
                <li>Queue and smooth bursts instead of firing every call at once, and retry with growing waits.</li>
                <li>Send easy steps to a smaller model. Limits are usually separate per model.</li>
              </ul>
            </div>
          ) : null}
        </div>
        <p className="text-xs leading-5 text-black/60">This is a planning estimate. Providers also limit per day, per model and per organisation, and some count your requested maximum reply length rather than the real one.</p>
      </div>
    </div>
  );
}

function Row({ label, need, have }: { label: string; need: number; have: number }) {
  const unlimited = !(have > 0);
  const over = !unlimited && need > have;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
      <dt>{label}</dt>
      <dd className="flex items-center gap-3 font-mono tabular-nums">
        <span>{n(need)}</span>
        <span className="text-black/45">of {unlimited ? "no limit" : n(have)}</span>
        <Badge tone={over ? "error" : "ok"}>{over ? "Over" : "OK"}</Badge>
      </dd>
    </div>
  );
}
