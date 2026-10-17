import Link from "next/link";

import { DemoHeader, Page, RangeLinks, Table, panel, tracingLink } from "@/components/demo/demo-ui";
import { compactNumber, formatCost, formatTime } from "@/components/dashboard/tracing/format";
import { DEMO_BASE_PATH } from "@/lib/demo/demo-config";
import { demoUsers } from "@/lib/demo/demo-queries";

export const dynamic = "force-dynamic";
const RANGES = [["7", "7 days"], ["30", "30 days"], ["90", "90 days"]] as const;

export default async function DemoUsersPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range } = await searchParams;
  const days = RANGES.some(([value]) => value === range) ? Number(range) : 30;
  const { total, users } = demoUsers(days);
  return (
    <Page>
      <DemoHeader title="Users"><RangeLinks base={`${DEMO_BASE_PATH}/users`} days={days} options={[RANGES[1], RANGES[0], RANGES[2]]} /></DemoHeader>
      <div className="p-4">
        <section className={panel}>
          <div className="border-b border-[#1F242C] px-3 py-2 text-xs text-[#8B93A1]">{compactNumber(total)} customers · busiest 50 shown</div>
          <Table head={["Customer", "Plan", "Region", { label: "Runs", right: true }, { label: "Failed", right: true }, { label: "Tokens", right: true }, { label: "Cost", right: true }, "Last seen"]}
            rows={users.map((u) => [
              <Link key="u" href={tracingLink(`endUserId=${u.user}&range=90d`)} className="font-mono !text-[#8AB4FF] hover:underline">{u.user}</Link>,
              <span key="p" className="text-[#C9CED6]">{u.tier}</span>, <span key="r" className="font-mono text-[#8B93A1]">{u.region}</span>,
              compactNumber(u.runs), u.errors ? <span key="e" className="text-[#FF8A8A]">{u.errors}</span> : "0", compactNumber(u.tokens), formatCost(u.costUsd),
              <span key="t" className="font-mono text-[#8B93A1]">{formatTime(new Date(u.lastMs).toISOString())}</span>,
            ])} />
        </section>
      </div>
    </Page>
  );
}
