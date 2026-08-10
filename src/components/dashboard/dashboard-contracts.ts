import type { LucideIcon } from "lucide-react";

export type DashboardSignal = "neutral" | "success" | "warning" | "danger" | "info";
export type AlertStatus = "active" | "resolved" | "muted";

export type DashboardMetricContract = {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  signal?: DashboardSignal;
  href?: string;
};

export type DashboardAttentionItem = {
  label: string;
  detail: string;
  signal: DashboardSignal;
  href: string;
};

export type DashboardTimeRange = 1 | 7 | 30 | 90;

export type RunListFilters = {
  q: string;
  status: string;
  sort: string;
  model: string;
  session: string;
  environment: string;
  release: string;
  minCost: string;
  minSpans: string;
  days: string;
  limit: number;
};

export type SavedRunView = RunListFilters & {
  id: string;
  name: string;
};

export type DashboardQueryState = {
  range?: DashboardTimeRange;
  page?: number;
  limit?: number;
  sort?: string;
  selected?: string;
};
