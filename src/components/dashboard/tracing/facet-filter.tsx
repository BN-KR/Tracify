"use client";

import { useState } from "react";
import { compactNumber } from "./format";

export type FacetCounts = Record<string, Array<{ value: string; traces: number }>>;

/** Checkbox filter fields, in sidebar order. `open` = expanded by default. */
export const FACETS: Array<{ key: string; label: string; open?: boolean }> = [
  { key: "traceName", label: "Trace name", open: true },
  { key: "spanType", label: "Step type", open: true },
  { key: "toolName", label: "Tool" },
  { key: "modelId", label: "Model" },
  { key: "errorType", label: "Error type" },
  { key: "environment", label: "Environment" },
  { key: "release", label: "Release" },
  { key: "endUserId", label: "User" },
  { key: "sessionId", label: "Session" },
  { key: "tag", label: "Tag" },
];

/** URL form of a checkbox filter: comma-separated, each value URI-encoded (so values may contain commas). */
export function decodeValues(raw: string | undefined) {
  if (!raw) return [];
  return raw.split(",").map((part) => { try { return decodeURIComponent(part); } catch { return part; } }).filter(Boolean);
}

export function encodeValues(values: string[]) {
  return values.map(encodeURIComponent).join(",");
}

const VISIBLE = 5;
/** Lists this long or shorter need no value search box. */
const SEARCH_FROM = 10;

/**
 * One collapsible filter field: a checkbox per value with the number of matching traces (counted with the
 * other filters applied). Long lists get a search box and "Show more". Ticked values that no longer occur in
 * the range stay listed with 0 so they can be unticked.
 */
export function FacetGroup({ label, values, counts, onChange, defaultOpen }: {
  label: string; values: string[]; counts: Array<{ value: string; traces: number }> | undefined;
  onChange: (values: string[]) => void; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen) || values.length > 0);
  const [search, setSearch] = useState("");
  const [all, setAll] = useState(false);
  const list = [...(counts ?? [])];
  for (const value of values) if (!list.some((item) => item.value === value)) list.push({ value, traces: 0 });
  const needle = search.trim().toLowerCase();
  const matching = needle ? list.filter((item) => item.value.toLowerCase().includes(needle)) : list;
  const shown = all || needle ? matching : matching.slice(0, VISIBLE);
  const id = `facet-${label.replace(/\W+/g, "-").toLowerCase()}`;
  const toggle = (value: string) => onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  return (
    <section className="border-b border-[#1A1F27] py-0.5" aria-labelledby={`${id}-title`}>
      <div className="flex items-center gap-1">
        <button type="button" id={`${id}-title`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-0.5 text-left text-xs font-medium text-[#C9CED6] hover:text-white">
          <span aria-hidden="true" className="w-2.5 text-[10px] text-[#6B7380]">{open ? "▾" : "▸"}</span>
          {label}
          {values.length ? <span className="rounded bg-[#F4D44D] px-1 font-mono text-[10px] text-[#0B0D10]">{values.length}</span> : null}
        </button>
        {values.length ? <button type="button" onClick={() => onChange([])} className="text-[11px] text-[#8B93A1] hover:text-white" aria-label={`Clear ${label} filter`}>Clear</button> : null}
      </div>
      {open ? (
        <div id={id} className="pb-1 pl-3.5">
          {list.length > SEARCH_FROM ? (
            <>
              <label htmlFor={`${id}-search`} className="sr-only">Search {label} values</label>
              <input id={`${id}-search`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter values"
                className="mb-0.5 h-6 w-full rounded border border-[#262C35] bg-[#111418] px-2 text-xs outline-none placeholder:text-[#6B7380] focus:border-[#4A5260]" />
            </>
          ) : null}
          {list.length === 0 ? <p className="py-1 text-[11px] text-[#6B7380]">No values in this range</p> : null}
          <ul>
            {shown.map((item) => (
              <li key={item.value}>
                <label className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-px text-xs hover:bg-[#12161C]">
                  <input type="checkbox" checked={values.includes(item.value)} onChange={() => toggle(item.value)} className="size-3 shrink-0 accent-[#F4D44D]" />
                  <span className="min-w-0 flex-1 truncate text-[#E6E9EE]" title={item.value}>{item.value}</span>
                  <span className="shrink-0 font-mono text-[10px] text-[#6B7380]">{compactNumber(item.traces)}</span>
                </label>
              </li>
            ))}
          </ul>
          {!needle && matching.length > VISIBLE ? (
            <button type="button" onClick={() => setAll(!all)} className="px-1 text-[11px] text-[#8AB4FF] hover:underline">
              {all ? "Show fewer" : `Show ${matching.length - VISIBLE} more`}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
