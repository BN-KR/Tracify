"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { SEARCH_FIELDS, replaceToken, splitToken, tokenAt, parseCost, parseLatency, type SearchField } from "@/lib/trace-search";
import { compactNumber } from "./format";
import { decodeValues, encodeValues, type FacetCounts } from "./facet-filter";

type Action =
  | { type: "facet"; field: SearchField; value: string }
  | { type: "status"; value: "error" | "healthy" }
  | { type: "latency"; example: string }
  | { type: "cost"; example: string }
  | { type: "field"; field: SearchField };
type Option = { id: string; group: string; primary: string; hint?: string; count?: number; action: Action };

const LATENCY_EXAMPLES = [">500ms", ">2s", ">10s", ">1m"];
const COST_EXAMPLES = [">0.001", ">0.01", ">0.1", ">1"];
/** Fields whose most common values are offered before anything is typed. */
const SUGGESTED = ["name", "model", "tool", "env", "error", "type"];

/**
 * The Tracing search box with suggestions. Type plain text to search, or `field:value` to filter: the dropdown
 * offers common values with their counts and the available fields, and picking a value applies the same filter
 * as the sidebar. It never blocks typing; Enter with nothing highlighted searches the text as before.
 */
export function SearchBox({ id, inputRef, value, onChange, onApply, facets, query, error, placeholder }: {
  id: string; inputRef: RefObject<HTMLInputElement | null>; value: string; onChange: (value: string) => void;
  onApply: (patch: Record<string, string>) => void; facets: FacetCounts; query: Record<string, string>; error: string; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [caret, setCaret] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const listId = `${id}-suggestions`;

  const token = tokenAt(value, caret);
  const split = token ? splitToken(token.raw) : null;

  const options = useMemo(() => {
    const typed = split ? split.value.toLowerCase() : (token?.raw ?? "").toLowerCase();
    const valueOptions = (field: SearchField, group: string, limit: number): Option[] => {
      const selected = decodeValues(query[field.key]);
      return (facets[field.key] ?? [])
        .filter((item) => !selected.includes(item.value) && item.value.toLowerCase().includes(typed))
        .slice(0, limit)
        .map((item) => ({ id: `${field.token}:${item.value}`, group, primary: `${field.token}:${/\s/.test(item.value) ? `"${item.value}"` : item.value}`, count: item.traces, action: { type: "facet", field, value: item.value } }));
    };
    const statusOption = (status: "error" | "healthy", group: string): Option => ({
      id: `status:${status}`, group, primary: `status:${status}`, action: { type: "status", value: status },
      hint: status === "error" ? "Only traces with failed steps" : "Only traces without failures",
    });

    const out: Option[] = [];
    if (split) {
      const { field } = split;
      if (field.kind === "facet") out.push(...valueOptions(field, `Values for ${field.label.toLowerCase()}`, 12));
      else if (field.kind === "status") {
        for (const status of ["error", "healthy"] as const) if (status.includes(typed)) out.push(statusOption(status, "Values for status"));
      } else if (field.kind === "latency") {
        for (const example of LATENCY_EXAMPLES) out.push({ id: `latency:${example}`, group: "Minimum latency", primary: `latency:${example}`, hint: "Slower than", action: { type: "latency", example } });
      } else {
        for (const example of COST_EXAMPLES) out.push({ id: `cost:${example}`, group: "Minimum cost", primary: `cost:${example}`, hint: "More than, in USD", action: { type: "cost", example } });
      }
      return out;
    }

    if (typed.startsWith("-")) return out;
    for (const fieldToken of SUGGESTED) {
      const field = SEARCH_FIELDS.find((item) => item.token === fieldToken)!;
      out.push(...valueOptions(field, "Suggestions", typed ? 4 : 2).filter((option) => !typed || option.primary.toLowerCase().includes(typed) || option.id.toLowerCase().includes(typed)));
    }
    for (const status of ["error", "healthy"] as const) if (!typed || `status:${status}`.includes(typed)) out.push(statusOption(status, "Suggestions"));
    for (const field of SEARCH_FIELDS) {
      if (typed && !field.token.startsWith(typed) && !field.label.toLowerCase().includes(typed)) continue;
      out.push({ id: `field:${field.token}`, group: "Fields", primary: `${field.token}:`, hint: field.hint, action: { type: "field", field } });
    }
    return out.slice(0, 30);
  }, [facets, query, split, token]);

  /** Do what a suggestion says: apply a filter and clear its token, or write `field:` and keep typing. */
  function select(option: Option) {
    const clear = () => onChange(replaceToken(value, token, "", caret).text);
    const { action } = option;
    if (action.type === "facet") {
      const current = decodeValues(query[action.field.key]);
      if (!current.includes(action.value)) onApply({ [action.field.key]: encodeValues([...current, action.value]) });
      clear();
    } else if (action.type === "status") { onApply({ status: action.value }); clear(); }
    else if (action.type === "latency") { onApply({ minLatencyMs: String(parseLatency(action.example) ?? "") }); clear(); }
    else if (action.type === "cost") { onApply({ minCostUsd: String(parseCost(action.example) ?? "") }); clear(); }
    else {
      const next = replaceToken(value, token, `${action.field.token}:`, caret);
      onChange(next.text);
      setCaret(next.caret);
      requestAnimationFrame(() => inputRef.current?.setSelectionRange(next.caret, next.caret));
    }
    setActiveId(null);
  }

  const activeIndex = options.findIndex((option) => option.id === activeId);
  const show = open && options.length > 0;

  function move(step: number) {
    if (!options.length) return;
    const next = activeIndex < 0 ? (step > 0 ? 0 : options.length - 1) : (activeIndex + step + options.length) % options.length;
    setActiveId(options[next]!.id);
    requestAnimationFrame(() => list.current?.querySelector(`[data-option="${CSS.escape(options[next]!.id)}"]`)?.scrollIntoView({ block: "nearest" }));
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); move(1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setOpen(true); move(-1); }
    else if (event.key === "Escape" && show) { event.preventDefault(); setOpen(false); setActiveId(null); }
    else if ((event.key === "Enter" || event.key === "Tab") && show && activeIndex >= 0) { event.preventDefault(); select(options[activeIndex]!); }
  }
  const track = (input: HTMLInputElement) => setCaret(input.selectionStart ?? input.value.length);

  let lastGroup = "";
  return (
    <div className="relative min-w-0 flex-1">
      <input
        id={id} ref={inputRef} value={value} role="combobox" aria-expanded={show} aria-controls={listId} aria-autocomplete="list" autoComplete="off" spellCheck={false}
        aria-activedescendant={show && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
        onChange={(event) => { onChange(event.target.value); track(event.target); setOpen(true); setActiveId(null); }}
        onFocus={(event) => { track(event.target); setOpen(true); }}
        onClick={(event) => track(event.currentTarget)}
        onKeyUp={(event) => track(event.currentTarget)}
        onBlur={() => { setOpen(false); setActiveId(null); }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="h-8 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-[#6B7380]"
      />
      {error ? <p role="alert" className="absolute left-0 top-full z-30 mt-1 rounded border border-[#5A2A2A] bg-[#1E1314] px-2 py-1 text-[11px] text-[#FF8A8A]">{error}</p> : null}
      {show ? (
        <div id={listId} ref={list} role="listbox" aria-label="Search suggestions"
          className="absolute -left-8 right-[-0.5rem] top-full z-30 mt-1.5 max-h-[min(380px,60vh)] overflow-auto rounded-lg border border-[#262C35] bg-[#111418] py-1 shadow-2xl"
          onMouseDown={(event) => event.preventDefault()}>
          {options.map((option, index) => {
            const heading = option.group !== lastGroup ? option.group : null;
            lastGroup = option.group;
            const colon = option.primary.indexOf(":");
            return (
              <div key={option.id} role="presentation">
                {heading ? <div role="presentation" className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-[#6B7380]">{heading}</div> : null}
                <div id={`${id}-option-${index}`} role="option" aria-selected={index === activeIndex} data-option={option.id}
                  onMouseEnter={() => setActiveId(option.id)} onClick={() => select(option)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-1.5 text-xs ${index === activeIndex ? "bg-[#1A1F27]" : ""}`}>
                  <span className="min-w-0 flex-1 truncate font-mono"><span className="text-[#8B93A1]">{option.primary.slice(0, colon + 1)}</span><span className="text-[#E6E9EE]">{option.primary.slice(colon + 1)}</span></span>
                  {option.count !== undefined ? <span className="shrink-0 font-mono text-[10px] text-[#6B7380]">{compactNumber(option.count)}</span> : option.hint ? <span className="hidden shrink-0 truncate text-[11px] text-[#6B7380] sm:block">{option.hint}</span> : null}
                </div>
              </div>
            );
          })}
          <div role="presentation" className="border-t border-[#1F242C] px-3 pb-1 pt-1.5 text-[10px] text-[#6B7380]">↑↓ to move · Enter to pick · plain words search the text · Esc to close</div>
        </div>
      ) : null}
    </div>
  );
}
