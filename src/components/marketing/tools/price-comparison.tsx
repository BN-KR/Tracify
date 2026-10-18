"use client";

import { useMemo, useState } from "react";
import { compareModels, defaultCompare, type CompareInput } from "@/lib/tools/calculators";
import { formatTokens, money, PRICES_CHECKED_LABEL, providers, type Provider } from "@/lib/tools/models";
import { Badge, buttonClass, Caption, NumberField, TableFrame, td, th } from "./ui";

type SortKey = "perMonth" | "input" | "output" | "context" | "name";

const perM = (v: number) => (v >= 10 ? `$${v.toFixed(0)}` : v >= 1 ? `$${v.toFixed(2).replace(/\.00$/, "")}` : `$${v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}`);

export function PriceComparison() {
  const [input, setInput] = useState<CompareInput>(defaultCompare);
  const [provider, setProvider] = useState<Provider | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("perMonth");
  const [desc, setDesc] = useState(false);
  const set = (key: keyof CompareInput) => (v: number) => setInput((c) => ({ ...c, [key]: v }));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = compareModels(input).filter((r) => (provider === "all" || r.model.provider === provider) && (!q || `${r.model.name} ${r.model.provider} ${r.model.id}`.toLowerCase().includes(q)));
    const value = (r: (typeof list)[number]) => (sort === "perMonth" ? r.perMonth : sort === "input" ? r.model.input : sort === "output" ? r.model.output : sort === "context" ? r.model.context : 0);
    list.sort((a, b) => (sort === "name" ? a.model.name.localeCompare(b.model.name) : value(a) - value(b)));
    if (desc) list.reverse();
    return list;
  }, [input, provider, query, sort, desc]);

  const cheapest = rows.length ? rows[0] : undefined;
  const base = rows.length ? Math.min(...rows.map((r) => r.perMonth)) : 0;

  function header(label: string, key: SortKey, right = false) {
    const active = sort === key;
    return (
      <th className={`${th} ${right ? "text-right" : ""}`} aria-sort={active ? (desc ? "descending" : "ascending") : "none"}>
        <button type="button" className="font-mono uppercase tracking-[0.12em] hover:underline" onClick={() => { if (active) setDesc((d) => !d); else { setSort(key); setDesc(false); } }}>
          {label}{active ? (desc ? " ↓" : " ↑") : ""}
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <Caption>What does your app do in a month?</Caption>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField label="Requests per month" value={input.requestsPerMonth} onChange={set("requestsPerMonth")} step={10000} hint="Model calls, not users." />
          <NumberField label="Input tokens per request" value={input.inputTokens} onChange={set("inputTokens")} step={100} hint="Prompt, history and retrieved text." />
          <NumberField label="Output tokens per request" value={input.outputTokens} onChange={set("outputTokens")} step={50} hint="What the model writes back." />
          <NumberField label="Input read from cache" value={input.cachedShare} onChange={(v) => set("cachedShare")(Math.min(100, v))} step={5} suffix="%" hint="Only applies to models with a cache price." />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by provider">
            {(["all", ...providers] as const).map((p) => (
              <button key={p} type="button" aria-pressed={provider === p} onClick={() => setProvider(p)} className={`min-h-11 border border-black px-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${provider === p ? "bg-black text-[#eceae3]" : "hover:bg-[#f4d44d]"}`}>
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
          <div className="ml-auto w-full sm:w-64">
            <label htmlFor="model-search" className="sr-only">Search models</label>
            <input id="model-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search models" className="min-h-11 w-full border border-black bg-white px-3 font-mono text-sm outline-none focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#f4d44d]" />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-black/60">Prices are US dollars per million tokens, checked {PRICES_CHECKED_LABEL}. Click a column to sort.</p>

        <div className="mt-4">
          <TableFrame label="LLM API prices and monthly cost">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  {header("Model", "name")}
                  {header("Input / 1M", "input", true)}
                  <th className={`${th} text-right`}>Cached / 1M</th>
                  {header("Output / 1M", "output", true)}
                  {header("Window", "context", true)}
                  {header("Your cost / month", "perMonth", true)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.model.id} className={cheapest && r.model.id === cheapest.model.id && sort === "perMonth" && !desc ? "bg-[#f4d44d]/25" : ""}>
                    <td className={td}>{r.model.name}<span className="block text-[11px] text-black/50">{r.model.provider}{r.model.note ? ` · ${r.model.note}` : ""}</span></td>
                    <td className={`${td} text-right tabular-nums`}>{perM(r.model.input)}</td>
                    <td className={`${td} text-right tabular-nums text-black/60`}>{r.model.cached !== undefined ? perM(r.model.cached) : "—"}</td>
                    <td className={`${td} text-right tabular-nums`}>{perM(r.model.output)}</td>
                    <td className={`${td} text-right tabular-nums`}>{formatTokens(r.model.context)}</td>
                    <td className={`${td} text-right tabular-nums`}>
                      <strong className="font-semibold">{money(r.perMonth)}</strong>
                      <span className="block text-[11px] text-black/50">{money(r.perRequest)} per request{base > 0 && r.perMonth > base * 1.05 ? ` · ${(r.perMonth / base).toFixed(r.perMonth / base >= 10 ? 0 : 1)}× the cheapest shown` : ""}</span>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? <tr><td className={td} colSpan={6}>No model matches. <button type="button" className={buttonClass} onClick={() => { setQuery(""); setProvider("all"); }}>Clear filters</button></td></tr> : null}
              </tbody>
            </table>
          </TableFrame>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs leading-5 text-black/60"><Badge tone="tip">Note</Badge> Cheaper is not always better. A cheap model that fails or retries often can cost more per finished task. Test on your own prompts.</p>
      </div>
    </div>
  );
}
