import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Billing & Plan"
        description="Manage your subscription and usage limits."
      />

      <div className="space-y-12 px-6 pb-20">
        {/* Current Usage */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <UsageCard label="Monthly Spend" value="$1.42" limit="$10.00" percentage={14.2} />
          <UsageCard label="Total Spans" value="12.4k" limit="50k" percentage={24.8} />
          <UsageCard label="Active Alerts" value="0" limit="5" percentage={0} />
        </div>

        {/* Plans */}
        <div className="space-y-6">
          <h3 className="font-mono text-sm uppercase tracking-widest text-white">Available Plans</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <PlanCard
              name="Free"
              price="$0"
              description="For hobbyists and individual devs."
              features={["50k spans / mo", "7-day retention", "1 project", "Community support"]}
              current
            />
            <PlanCard
              name="Pro"
              price="$29"
              description="For growing agents and teams."
              features={["500k spans / mo", "30-day retention", "5 projects", "Email support"]}
              highlight
            />
            <PlanCard
              name="Team"
              price="$99"
              description="For production scale operations."
              features={["Unlimited spans", "90-day retention", "Unlimited projects", "Priority support"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageCard({ label, value, limit, percentage }: { label: string, value: string, limit: string, percentage: number }) {
  return (
    <Card className="p-5 rounded-none border-border bg-[#111111] shadow-none space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{label}</p>
        <span className="text-[10px] font-mono text-zinc-400">{value} / {limit}</span>
      </div>
      <div className="h-1 bg-zinc-900 w-full relative overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-white transition-all duration-1000" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  );
}

function PlanCard({ 
  name, 
  price, 
  description, 
  features, 
  current, 
  highlight 
}: { 
  name: string, 
  price: string, 
  description: string, 
  features: string[], 
  current?: boolean, 
  highlight?: boolean 
}) {
  return (
    <Card className={cn(
      "p-6 rounded-none border shadow-none flex flex-col h-full",
      highlight ? "border-white bg-[#161616]" : "border-border bg-[#111111]"
    )}>
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-lg text-white uppercase tracking-tighter">{name}</h4>
          {current && <span className="text-[9px] bg-white text-black px-1.5 py-0.5 font-mono uppercase font-bold">Current</span>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-mono text-white">{price}</span>
          <span className="text-[10px] text-zinc-500 font-mono uppercase">/ month</span>
        </div>
        <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">{description}</p>
        
        <ul className="pt-6 space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
              <Check className="size-3 text-white" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <Button 
        variant={highlight ? "default" : "outline"} 
        disabled={current}
        className={cn(
          "mt-8 rounded-none font-mono text-[10px] uppercase h-10",
          highlight ? "bg-white text-black hover:bg-zinc-200" : "border-zinc-800 text-zinc-400 hover:bg-white hover:text-black"
        )}
      >
        {current ? "Active Plan" : highlight ? "Upgrade to Pro" : `Switch to ${name}`}
      </Button>
    </Card>
  );
}
