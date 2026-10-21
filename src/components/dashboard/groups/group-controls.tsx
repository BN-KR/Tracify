"use client";

import { GROUP_SORTS } from "@/lib/group-filters";
import { compactNumber } from "../tracing/format";
import { RANGES, TimeRangePicker } from "../tracing/time-range-picker";
import { KIND_TEXT } from "./kind-text";
import type { GroupView } from "./group-view";

export const SORT_CHOICES = [
  { value: "lastSeenAt:desc", label: "Most recent" }, { value: "lastSeenAt:asc", label: "Oldest activity" },
  { value: "runs:desc", label: "Most runs" }, { value: "failedRuns:desc", label: "Most failed runs" },
  { value: "totalCostUsd:desc", label: "Highest cost" }, { value: "tokens:desc", label: "Most tokens" },
  { value: "spanSeconds:desc", label: "Longest" }, { value: "id:asc", label: "Name A to Z" },
];

export const chip = "h-8 border border-[#3A3A34] bg-[#090909] px-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#eceae3] hover:border-[#f4d44d] hover:text-[#f4d44d] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#f4d44d] disabled:opacity-40";

/** Search, range, filters, live and export, drawn the same way on both pages so only the layout around them differs. */
export function GroupControls({ view, search = true }: { view: GroupView; search?: boolean }) {
  const { kind, query, update, data, setNow, draft, setDraft, searchRef } = view;
  const text = KIND_TEXT[kind];
  const sort = (GROUP_SORTS as readonly string[]).includes(view.sort) ? view.sort : "lastSeenAt";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {search ? (
        <form className="min-w-[200px] flex-1" onSubmit={(event) => { event.preventDefault(); update({ q: draft.trim() }); }}>
          <label htmlFor={`${kind}-search`} className="sr-only">{text.search}</label>
          <input
            id={`${kind}-search`} ref={searchRef} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={200}
            placeholder={`${text.search}  ( / )`}
            className="h-8 w-full border border-[#3A3A34] bg-[#090909] px-3 font-mono text-xs text-[#eceae3] placeholder:text-[#7a7869] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#f4d44d]"
          />
        </form>
      ) : null}
      <TimeRangePicker
        range={query.range ?? "30d"} from={query.from ? Number(query.from) : undefined} to={query.to ? Number(query.to) : undefined} now={view.now}
        onPreset={(id) => { setNow(Date.now()); update({ range: id, from: "", to: "" }); }}
        onCustom={(from, to) => update({ from: String(from), to: String(to) })}
        onReset={() => { setNow(Date.now()); update({ from: "", to: "", range: "30d" }); }}
      />
      <label className="sr-only" htmlFor={`${kind}-env`}>Environment</label>
      <select id={`${kind}-env`} className={chip} value={query.environment ?? ""} onChange={(event) => update({ environment: event.target.value })}>
        <option value="">All environments</option>
        {query.environment && !data?.environments.some((item) => item.value === query.environment) ? <option value={query.environment}>{query.environment}</option> : null}
        {(data?.environments ?? []).map((item) => <option key={item.value} value={item.value}>{item.value} ({compactNumber(item.groups)})</option>)}
      </select>
      <label className="sr-only" htmlFor={`${kind}-status`}>Status</label>
      <select id={`${kind}-status`} className={chip} value={query.status ?? ""} onChange={(event) => update({ status: event.target.value })}>
        <option value="">All {text.many}</option>
        <option value="error">With errors</option>
        <option value="healthy">Healthy only</option>
      </select>
      <label className="sr-only" htmlFor={`${kind}-sort`}>Sort by</label>
      <select id={`${kind}-sort`} className={chip} value={`${sort}:${view.direction}`} onChange={(event) => { const [nextSort, nextDir] = event.target.value.split(":"); update({ sort: nextSort, dir: nextDir }); }}>
        {SORT_CHOICES.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
      </select>
      <button type="button" onClick={view.refresh} className={chip}>Refresh</button>
      <button type="button" onClick={view.exportCsv} disabled={!view.rows.length} className={chip}>Export CSV</button>
    </div>
  );
}

export { RANGES };

/** Count on the left, rows per page and paging on the right. */
export function GroupFooter({ view, className = "" }: { view: GroupView; className?: string }) {
  const { kind, page, pageSize, pageCount, total, update } = view;
  const text = KIND_TEXT[kind];
  return (
    <footer className={`flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] ${className}`}>
      <span role="status">{view.loading && view.data ? "Updating…" : `${total.toLocaleString("en")} ${total === 1 ? text.one : text.many}`}</span>
      <span className="flex items-center gap-2">
        <label htmlFor={`${kind}-size`}>Rows</label>
        <select id={`${kind}-size`} className={chip} value={pageSize} onChange={(event) => update({ pageSize: event.target.value })}>
          {[25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <button type="button" className={chip} disabled={page <= 0} onClick={() => update({ page: String(page - 1) }, false)}>Previous</button>
        <span>{page + 1} / {pageCount}</span>
        <button type="button" className={chip} disabled={page + 1 >= pageCount} onClick={() => update({ page: String(page + 1) }, false)}>Next</button>
      </span>
    </footer>
  );
}

/** Removable chips for the filters in force, with Clear all. */
export function FilterChips({ view }: { view: GroupView }) {
  if (!view.filters.length) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Active filters">
      {view.filters.map((filter) => (
        <button key={filter.key} type="button" onClick={() => { if (filter.key === "q") view.setDraft(""); view.update({ [filter.key]: "" }); }} aria-label={`Remove filter ${filter.label}`} className="flex items-center gap-1.5 border border-[#f4d44d] px-2 py-0.5 font-mono text-[11px] text-[#f4d44d] hover:bg-[#f4d44d] hover:text-[#090909]">
          {filter.label} <span aria-hidden>×</span>
        </button>
      ))}
      <button type="button" onClick={view.clearFilters} className="px-1 font-mono text-[11px] text-[#a9a693] underline hover:text-[#eceae3]">Clear all</button>
    </div>
  );
}
