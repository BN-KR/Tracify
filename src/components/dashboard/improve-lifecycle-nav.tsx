import Link from "next/link";
import { cn } from "@/lib/utils";

const steps = [
  { id: "observe", label: "Observe", href: "runs", description: "Find production examples" },
  { id: "collect", label: "Collect", href: "datasets", description: "Build reusable cases" },
  { id: "evaluate", label: "Evaluate", href: "evaluation", description: "Score and review" },
  { id: "compare", label: "Compare", href: "experiments", description: "Measure changes" },
  { id: "promote", label: "Promote", href: "prompts", description: "Gate versions" },
  { id: "monitor", label: "Monitor", href: "evaluation/monitors", description: "Watch regressions" },
] as const;

export function ImproveLifecycleNav({ projectId, active }: { projectId: string; active: (typeof steps)[number]["id"] }) {
  return (
    <nav aria-label="Improve lifecycle" className="border-y border-border bg-muted/5 px-6 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Improve lifecycle</span>
        <span className="hidden font-mono text-[10px] text-zinc-600 md:block">Observe → collect → evaluate → compare → promote → monitor</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((step, index) => (
          <Link key={step.id} href={`/dashboard/${projectId}/${step.href}`} className={cn("group border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white", active === step.id ? "border-white bg-white text-black" : "border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white")} aria-current={active === step.id ? "step" : undefined}>
            <div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] uppercase tracking-widest">0{index + 1} · {step.label}</span><span className={cn("font-mono text-[10px]", active === step.id ? "text-black/50" : "text-zinc-700")}>→</span></div>
            <div className={cn("mt-1 text-xs", active === step.id ? "text-black/70" : "text-zinc-600 group-hover:text-zinc-400")}>{step.description}</div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
