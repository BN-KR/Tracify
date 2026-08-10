import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDot,
  Code2,
  Coins,
  Database,
  Fingerprint,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const traceSteps = [
  ["00:00.000", "agent.start", "Support request received"],
  ["00:00.184", "model.plan", "Route ticket to account lookup"],
  ["00:00.742", "tool.account", "Upstream request timed out"],
  ["00:05.744", "retry.account", "Latency budget exhausted"],
] as const;

const qualityBars = [62, 74, 66, 81, 78, 86, 83, 91, 88, 94] as const;

const pipeline = [
  ["01", "Observe", "12,418 production runs"],
  ["02", "Collect", "184 difficult examples"],
  ["03", "Compare", "3 prompt candidates"],
  ["04", "Approve", "Quality gate passed"],
  ["05", "Monitor", "v2.4.0 in production"],
] as const;

const costRows = [
  ["Model generation", "$0.026", "63%"],
  ["Tool execution", "$0.009", "22%"],
  ["Evaluation", "$0.004", "10%"],
  ["Retries", "$0.002", "5%"],
] as const;

const sessionCells = [1, 2, 1, 3, 2, 1, 2, 3, 4, 2, 1, 2, 3, 4, 4, 3, 2, 1, 2, 3, 4, 3, 2, 2, 1, 3, 4, 4, 3, 2, 1, 2, 3, 2, 4, 3, 1, 2, 2, 3, 4, 2] as const;

const integrationGroups = [
  ["Models", ["OpenAI", "Anthropic", "Google AI", "Mistral"]],
  ["Frameworks", ["Vercel AI SDK", "LangChain", "LlamaIndex", "OpenAI Agents"]],
  ["Transport", ["OpenTelemetry", "HTTP API", "TypeScript SDK", "Python SDK"]],
] as const;

function ConceptLabel({ number, name, light = false }: { number: string; name: string; light?: boolean }) {
  return <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${light ? "text-zinc-500" : "text-zinc-500"}`}>Concept {number} / {name}</p>;
}

export function LandingExplorationsMore() {
  return (
    <section aria-label="Additional landing page concept explorations" className="border-t-4 border-double border-white/30 bg-[#050505]">
      <div className="border-b border-white/15 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">Exploration round 02 / ten additional directions</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">Concepts 04–13 · independently removable</p>
        </div>
      </div>

      <section id="concept-flight-recorder" className="relative overflow-hidden border-b border-white/10 px-6 py-24 md:px-10 md:py-28">
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <ConceptLabel number="04" name="incident flight recorder" />
            <h2 className="mt-5 max-w-[520px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">Replay the reasoning around the failure.</h2>
            <p className="mt-6 max-w-[430px] text-[16px] leading-7 text-zinc-400">A cinematic incident narrative that turns a noisy trace into one precise engineering story.</p>
            <div className="mt-8 flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-500"><span className="flex items-center gap-2"><AlertTriangle className="size-3" /> Failure isolated</span><span>11.67s total</span></div>
          </div>
          <div className="border border-white/15 bg-black/90 shadow-[18px_18px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500"><span>run_8f21a9 / flight recorder</span><span>Production</span></div>
            <div className="grid md:grid-cols-[1.18fr_0.82fr]">
              <div className="divide-y divide-white/10 border-b border-white/10 md:border-b-0 md:border-r">{traceSteps.map(([time, event, detail], index) => <div key={event} className={`grid grid-cols-[72px_1fr] gap-4 px-5 py-4 ${index === 2 ? "bg-white/[0.07]" : ""}`}><span className="font-mono text-[9px] text-zinc-600">{time}</span><div><p className="font-mono text-[11px] text-white">{event}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p></div></div>)}</div>
              <div className="flex flex-col justify-between p-5"><div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">Root cause</p><p className="mt-4 font-sans text-2xl leading-tight">Retry started after the remaining latency budget was gone.</p></div><div className="mt-10 border-t border-white/10 pt-4"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">Recommended change</p><p className="mt-2 text-sm text-zinc-300">Short-circuit to cached account context after 2.5s.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="concept-quality-scorecard" className="border-b border-black/15 bg-white px-6 py-24 text-black md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-end">
            <div><ConceptLabel number="05" name="quality scorecard" light /><p className="mt-8 font-mono text-[clamp(6rem,15vw,12rem)] leading-[0.72] tracking-[-0.1em]">94.2</p><p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Composite quality / production</p></div>
            <div><h2 className="max-w-[720px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">Quality should feel as concrete as uptime.</h2><div className="mt-10 grid h-44 grid-cols-10 items-end gap-2 border-b border-black/20 pb-px">{qualityBars.map((value, index) => <div key={`${value}-${index}`} className="group relative bg-black" style={{ height: `${value}%` }}><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 font-mono text-[9px] group-hover:block">{value}</span></div>)}</div><div className="mt-4 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500"><span>10 releases ago</span><span>Current release</span></div></div>
          </div>
          <div className="mt-12 grid border-l border-t border-black/15 sm:grid-cols-2 lg:grid-cols-4">{[["Correctness","96.0","+4.8"],["Helpfulness","93.4","+7.1"],["Policy","99.1","+0.4"],["Groundedness","88.2","+9.6"]].map(([label, value, delta]) => <div key={label} className="border-b border-r border-black/15 p-5"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">{label}</p><div className="mt-5 flex items-end justify-between"><span className="font-mono text-3xl">{value}</span><span className="font-mono text-[10px]">↑ {delta}</span></div></div>)}</div>
        </div>
      </section>

      <section id="concept-release-pipeline" className="border-b border-white/10 bg-[#0a0a0a] px-6 py-24 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="text-center"><ConceptLabel number="06" name="release pipeline" /><h2 className="mx-auto mt-5 max-w-[850px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">A straight line from behavior to better behavior.</h2><p className="mx-auto mt-6 max-w-[570px] text-[16px] leading-7 text-zinc-400">A centered process composition for teams that need the full lifecycle understood in one glance.</p></div>
          <div className="mt-14 grid border-l border-t border-white/15 md:grid-cols-5">{pipeline.map(([number, label, detail], index) => <div key={label} className="relative border-b border-r border-white/15 p-6"><span className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">{number}</span><div className="mt-12 flex size-9 items-center justify-center border border-white/20 bg-black"><Check className="size-3" /></div><h3 className="mt-6 font-mono text-xs uppercase tracking-[0.14em]">{label}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{detail}</p>{index < pipeline.length - 1 ? <ArrowRight className="absolute -right-2 top-1/2 z-10 hidden size-4 bg-[#0a0a0a] text-zinc-500 md:block" /> : null}</div>)}</div>
          <div className="mt-7 flex justify-center"><Link href="/product/lifecycle" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white">See the release workflow <ArrowUpRight className="size-3" /></Link></div>
        </div>
      </section>

      <section id="concept-cost-ledger" className="border-b border-white/10 px-6 py-24 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
          <div className="flex flex-col justify-between border-y border-white/15 py-7"><div><ConceptLabel number="07" name="cost anatomy" /><h2 className="mt-5 max-w-[500px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">Know the price of a useful answer.</h2></div><div className="mt-14"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">Median successful run</p><p className="mt-3 font-mono text-6xl tracking-[-0.07em]">$0.041</p></div></div>
          <div className="border border-white/15 bg-[#0b0b0b]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Cost ledger / last 7 days</span><Coins className="size-4 text-zinc-500" /></div><div className="p-5"><div className="flex h-20 overflow-hidden border border-white/10">{[[63,"bg-white"],[22,"bg-zinc-400"],[10,"bg-zinc-600"],[5,"bg-zinc-800"]].map(([width, tone], index) => <div key={index} className={`${tone} flex items-end p-2 text-black`} style={{ width: `${width}%` }}><span className="font-mono text-[9px]">{width}%</span></div>)}</div><div className="mt-7 divide-y divide-white/10">{costRows.map(([label, cost, share]) => <div key={label} className="grid grid-cols-[1fr_auto_auto] gap-7 py-4 font-mono text-xs"><span className="text-zinc-400">{label}</span><span>{cost}</span><span className="w-10 text-right text-zinc-600">{share}</span></div>)}</div><div className="mt-5 grid grid-cols-3 border-t border-white/10 pt-5"><div><p className="font-mono text-[9px] uppercase text-zinc-600">Runs</p><p className="mt-2 font-mono text-lg">18.2k</p></div><div><p className="font-mono text-[9px] uppercase text-zinc-600">Saved</p><p className="mt-2 font-mono text-lg">$842</p></div><div><p className="font-mono text-[9px] uppercase text-zinc-600">Retries</p><p className="mt-2 font-mono text-lg">1.8%</p></div></div></div></div>
        </div>
      </section>

      <section id="concept-collaboration" className="border-b border-black/15 bg-[#e9e7e1] px-6 py-24 text-black md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]"><div className="grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-end"><div><ConceptLabel number="08" name="collaborative review" light /><h2 className="mt-5 max-w-[650px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">Put the conversation beside the evidence.</h2></div><p className="max-w-[420px] text-[16px] leading-7 text-zinc-600">A warmer, document-like direction for product and engineering teams reviewing agent behavior together.</p></div>
          <div className="mt-12 grid border border-black/20 bg-white lg:grid-cols-[1.35fr_0.65fr]"><div className="border-b border-black/15 p-6 lg:border-b-0 lg:border-r"><div className="flex items-center justify-between border-b border-black/10 pb-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Selected span / compose_response</p><span className="font-mono text-[10px]">2.41s</span></div><div className="mt-6 grid gap-5 md:grid-cols-2"><div className="bg-[#f5f4ef] p-5"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">Input</p><p className="mt-4 text-sm leading-7 text-zinc-700">Customer asks why a refund has not reached their account after seven business days.</p></div><div className="bg-[#f5f4ef] p-5"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">Output</p><p className="mt-4 text-sm leading-7 text-zinc-700">The agent promises a refund date without confirming the payment processor state.</p></div></div><div className="mt-5 border-l-2 border-black pl-5"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">Evaluation finding</p><p className="mt-2 text-lg">Unsupported certainty · score 0.42</p></div></div><div className="p-6"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Review thread</p><Users className="size-4" /></div><div className="mt-7 space-y-6"><div><p className="font-mono text-[10px]">Maya · Product</p><p className="mt-2 text-sm leading-6 text-zinc-600">Can we require processor status before the model writes a date?</p></div><div className="border-t border-black/10 pt-5"><p className="font-mono text-[10px]">Jon · Engineering</p><p className="mt-2 text-sm leading-6 text-zinc-600">Yes. I added the tool result to the evaluator dataset.</p></div><div className="border-t border-black/10 pt-5"><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]"><Check className="size-3" /> Change ready for experiment</p></div></div></div></div>
        </div>
      </section>

      <section id="concept-session-map" className="border-b border-white/10 bg-[#080808] px-6 py-24 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.66fr_1.34fr] lg:items-center"><div><ConceptLabel number="09" name="session map" /><h2 className="mt-5 max-w-[500px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">See where behavior starts to drift.</h2><p className="mt-6 max-w-[430px] text-[16px] leading-7 text-zinc-400">A data-dense operating view inspired by the quiet confidence of modern product dashboards.</p><div className="mt-8 flex gap-8"><div><p className="font-mono text-2xl">2.7%</p><p className="mt-1 font-mono text-[9px] uppercase text-zinc-600">Failure rate</p></div><div><p className="font-mono text-2xl">84</p><p className="mt-1 font-mono text-[9px] uppercase text-zinc-600">Flagged sessions</p></div></div></div><div className="border border-white/15 bg-black p-5"><div className="flex items-center justify-between border-b border-white/10 pb-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Sessions / six-week behavior map</p><Database className="size-4 text-zinc-500" /></div><div className="mt-6 grid grid-cols-7 gap-2">{sessionCells.map((level, index) => <div key={index} className={`aspect-square border border-white/10 ${level === 1 ? "bg-white/[0.05]" : level === 2 ? "bg-white/[0.16]" : level === 3 ? "bg-white/[0.34]" : "bg-white/[0.72]"}`}><span className="sr-only">Activity level {level}</span></div>)}</div><div className="mt-5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600"><span>Jul 01</span><span className="flex items-center gap-2">Quiet <span className="h-2 w-16 bg-gradient-to-r from-white/5 to-white/80" /> Active</span><span>Aug 09</span></div></div></div>
      </section>

      <section id="concept-control-plane" className="border-b border-white/10 px-6 py-24 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]"><div className="grid gap-10 border-b border-white/15 pb-9 md:grid-cols-[1fr_0.8fr] md:items-end"><div><ConceptLabel number="10" name="control plane" /><h2 className="mt-5 max-w-[700px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">Make safe behavior part of the runtime contract.</h2></div><p className="max-w-[420px] text-[16px] leading-7 text-zinc-400">A policy-forward composition for teams that need observability and operational control to read as one product.</p></div><div className="grid border-l border-white/15 lg:grid-cols-[0.9fr_1.1fr]"><div className="divide-y divide-white/15 border-r border-white/15">{[["01","Cost ceilings","Stop expensive retry loops before they compound."],["02","Model fallbacks","Route around availability and quality regressions."],["03","Release rules","Promote only versions with passing evidence."]].map(([number,title,body]) => <div key={number} className="grid grid-cols-[48px_1fr] gap-4 p-6"><span className="font-mono text-[10px] text-zinc-600">{number}</span><div><h3 className="font-mono text-xs uppercase tracking-[0.14em]">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{body}</p></div></div>)}</div><div className="border-b border-r border-white/15 bg-[#0b0b0b] p-6 font-mono"><div className="flex items-center justify-between border-b border-white/10 pb-4 text-[10px] uppercase tracking-[0.14em] text-zinc-500"><span>runtime-policy.ts</span><ShieldCheck className="size-4" /></div><pre className="mt-6 overflow-x-auto text-[13px] leading-7 text-zinc-300">{`export const policy = {\n  maxRunCost: 0.08,\n  maxRetries: 2,\n  fallbackModel: 'gpt-5-mini',\n  requireEvaluation: true,\n}`}</pre><div className="mt-6 border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.13em] text-zinc-500"><span className="inline-flex items-center gap-2"><CircleDot className="size-3 text-white" /> Active in production</span></div></div></div></div>
      </section>

      <section id="concept-integration-directory" className="border-b border-black/15 bg-white px-6 py-24 text-black md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]"><div className="flex flex-col justify-between gap-8 border-b border-black/15 pb-8 md:flex-row md:items-end"><div><ConceptLabel number="11" name="integration directory" light /><h2 className="mt-5 max-w-[690px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">Keep your stack. Connect the evidence.</h2></div><Network className="size-8 text-zinc-400" /></div><div className="grid border-l border-black/15 md:grid-cols-3">{integrationGroups.map(([group, items], groupIndex) => <div key={group} className="border-b border-r border-black/15"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{group}</p><span className="font-mono text-[9px] text-zinc-400">0{groupIndex + 1}</span></div>{items.map((item, index) => <div key={item} className="flex items-center justify-between border-b border-black/10 px-5 py-5 last:border-b-0"><span className="font-sans text-lg">{item}</span><span className="flex size-7 items-center justify-center border border-black/15 font-mono text-[9px]">{String(index + 1).padStart(2,"0")}</span></div>)}</div>)}</div><div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/15 py-5"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">SDKs, direct API, and OpenTelemetry</p><Link href="/integrations" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-black">View all integrations <ArrowUpRight className="size-3" /></Link></div></div>
      </section>

      <section id="concept-before-after" className="border-b border-white/10 bg-[#090909] px-6 py-24 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]"><div className="text-center"><ConceptLabel number="12" name="before / after lab" /><h2 className="mx-auto mt-5 max-w-[850px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em] md:text-7xl">Make improvement visible, not anecdotal.</h2></div><div className="mt-14 grid gap-px bg-white/15 border border-white/15 md:grid-cols-2"><div className="bg-[#090909] p-7"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Before / prompt v17</p><span className="font-mono text-[10px] text-zinc-600">Baseline</span></div><p className="mt-10 max-w-[480px] font-sans text-3xl leading-tight tracking-[-0.04em]">The agent retries the same failed account lookup three times.</p><div className="mt-10 grid grid-cols-3 border-y border-white/10 py-5"><div><p className="font-mono text-[9px] text-zinc-600">QUALITY</p><p className="mt-2 font-mono text-xl">0.71</p></div><div><p className="font-mono text-[9px] text-zinc-600">LATENCY</p><p className="mt-2 font-mono text-xl">11.6s</p></div><div><p className="font-mono text-[9px] text-zinc-600">COST</p><p className="mt-2 font-mono text-xl">$0.082</p></div></div><p className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-500"><AlertTriangle className="size-3" /> Regression detected</p></div><div className="bg-white p-7 text-black"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">After / prompt v18</p><span className="font-mono text-[10px]">Candidate</span></div><p className="mt-10 max-w-[480px] font-sans text-3xl leading-tight tracking-[-0.04em]">The agent uses cached context after the first timeout and stays helpful.</p><div className="mt-10 grid grid-cols-3 border-y border-black/10 py-5"><div><p className="font-mono text-[9px] text-zinc-500">QUALITY</p><p className="mt-2 font-mono text-xl">0.94</p></div><div><p className="font-mono text-[9px] text-zinc-500">LATENCY</p><p className="mt-2 font-mono text-xl">3.1s</p></div><div><p className="font-mono text-[9px] text-zinc-500">COST</p><p className="mt-2 font-mono text-xl">$0.039</p></div></div><p className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.13em]"><Check className="size-3" /> Ready to promote</p></div></div></div>
      </section>

      <section id="concept-changelog" className="px-6 py-24 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-start"><div className="lg:sticky lg:top-24"><ConceptLabel number="13" name="release narrative" /><p className="mt-8 font-pixel text-[clamp(5rem,13vw,10rem)] leading-[0.72] tracking-[-0.09em]">v2.4</p><h2 className="mt-9 max-w-[470px] font-pixel text-5xl font-normal leading-[0.9] tracking-[-0.065em]">The change, the reason, and the result.</h2><Link href="/changelog" className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Read the changelog <ArrowUpRight className="size-3" /></Link></div><div className="border-t border-white/15">{[["01","The signal","Support-agent retries became the largest source of p95 latency."],["02","The change","Added latency-aware fallback context and a release quality gate."],["03","The proof","Latency fell 73%, cost fell 52%, and quality increased 23 points."],["04","The rollout","Promoted to 100% after 18,204 monitored production runs."]].map(([number,title,body],index) => <article key={number} className="grid gap-5 border-b border-white/15 py-8 md:grid-cols-[70px_0.55fr_1fr]"><span className="font-mono text-[10px] text-zinc-600">{number}</span><div className="flex items-start gap-3">{index === 0 ? <Fingerprint className="mt-0.5 size-4" /> : index === 1 ? <Code2 className="mt-0.5 size-4" /> : index === 2 ? <Sparkles className="mt-0.5 size-4" /> : <Zap className="mt-0.5 size-4" />}<h3 className="font-mono text-xs uppercase tracking-[0.14em]">{title}</h3></div><p className="max-w-[520px] text-[16px] leading-7 text-zinc-400">{body}</p></article>)}</div></div>
      </section>

      <div className="border-y border-white/15 bg-white px-6 py-5 text-black md:px-10"><div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[0.18em]">End of concepts 04–13</p><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">Choose, combine, remove, or rebuild any direction</p></div></div>
    </section>
  );
}
