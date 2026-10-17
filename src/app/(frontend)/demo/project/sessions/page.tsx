import Link from "next/link";

import { DemoHeader, Page, RangeLinks, Table, panel, tracingLink } from "@/components/demo/demo-ui";
import { compactNumber, formatCost, formatDuration, formatTime } from "@/components/dashboard/tracing/format";
import { DEMO_BASE_PATH } from "@/lib/demo/demo-config";
import { demoSessions } from "@/lib/demo/demo-queries";

export const dynamic = "force-dynamic";
const RANGES = [["7", "7 days"], ["30", "30 days"], ["90", "90 days"]] as const;

export default async function DemoSessionsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range } = await searchParams;
  const days = RANGES.some(([value]) => value === range) ? Number(range) : 7;
  const { total, sessions } = demoSessions(days);
  return (
    <Page>
      <DemoHeader title="Sessions"><RangeLinks base={`${DEMO_BASE_PATH}/sessions`} days={days} options={RANGES} /></DemoHeader>
      <div className="p-4">
        <section className={panel}>
          <div className="border-b border-[#1F242C] px-3 py-2 text-xs text-[#8B93A1]">{compactNumber(total)} sessions · a session groups one customer&apos;s runs in a conversation · newest 50 shown</div>
          <Table head={["Session", "Customer", "Agents", { label: "Runs", right: true }, { label: "Failed", right: true }, { label: "Cost", right: true }, { label: "Length", right: true }, "Last active"]}
            rows={sessions.map((s) => [
              <Link key="s" href={tracingLink(`sessionId=${s.sessionId}&range=90d`)} className="font-mono !text-[#8AB4FF] hover:underline">{s.sessionId}</Link>,
              <span key="u" className="font-mono text-[#C9CED6]">{s.user}</span>,
              <span key="a" className="text-[#8B93A1]">{s.agents.join(", ")}</span>,
              String(s.runs), s.errors ? <span key="e" className="text-[#FF8A8A]">{s.errors}</span> : "0", formatCost(s.costUsd), formatDuration(s.lastMs - s.firstMs),
              <span key="t" className="font-mono text-[#8B93A1]">{formatTime(new Date(s.lastMs).toISOString())}</span>,
            ])} />
        </section>
      </div>
    </Page>
  );
}
