import type { RefObject } from "react";
import type { GroupKind } from "@/lib/group-filters";
import type { GroupRow, GroupStats } from "@/lib/tinybird-groups";

export type Query = Record<string, string>;
export type ListResponse = {
  rows: GroupRow[]; total: number; page: number; pageSize: number; stats: GroupStats;
  environments: Array<{ value: string; groups: number }>; error?: string;
};

/** Everything the explorer works out once, handed to whichever page layout draws it. */
export type GroupView = {
  kind: GroupKind;
  projectId: string;
  /** Where Tracing and the sibling page live: `/dashboard/<id>` or the demo project's path. */
  basePath: string;
  query: Query;
  update: (patch: Query, resetPage?: boolean) => void;
  data: ListResponse | null;
  rows: GroupRow[];
  stats: GroupStats | undefined;
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  sort: string;
  direction: "asc" | "desc";
  loading: boolean;
  error: string | null;
  load: () => void;
  isLive: boolean;
  fixedWindow: boolean;
  toggleLive: () => void;
  refresh: () => void;
  exportCsv: () => void;
  now: number;
  clock: number;
  setNow: (value: number) => void;
  draft: string;
  setDraft: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  filters: Array<{ key: string; label: string }>;
  clearFilters: () => void;
  selected: string | null;
  selectedRow: GroupRow | null;
  fresh: Set<string>;
  selectIndex: (delta: number) => void;
  open: (kind: GroupKind, id: string) => void;
};
