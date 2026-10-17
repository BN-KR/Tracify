"use client";

import { useCallback, useEffect, useState } from "react";
import { stateLabel, type ProviderState, type ProviderStatus } from "@/lib/tools/provider-status";
import { Badge, buttonClass, Caption, Metric, MetricGrid } from "./ui";

type Payload = { checkedAt: string; providers: ProviderStatus[] };

// The site uses only black, cream and yellow, so state is shown by shape and fill as well as by words.
const dot: Record<ProviderState, string> = {
  operational: "bg-black",
  degraded: "bg-[#f4d44d] outline outline-1 outline-black",
  outage: "bg-[repeating-linear-gradient(45deg,#090909_0_3px,#f4d44d_3px_6px)] outline outline-1 outline-black",
  maintenance: "border border-black bg-transparent",
  unknown: "bg-black/20",
};
const word: Record<ProviderState, string> = { operational: "Operational", degraded: "Problems", outage: "Outage", maintenance: "Maintenance", unknown: "Unknown" };
const REFRESH_MS = 60_000;

function ago(iso: string | undefined, now: number) {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

export function AiStatus() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tools/ai-status", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as Payload;
      if (!Array.isArray(json.providers)) throw new Error("bad payload");
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setNow(Date.now());
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first load happens after mount, then on a timer
    void load();
    const id = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const providers = data?.providers ?? [];
  const count = (s: ProviderState) => providers.filter((p) => p.state === s).length;
  const problems = count("degraded") + count("outage");

  return (
    <div className="space-y-8">
      <MetricGrid label="Provider status summary">
        <Metric strong={problems > 0 || (!!data && count("unknown") === providers.length)} label="Right now" value={!data ? (error ? "Can't check" : "Checking…") : count("unknown") === providers.length ? "Could not read any feed" : problems === 0 ? "No problems found" : `${problems} with problems`} note={data ? `${count("operational")} operational${count("maintenance") ? `, ${count("maintenance")} in maintenance` : ""}, ${count("unknown")} could not be read` : error ? "The status check could not be reached. Try again in a moment." : undefined} />
        <Metric label="Last checked" value={data ? new Date(data.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"} note="Refreshes every minute while this tab is open" />
      </MetricGrid>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Caption>Read from each provider&rsquo;s own status page</Caption>
        <button type="button" className={buttonClass} onClick={() => void load()} disabled={loading}>{loading ? "Checking…" : "Check again"}</button>
      </div>

      {error && !data ? (
        <div role="alert" className="border border-black bg-white p-6 text-sm leading-6">We could not load the status check just now. Open a provider&rsquo;s own status page below, or try again.</div>
      ) : null}

      <ul className="grid gap-px border border-black bg-black md:grid-cols-2" aria-busy={loading && !data}>
        {(data ? providers : Array.from({ length: 12 }, () => null)).map((p, i) => (
          <li key={p?.id ?? i} className="bg-[#eceae3]">
            {p ? (
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-3 font-medium"><span aria-hidden="true" className={`inline-block size-3 shrink-0 ${dot[p.state]}`} />{p.name}</p>
                    <p className="mt-1 text-xs text-black/55">{p.products}</p>
                  </div>
                  <Badge tone={p.state === "operational" ? "ok" : p.state === "unknown" ? "tip" : p.state === "outage" ? "error" : "warning"}>{word[p.state]}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/70">{p.state === "unknown" ? p.description : p.incidents.length > 0 ? `${p.incidents.length} open incident${p.incidents.length === 1 ? "" : "s"}` : p.description || stateLabel(p.state)}</p>
                {p.incidents.slice(0, open === p.id ? 8 : 1).map((inc, k) => (
                  <div key={k} className="mt-3 border-l-2 border-black pl-3 text-sm leading-6">
                    <p className="font-medium">{inc.title}</p>
                    {inc.latest ? <p className="text-black/65">{inc.latest}</p> : null}
                    <p className="font-mono text-[11px] text-black/50">{inc.startedAt ? `Started ${ago(inc.startedAt, now)}` : ""}{inc.link ? <> · <a className="underline decoration-[#f4d44d] decoration-2 underline-offset-2" href={inc.link} target="_blank" rel="noopener noreferrer">Details</a></> : null}</p>
                  </div>
                ))}
                {p.incidents.length > 1 ? <button type="button" className="mt-2 min-h-11 font-mono text-[11px] uppercase tracking-[0.1em] underline decoration-[#f4d44d] decoration-2 underline-offset-4" onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? "Show less" : `Show all ${p.incidents.length}`}</button> : null}
                {p.components.some((c) => c.state !== "operational" && c.state !== "unknown") ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {p.components.filter((c) => c.state !== "operational" && c.state !== "unknown").slice(0, 6).map((c) => (
                      <li key={c.name} className="flex items-center gap-2"><span aria-hidden="true" className={`inline-block size-2 ${dot[c.state]}`} />{c.name} <span className="text-black/50">· {word[c.state].toLowerCase()}</span></li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-4 font-mono text-[11px]"><a className="underline decoration-[#f4d44d] decoration-2 underline-offset-4 hover:bg-[#f4d44d]" href={p.page} target="_blank" rel="noopener noreferrer">Official status page ↗</a></p>
              </div>
            ) : (
              <div className="h-[132px] animate-pulse bg-black/5" aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
