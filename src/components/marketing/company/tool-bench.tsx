import Link from "next/link";
import { toolPath, tools } from "@/lib/tools/registry";

const lanes = [
  ["Debug", "Find what broke"],
  ["Cost", "Know what it costs"],
  ["Build", "Check before you ship"],
  ["Live", "Watch what is up"],
] as const;

/** The tools index as a workbench: one shelf per job, each tool a numbered plate. */
export function ToolBench() {
  return (
    <div className="space-y-12">
      {lanes.map(([group, line]) => {
        const items = tools.filter((t) => t.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} aria-labelledby={`bench-${group}`}>
            <div className="flex items-end justify-between gap-4 border-b-2 border-black pb-3">
              <h3 id={`bench-${group}`} className="font-pixel text-3xl leading-none tracking-[-0.05em] md:text-4xl">{line}</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">{group} / {items.length}</span>
            </div>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => {
                const n = tools.indexOf(t) + 1;
                return (
                  <li key={t.slug}>
                    <Link href={toolPath(t.slug)} className="group relative block h-full border-2 border-black bg-[#090909] p-6 text-[#eceae3] shadow-[6px_6px_0_#090909] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#f4d44d] hover:text-black hover:shadow-[10px_10px_0_#090909] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
                      <span aria-hidden="true" className="absolute right-4 top-4 flex gap-1"><i className="size-1.5 bg-[#f4d44d] group-hover:bg-black" /><i className="size-1.5 bg-white/30 group-hover:bg-black/40" /></span>
                      <span className="font-pixel text-5xl leading-none text-[#f4d44d] group-hover:text-black">{String(n).padStart(2, "0")}</span>
                      <span className="mt-5 block font-pixel text-2xl leading-[0.95] tracking-[-0.05em]">{t.name}</span>
                      <span className="mt-3 block text-sm leading-6 text-white/65 group-hover:text-black/75">{t.blurb}</span>
                      <span className="mt-6 block font-mono text-[11px] uppercase tracking-[0.14em]">Open <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
