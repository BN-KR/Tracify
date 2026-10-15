"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { EXCLUDE_PREFIX, SEARCH_FIELDS, comparisonBound, parseCost, parseLatency, parseTokens, replaceToken, splitToken, tokenAt, type SearchField } from "@/lib/trace-search";
import { compactNumber } from "./format";
import { decodeValues, encodeValues, type FacetCounts } from "./facet-filter";

type Action =
  | { type: "facet"; field: SearchField; value: string; negate: boolean }
  | { type: "status"; value: "error" | "healthy" }
  | { type: "numeric"; field: SearchField; example: string }
  | { type: "field"; field: SearchField; prefix?: string };
type Option = { id: string; group: string; primary: string; hint?: string; count?: number; action: Action };

const NUMERIC_EXAMPLES: Record<string, string[]> = {
  latency: [">500ms", ">2s", ">10s", "<500ms", "<2s"],
  cost: [">0.001", ">0.01", ">0.1", "<0.01", "<0.1"],
  tokens: [">1k", ">10k", ">100k", "<500", "<5k"],
};
const NUMERIC_PARSERS = { latency: parseLatency, cost: parseCost, tokens: parseTokens } as const;
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
    const negate = Boolean(split?.negate);
    const valueOptions = (field: SearchField, group: string, limit: number): Option[] => {
      const selected = [...decodeValues(query[field.key]), ...decodeValues(query[`${EXCLUDE_PREFIX}${field.key}`])];
      const sign = negate ? "-" : "";
      return (facets[field.key] ?? [])
        .filter((item) => !selected.includes(item.value) && item.value.toLowerCase().includes(typed))
        .slice(0, limit)
        .map((item) => ({ id: `${sign}${field.token}:${item.value}`, group, primary: `${sign}${field.token}:${/\s/.test(item.value) ? `"${item.value}"` : item.value}`, count: item.traces, action: { type: "facet", field, value: item.value, negate } }));
    };
    // `-status:error` means healthy, so a negated suggestion applies the opposite status.
    const statusOption = (status: "error" | "healthy", group: string): Option => ({
      id: `${negate ? "-" : ""}status:${status}`, group, primary: `${negate ? "-" : ""}status:${status}`,
      action: { type: "status", value: negate ? (status === "error" ? "healthy" : "error") : status },
      hint: status === "error" ? "Only traces with failed steps" : "Only traces without failures",
    });

    const out: Option[] = [];
    if (split) {
      const { field } = split;
      if (field.kind === "facet") out.push(...valueOptions(field, `Values for ${field.label.toLowerCase()}`, 12));
      else if (field.kind === "status") {
        for (const status of ["error", "healthy"] as const) if (status.includes(typed)) out.push(statusOption(status, "Values for status"));
      } else if (!negate) {
        for (const example of NUMERIC_EXAMPLES[field.kind] ?? []) out.push({ id: `${field.token}:${example}`, group: `${field.label} (min or max)`, primary: `${field.token}:${example}`, hint: example.startsWith("<") ? "At most" : "At least", action: { type: "numeric", field, example } });
      }
      return out;
    }

    if (typed.startsWith("-")) {
      const rest = typed.slice(1);
      for (const field of SEARCH_FIELDS) {
        if (field.kind === "latency" || field.kind === "cost" || field.kind === "tokens") continue;
        if (rest && !field.token.startsWith(rest) && !field.label.toLowerCase().includes(rest)) continue;
        out.push({ id: `field:-${field.token}`, group: "Exclude", primary: `-${field.token}:`, hint: `Leave out traces by ${field.label.toLowerCase()}`, action: { type: "field", field, prefix: "-" } });
      }
      return out;
    }
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
    // A picked filter is done: close the list so it does not sit over the filter chips. Picking a field keeps it open for values.
    if (action.type !== "field") setOpen(false);
    if (action.type === "facet") {
      const [add, drop] = action.negate ? [`${EXCLUDE_PREFIX}${action.field.key}`, action.field.key] : [action.field.key, `${EXCLUDE_PREFIX}${action.field.key}`];
      const current = decodeValues(query[add]);
      onApply({ [add]: encodeValues(current.includes(action.value) ? current : [...current, action.value]), [drop]: encodeValues(decodeValues(query[drop]).filter((value) => value !== action.value)) });
      clear();
    } else if (action.type === "status") { onApply({ status: action.value }); clear(); }
    else if (action.type === "numeric") {
      const amount = String(NUMERIC_PARSERS[action.field.kind as keyof typeof NUMERIC_PARSERS](action.example) ?? "");
      const bound = comparisonBound(action.example);
      onApply({ [bound === "max" ? action.field.maxKey! : action.field.key]: amount });
      clear();
    }
    else {
      const next = replaceToken(value, token, `${action.prefix ?? ""}${action.field.token}:`, caret);
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
    else if (event.key === "Enter") setOpen(false);
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
