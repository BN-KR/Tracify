import Link from "next/link";

import { compactNumber, formatCost } from "@/components/dashboard/tracing/format";
import { DEMO_BASE_PATH, DEMO_PROJECT_NAME } from "@/lib/demo/demo-config";
import { demoSummary } from "@/lib/demo/demo-queries";

export const dynamic = "force-dynamic";

const RANGES = [["7", "7 days"], ["30", "30 days"], ["90", "90 days"]] as const;
const panel = "border border-[#1F242C] bg-[#0E1115]";

function Bars({ rows, format }: { rows: Array<{ label: string; value: number; sub?: string; href?: string }>; format: (value: number) => string }) {
  const max = Math.max(...rows.map((row) => row.value), 1e-9);
  return (
    <ul className="space-y-2.5 p-3">
      {rows.map((row) => {
        const label = row.href ? <Link href={row.href} className="truncate font-mono text-xs !text-[#8AB4FF] hover:underline">{row.label}</Link> : <span className="truncate font-mono text-xs text-[#E6E9EE]">{row.label}</span>;
        return (
          <li key={row.label}>
            <div className="flex items-baseline justify-between gap-3">{label}<span className="shrink-0 font-mono text-xs text-[#C9CED6]">{format(row.value)}</span></div>
            <div className="mt-1 h-1.5 bg-[#161B22]"><div className="h-full bg-[#F4D44D]" style={{ width: `${Math.max(1.5, (row.value / max) * 100)}%` }} /></div>
            {row.sub ? <p className="mt-0.5 font-mono text-[11px] text-[#6B7380]">{row.sub}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

export default async function DemoCostsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range } = await searchParams;
  const days = RANGES.some(([value]) => value === range) ? Number(range) : 30;
  const summary = demoSummary(days);
  const { stats } = summary;
  const peak = Math.max(...summary.daily.map((day) => day.costUsd), 1e-9);
  const top = summary.models[0];
  const tiles = [
    { label: "Total cost", value: formatCost(stats.totalCostUsd) },
    { label: "Cost per trace", value: formatCost(stats.totalCostUsd / Math.max(1, stats.traces)) },
    { label: "Cost per day", value: formatCost(stats.totalCostUsd / days) },
    { label: "Tokens", value: compactNumber(stats.inputTokens + stats.outputTokens), hint: `${compactNumber(stats.inputTokens)} in · ${compactNumber(stats.outputTokens)} out` },
    { label: "Biggest spender", value: top?.model ?? "—", hint: top ? `${Math.round((top.costUsd / Math.max(stats.totalCostUsd, 1e-9)) * 100)}% of spend` : undefined },
  ];

  return (
    <div className="font-[family-name:var(--font-geist-sans)] text-[13px] text-[#E6E9EE]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#1F242C] px-4 py-2.5">
        <h1 className="mr-2 text-base font-semibold tracking-tight">Costs</h1>
        <span className="font-mono text-xs text-[#8B93A1]">{DEMO_PROJECT_NAME}</span>
        <div role="group" aria-label="Time range" className="ml-auto flex border border-[#262C35] p-0.5 text-xs">
          {RANGES.map(([value, label]) => (
            <Link key={value} href={value === "30" ? `${DEMO_BASE_PATH}/costs` : `${DEMO_BASE_PATH}/costs?range=${value}`} aria-current={String(days) === value ? "true" : undefined}
              className={`flex h-6 items-center px-2.5 ${String(days) === value ? "bg-[#232A34] !text-white" : "!text-[#8B93A1] hover:!text-white"}`}>{label}</Link>
          ))}
        </div>
      </header>

      <div className="space-y-4 p-4">
        <section aria-label="Summary" className="grid grid-cols-2 gap-px border border-[#1F242C] bg-[#1F242C] md:grid-cols-5">
          {tiles.map((tile) => (
            <div key={tile.label} className="bg-[#0E1115] px-3 py-2.5">
              <p className="text-[11px] text-[#8B93A1]">{tile.label}</p>
              <p className="mt-1 truncate font-mono text-xl text-white">{tile.value}</p>
              {tile.hint ? <p className="mt-0.5 font-mono text-[11px] text-[#6B7380]">{tile.hint}</p> : null}
            </div>
          ))}
        </section>

        <section className={panel} aria-label="Cost per day">
          <div className="flex items-center justify-between border-b border-[#1F242C] px-3 py-2"><h2 className="text-xs font-medium">Cost per day</h2><span className="font-mono text-[11px] text-[#6B7380]">peak {formatCost(peak)}</span></div>
          <div className="flex h-40 items-end gap-px px-3 pb-3 pt-4" role="img" aria-label={`Daily cost over the last ${days} days`}>
            {summary.daily.map((day) => (
              <div key={day.day} title={`${day.day}: ${formatCost(day.costUsd)} · ${day.traces} traces`} className="min-w-px flex-1 bg-[#F4D44D] opacity-90 hover:opacity-100" style={{ height: `${Math.max(2, (day.costUsd / peak) * 100)}%` }} />
            ))}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className={panel} aria-label="Cost by model">
            <div className="border-b border-[#1F242C] px-3 py-2"><h2 className="text-xs font-medium">By model</h2></div>
            <Bars format={formatCost} rows={summary.models.map((row) => ({ label: row.model, value: row.costUsd, sub: `${compactNumber(row.calls)} calls · ${compactNumber(row.inputTokens + row.outputTokens)} tokens`, href: `${DEMO_BASE_PATH}/tracing?modelId=${encodeURIComponent(row.model)}&range=${days}d` }))} />
          </section>
          <section className={panel} aria-label="Cost by agent">
            <div className="border-b border-[#1F242C] px-3 py-2"><h2 className="text-xs font-medium">By agent</h2></div>
            <Bars format={formatCost} rows={summary.traceNames.map((row) => ({ label: row.name, value: row.costUsd, sub: `${compactNumber(row.traces)} traces · ${formatCost(row.costUsd / Math.max(1, row.traces))} each`, href: `${DEMO_BASE_PATH}/tracing?traceName=${encodeURIComponent(row.name)}&range=${days}d` }))} />
          </section>
          <section className={panel} aria-label="Cost by customer">
            <div className="border-b border-[#1F242C] px-3 py-2"><h2 className="text-xs font-medium">Top customers by cost</h2></div>
            <Bars format={formatCost} rows={summary.users.map((row) => ({ label: row.user, value: row.costUsd, sub: `${compactNumber(row.traces)} traces`, href: `${DEMO_BASE_PATH}/tracing?endUserId=${encodeURIComponent(row.user)}&range=${days}d` }))} />
          </section>
          <section className={panel} aria-label="Tool use">
            <div className="border-b border-[#1F242C] px-3 py-2"><h2 className="text-xs font-medium">Tool calls and failures</h2></div>
            <Bars format={(value) => `${compactNumber(value)} traces`} rows={summary.tools.map((row) => ({ label: row.tool, value: row.calls, sub: row.failures ? `${row.failures} traces with a failure` : "no failures", href: `${DEMO_BASE_PATH}/tracing?toolName=${encodeURIComponent(row.tool)}&range=${days}d` }))} />
          </section>
        </div>
      </div>
    </div>
  );
}
