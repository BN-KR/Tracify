import Link from "next/link";

const steps = [
  ["01", "Detect", "Trace", "/product/trace-viewer"],
  ["02", "Inspect", "Context", "/product/trace-viewer"],
  ["03", "Evaluate", "Quality", "/product/evaluation-engine"],
  ["04", "Promote", "Release gate", "/product/lifecycle"],
  ["05", "Monitor", "Alerts", "/product/failures"],
] as const;

export function LifecycleRail() {
  return (
    <nav aria-label="Agent improvement lifecycle" className="grid border-b border-white/15 py-6 sm:grid-cols-5">
      {steps.map(([number, label, detail, href], index) => (
        <Link key={label} href={href} className={`group border-l border-white/15 px-4 py-2 first:border-l-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white ${index === 0 ? "sm:pl-0" : ""}`}>
          <span className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">{number}</span>
          <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300 transition-colors group-hover:text-white">{label}</span>
          <span className="mt-1 block text-xs text-zinc-600 transition-colors group-hover:text-zinc-400">{detail}</span>
        </Link>
      ))}
    </nav>
  );
}
