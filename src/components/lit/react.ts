"use client";

// Thin @lit/react wrappers so the Lit custom elements can be used as
// idiomatic React components (proper prop passing + typed event callbacks)
// from inside Next.js Client Components.
import { createComponent } from "@lit/react";
import * as React from "react";
import { TracifyFilterBar, type FilterBarFilter } from "./tracify-filter-bar";
import { TracifyTraceMap } from "./tracify-trace-map";
import "./index";

export const FilterBar = createComponent({
  tagName: "tracify-filter-bar",
  elementClass: TracifyFilterBar,
  react: React,
  events: {
    onFiltersChange: "filters-change",
  },
});

export const TraceMap = createComponent({
  tagName: "tracify-trace-map",
  elementClass: TracifyTraceMap,
  react: React,
  events: {
    onSpanSelect: "span-select",
  },
});

export type { FilterBarFilter, FilterFieldOption } from "./tracify-filter-bar";
export type { TraceMapSpan } from "./tracify-trace-map";
