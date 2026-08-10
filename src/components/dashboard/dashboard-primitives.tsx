import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { DashboardSignal } from "./dashboard-contracts";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export type { DashboardSignal } from "./dashboard-contracts";

const signalStyles: Record<DashboardSignal, string> = {
  neutral: "border-[#2A2A2A] bg-[#111111] text-[#999999]",
  success: "border-emerald-400/35 bg-emerald-400/5 text-emerald-300",
  warning: "border-amber-400/35 bg-amber-400/5 text-amber-300",
  danger: "border-red-400/35 bg-red-400/5 text-red-300",
  info: "border-sky-300/35 bg-sky-300/5 text-sky-200",
};

export function SignalBadge({ signal, children }: { signal: DashboardSignal; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest", signalStyles[signal])}>
      <span className="size-1.5 bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function DashboardMetric({
  label,
  value,
  detail,
  icon: Icon,
  signal = "neutral",
  href,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  signal?: DashboardSignal;
  href?: string;
}) {
  const content = (
    <Card className={cn("group min-h-[132px] justify-between border-[#2A2A2A] bg-[#111111] p-5 shadow-none transition-[border-color,background-color] duration-150 hover:border-[#555555]", href && "cursor-pointer hover:bg-[#151515]")}>
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#777777]">{label}</span>
        <span className={cn("border p-2", signalStyles[signal])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div>
        <div className="dashboard-number font-mono text-3xl tracking-tight text-white">{value}</div>
        {detail ? <div className="mt-2 font-mono text-[10px] text-[#777777]">{detail}</div> : null}
      </div>
    </Card>
  );

  return href ? <Link href={href} className="block focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">{content}</Link> : content;
}

export function AttentionItem({
  label,
  detail,
  signal,
  href,
}: {
  label: string;
  detail: string;
  signal: DashboardSignal;
  href: string;
}) {
  return (
    <Link href={href} className="group flex items-start gap-3 border-b border-[#242424] px-4 py-3 transition-colors last:border-b-0 hover:bg-[#171717] focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">
      <span className={cn("mt-1.5 size-2 shrink-0 bg-current", signalStyles[signal])} aria-hidden="true" />
      <span className="min-w-0">
        <span className="block truncate font-mono text-xs text-white group-hover:text-white">{label}</span>
        <span className="mt-1 block truncate font-mono text-[10px] text-[#777777]">{detail}</span>
      </span>
    </Link>
  );
}

export function DashboardEmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="border border-dashed border-[#2A2A2A] bg-[#0D0D0D] px-6 py-14 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-[#777777]">{description}</p>
      {href && action ? <Link href={href} className="mt-5 inline-flex border border-[#3A3A3A] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#CCCCCC] transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{action} <span className="ml-2" aria-hidden="true">→</span></Link> : null}
    </div>
  );
}
