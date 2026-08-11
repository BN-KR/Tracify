import { FutureAction, FutureBand, FutureMasthead, FuturePage } from "@/components/marketing/future19-page";

export const metadata = { title: "Documentation", description: "Install Tracify and send your first agent trace.", alternates: { canonical: "/docs" } };

const chapters = [
  ["Start", "Quickstart", "Install, authenticate, and send the first trace.", "/docs/quickstart"],
  ["Instrument", "TypeScript SDK", "Trace Node, Next.js, and AI SDK workloads.", "/docs/typescript"],
  ["Instrument", "Python SDK", "Wrap agents and tools with decorators.", "/docs/python"],
  ["Connect", "OTLP + integrations", "Send standard telemetry from existing stacks.", "/docs/integrations"],
  ["Operate", "Ingestion API", "Build a custom runtime integration.", "/docs/api"],
  ["Improve", "Prompt deployment", "Resolve evaluated prompts at runtime.", "/docs/prompts"],
  ["Understand", "Agent lifecycle", "Connect traces, datasets, evals, and releases.", "/docs/lifecycle"],
  ["Deploy", "Self-hosting", "Review the deployment model and constraints.", "/docs/self-hosting"],
] as const;

export default function DocsRootPage() {
  return <FuturePage><FutureMasthead eyebrow="Developers / Documentation" title={<>From first span to release evidence.</>} description="A field manual for instrumenting agents, reading their execution record, and turning findings into safer releases." index="D01" aside={<div><p className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/45">Install / TypeScript</p><code className="mt-5 block border-l-4 border-[#f4d44d] pl-4 font-mono text-sm text-[#f4d44d]">npm i tracify</code></div>} />
    <FutureBand label="Documentation map"><div className="grid md:grid-cols-[240px_1fr]">
      <div className="border-black bg-[#f4d44d] p-6 md:border-r md:p-8"><p className="font-mono text-[9px] uppercase tracking-[0.14em]">Read by intent</p><p className="mt-24 font-pixel text-5xl leading-[0.88] tracking-[-0.06em]">No dead-end reference maze.</p></div>
      <div className="grid sm:grid-cols-2">{chapters.map(([group, title, body, href], index) => <a href={href} key={href} className="group min-h-52 border-b border-black p-6 hover:bg-white/55 sm:odd:border-r sm:last:border-b-0 sm:nth-last-2:border-b-0"><div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.13em] text-black/42"><span>{group}</span><span>0{index + 1}</span></div><h2 className="mt-12 font-pixel text-4xl leading-none tracking-[-0.05em]">{title}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-black/55">{body}</p><span className="mt-5 inline-block font-mono text-[8px] uppercase tracking-[0.12em] decoration-[#d1af18] group-hover:underline">Open chapter ↗</span></a>)}</div>
    </div></FutureBand>
    <FutureBand tone="ink"><div className="flex flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10"><div><p className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/45">Fastest route</p><p className="mt-3 font-pixel text-5xl tracking-[-0.06em]">Send one real trace.</p></div><FutureAction href="/docs/quickstart" inverted>Open quickstart</FutureAction></div></FutureBand>
  </FuturePage>;
}
