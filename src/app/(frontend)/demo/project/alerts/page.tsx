import Link from "next/link";

import { demoNow } from "@/lib/demo/demo-queries";
import { DemoHeader, Page, Table, panel, tracingLink } from "@/components/demo/demo-ui";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const when = (ms: number) => new Date(ms).toLocaleString("en", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function DemoAlertsPage() {
  const now = demoNow();
  const rules = [
    { name: "Refund tool failing", rule: "issue_refund errors > 5% over 15 min", channel: "Slack #support-ops", status: "ok", href: tracingLink("toolName=issue_refund&status=error&range=30d") },
    { name: "Error rate above 8%", rule: "any agent, production, 15 min", channel: "Email · on-call", status: "ok", href: tracingLink("status=error&environment=production&range=7d") },
    { name: "Slow answers", rule: "p95 latency > 12 s over 30 min", channel: "Email · on-call", status: "ok", href: tracingLink("range=24h&sort=latency&dir=desc") },
    { name: "Daily spend over $12", rule: "total cost > $12 per day", channel: "Webhook · finance", status: "ok", href: "/demo/project/costs" },
  ];
  const history = [
    { rule: "Refund tool failing", fired: now - 9 * DAY + 2 * 3_600_000, resolved: now - 3 * DAY - 5 * 3_600_000, detail: "issue_refund timeouts on release v1.14.0 (31% of refund runs)" },
    { rule: "Error rate above 8%", fired: now - 8 * DAY, resolved: now - 8 * DAY + 5_400_000, detail: "9.4% of runs failed in production" },
    { rule: "Slow answers", fired: now - 21 * DAY, resolved: now - 21 * DAY + 2_700_000, detail: "p95 reached 14.2 s while a model was slow" },
  ];
  return (
    <Page>
      <DemoHeader title="Alerts"><Link href="/sign-up" className="flex h-7 items-center bg-[#F4D44D] px-3 text-xs font-medium !text-[#0B0D10] hover:bg-[#fff4b5]">New alert</Link></DemoHeader>
      <div className="space-y-4 p-4">
        <section className={panel}>
          <div className="border-b border-[#1F242C] px-3 py-2 text-xs font-medium">Rules</div>
          <Table head={["Name", "Condition", "Sends to", "Status"]} rows={rules.map((r) => [
            <Link key="n" href={r.href} className="!text-[#8AB4FF] hover:underline">{r.name}</Link>,
            <span key="c" className="font-mono text-[#8B93A1]">{r.rule}</span>, <span key="s" className="text-[#C9CED6]">{r.channel}</span>,
            <span key="t" className="inline-flex items-center gap-1.5 text-[#5BE3A0]"><span className="size-1.5 rounded-full bg-[#5BE3A0]" />Healthy</span>,
          ])} />
        </section>
        <section className={panel}>
          <div className="border-b border-[#1F242C] px-3 py-2 text-xs font-medium">Recent alerts</div>
          <Table head={["Rule", "Fired", "Resolved", "What happened"]} rows={history.map((h) => [
            <span key="r" className="text-[#E6E9EE]">{h.rule}</span>, <span key="f" className="font-mono text-[#FF8A8A]">{when(h.fired)}</span>, <span key="v" className="font-mono text-[#8B93A1]">{when(h.resolved)}</span>, <span key="d" className="text-[#8B93A1]">{h.detail}</span>,
          ])} />
        </section>
      </div>
    </Page>
  );
}
