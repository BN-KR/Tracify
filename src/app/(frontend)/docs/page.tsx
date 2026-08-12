import { FutureAction, FutureBand, FuturePage } from "@/components/marketing/future19-page";

export const metadata = { title: "Documentation", description: "Install Tracify and send your first agent trace.", alternates: { canonical: "/docs" } };

const chapters = [
  ["Start", "Quickstart", "Install, authenticate, and send the first trace.", "/docs/typescript"],
  ["Instrument", "TypeScript SDK", "Trace Node, Next.js, and AI SDK workloads.", "/docs/typescript"],
  ["Instrument", "Python SDK", "Wrap agents and tools with decorators.", "/docs/python"],
  ["Connect", "OTLP + integrations", "Send standard telemetry from existing stacks.", "/docs/integrations"],
  ["Operate", "Ingestion API", "Build a custom runtime integration.", "/docs/api"],
  ["Improve", "Prompt deployment", "Resolve evaluated prompts at runtime.", "/docs/prompts"],
  ["Understand", "Agent lifecycle", "Connect traces, datasets, evals, and releases.", "/docs/lifecycle"],
  ["Deploy", "Self-hosting", "Review the deployment model and constraints.", "/docs/self-hosting"],
] as const;

export default function DocsRootPage() {
  return <FuturePage>
    <header className="border-b border-black"><div className="mx-auto max-w-[1240px] border-x border-black"><div className="grid lg:grid-cols-[1fr_1fr]">
      <div className="flex min-h-[420px] flex-col justify-between px-5 py-10 sm:px-8 md:px-10 md:py-12"><div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.15em]"><span className="size-2 bg-[#f4d44d]"/>Developer field manual</div><h1 className="font-pixel text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.055em]">Read.<br/>Run.<br/>Verify.</h1><p className="max-w-lg text-base leading-7 text-black/64">Instrument agents, inspect the execution record, and turn findings into safer releases.</p></div>
      <div className="border-t border-black bg-black p-5 text-white lg:border-l lg:border-t-0 md:p-8"><div className="flex h-full min-h-[460px] flex-col border border-white/20"><div className="flex items-center justify-between border-b border-white/20 px-4 py-3 font-mono text-[8px] uppercase tracking-[0.12em] text-white/40"><span>tracify / quickstart</span><span>README.md</span></div><div className="flex-1 p-5 font-mono text-xs leading-7 md:p-8"><p className="text-[#f4d44d]">$ npm i tracify</p><p className="mt-8 text-white/35">{"// initialize the operating record"}</p><p><span className="text-violet-300">import</span> {'{ Tracify }'} <span className="text-violet-300">from</span> &quot;tracify&quot;</p><p className="mt-8 text-white/35">{"// trace the run that matters"}</p><p><span className="text-violet-300">await</span> tracify.trace(<span className="text-[#f4d44d]">&quot;support-agent&quot;</span>, run)</p></div><div className="border-t border-white/20 bg-[#f4d44d] px-4 py-3 font-mono text-[8px] uppercase tracking-[0.12em] text-black">First trace / under five minutes</div></div></div>
    </div></div></header>
    <FutureBand label="Documentation map"><div className="grid md:grid-cols-[240px_1fr]">
      <div className="border-black bg-[#f4d44d] p-6 md:border-r md:p-8"><p className="font-mono text-[9px] uppercase tracking-[0.14em]">Read by intent</p><p className="mt-24 font-pixel text-5xl leading-[0.88] tracking-[-0.06em]">No dead-end reference maze.</p></div>
      <div className="grid sm:grid-cols-2">{chapters.map(([group, title, body, href], index) => <a href={href} key={href} className="group min-h-52 border-b border-black p-6 hover:bg-white/55 sm:odd:border-r sm:last:border-b-0 sm:nth-last-2:border-b-0"><div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.13em] text-black/42"><span>{group}</span><span>0{index + 1}</span></div><h2 className="mt-12 font-pixel text-4xl leading-none tracking-[-0.05em]">{title}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-black/55">{body}</p><span className="mt-5 inline-block font-mono text-[8px] uppercase tracking-[0.12em] decoration-[#d1af18] group-hover:underline">Open chapter ↗</span></a>)}</div>
    </div></FutureBand>
    <FutureBand tone="ink"><div className="flex flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10"><div><p className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/45">Fastest route</p><p className="mt-3 font-pixel text-5xl tracking-[-0.06em]">Send one real trace.</p></div><FutureAction href="/docs/typescript" inverted>Open quickstart</FutureAction></div></FutureBand>
  </FuturePage>;
}
