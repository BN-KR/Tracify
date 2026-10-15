import Link from "next/link";
import { ArrowRight, BookOpen, Braces, Check, Code2, Gauge, Layers3, ShieldCheck, Terminal } from "lucide-react";
import { getDocs } from "@/lib/markdoc-docs";
import { DocsSearch } from "@/components/docs/docs-search";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { PageHeader } from "@/components/marketing/page-header";
import { FirstTraceSteps } from "@/components/docs/first-trace-steps";
import { Reveal } from "@/components/marketing/landing/reveal";

export const metadata = { title: "Documentation", description: "Install the SDK, instrument an agent, and inspect the execution record.", alternates: { canonical: "/docs" } };

const quickstarts = [["Start tracing", "Send your first useful run in under five minutes.", "quickstart", Terminal], ["TypeScript SDK", "Instrument Node.js, Next.js, or worker workloads.", "typescript", Code2], ["Python SDK", "Add tracing to a Python agent with a small decorator.", "python", BookOpen]] as const;
const productAreas = [["Observability", "Trace runs, sessions, tools, costs, and failures.", "observability", Gauge], ["Prompt operations", "Version, resolve, cache, and connect prompts to traces.", "prompts", Braces], ["Evaluation", "Turn production evidence into measurable release gates.", "evaluation", Check], ["Platform", "Use APIs, exports, datasets, and deployment controls.", "api-platform", Layers3]] as const;

const eyebrow = "font-mono text-[10px] uppercase tracking-[.16em] text-black/55";
const card = "group flex h-full flex-col border border-black p-6 transition-colors hover:bg-[#f4d44d]";

export default function DocsRootPage() {
  const docs = getDocs();
  const navigationDocs = docs.map(({ slug, title, section }) => ({ slug, title, section }));
  const searchDocs = docs.map(({ slug, title, description, section, headings, bodyText, body, noindex }) => ({ slug, title, description, section, headings, bodyText, body, noindex }));
  const sections = [...new Set(docs.map((doc) => doc.section))];

  return (
    <div className="bg-[#eceae3] text-black">
      <PageHeader eyebrow="Documentation" title="Build agents you can explain." lede="Trace decisions, measure outcomes, and promote the versions that prove themselves in production." image="/images/reading/docs.png">
        <Link href="/docs/quickstart" className="inline-flex min-h-12 items-center gap-3 bg-[#f4d44d] px-6 font-mono text-[11px] uppercase tracking-[.14em] text-black transition-colors hover:bg-white">
          Start tracing <ArrowRight className="size-4" />
        </Link>
        <Link href="/docs/mcp-server" className="inline-flex min-h-12 items-center gap-3 border border-white/30 px-6 font-mono text-[11px] uppercase tracking-[.14em] text-white transition-colors hover:border-[#f4d44d] hover:text-[#f4d44d]">
          Install Docs MCP <ArrowRight className="size-4" />
        </Link>
      </PageHeader>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <DocsSidebar docs={navigationDocs} />
        <main className="min-w-0 px-5 py-12 md:px-10 md:py-16">
          <DocsSearch docs={searchDocs} />

          <section id="first-trace" className="mt-14 scroll-mt-24">
            <p className={eyebrow}>Zero to first trace</p>
            <h2 className="mt-3 font-pixel text-[clamp(2.2rem,5vw,3.6rem)] leading-[.9] tracking-[-.06em]">Three steps. Five minutes.</h2>
            <div className="mt-8"><FirstTraceSteps /></div>
            <Link href="/docs/quickstart" className="mt-5 inline-flex font-mono text-[11px] uppercase tracking-[.14em] underline decoration-[#f4d44d] decoration-2 underline-offset-4 hover:bg-[#f4d44d]">Full quickstart →</Link>
          </section>

          <section id="quickstarts" className="mt-20 scroll-mt-24">
            <p className={eyebrow}>Get started</p>
            <h2 className="mt-3 font-pixel text-[clamp(2.2rem,5vw,3.6rem)] leading-[.9] tracking-[-.06em]">Choose your first job.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {quickstarts.map(([title, body, slug, Icon], i) => (
                <Reveal key={slug} delay={i * 0.06}>
                  <Link href={`/docs/${slug}`} className={`${card} min-h-52 bg-[#eceae3]`}>
                    <Icon className="size-5" strokeWidth={1.4} />
                    <h3 className="mt-auto pt-10 font-pixel text-3xl leading-none tracking-[-.05em]">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-black/65 group-hover:text-black">{body}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="areas" className="mt-20 scroll-mt-24">
            <p className={eyebrow}>Product areas</p>
            <h2 className="mt-3 font-pixel text-[clamp(2.2rem,5vw,3.6rem)] leading-[.9] tracking-[-.06em]">One operating record. Four ways to use it.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {productAreas.map(([title, body, slug, Icon], i) => (
                <Reveal key={slug} delay={(i % 2) * 0.06}>
                  <Link href={`/docs/${slug}`} className={`${card} min-h-56 bg-[#090909] text-[#eceae3] hover:text-black`}>
                    <Icon className="size-5" strokeWidth={1.4} />
                    <h3 className="mt-auto pt-12 font-pixel text-4xl leading-none tracking-[-.06em]">{title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/65 group-hover:text-black">{body}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="guides" className="mt-20 scroll-mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className={eyebrow}>All guides</p>
                <h2 className="mt-3 font-pixel text-[clamp(2.2rem,5vw,3.6rem)] leading-[.9] tracking-[-.06em]">Read by intent.</h2>
              </div>
              <span className={eyebrow}>{docs.length} chapters</span>
            </div>
            <div className="mt-8 space-y-10">
              {sections.map((section) => (
                <div key={section}>
                  <div className="border-b-2 border-black pb-3 font-mono text-[11px] uppercase tracking-[.14em]">{section}</div>
                  {docs.filter((doc) => doc.section === section).map((doc) => (
                    <Link key={doc.slug} href={`/docs/${doc.slug}`} className="group grid gap-2 border-b border-black/20 py-4 transition-colors hover:bg-[#f4d44d] sm:grid-cols-[1fr_1.4fr_auto] sm:items-center sm:px-3">
                      <span className="font-pixel text-2xl tracking-[-.04em]">{doc.title}</span>
                      <span className="text-sm leading-6 text-black/65 group-hover:text-black">{doc.description}</span>
                      <ArrowRight className="hidden size-4 transition-transform group-hover:translate-x-1 sm:block" />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <aside className="mt-20 flex flex-col gap-5 border border-black bg-[#f4d44d] p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 size-6 shrink-0" strokeWidth={1.4} />
              <div>
                <p className="font-pixel text-3xl leading-none tracking-[-.05em]">Agent access</p>
                <p className="mt-2 max-w-md text-sm leading-6">Give an AI agent full read-only access to the public docs corpus.</p>
              </div>
            </div>
            <Link href="/docs/mcp-server" className="inline-flex min-h-12 items-center justify-center bg-black px-6 font-mono text-[11px] uppercase tracking-[.14em] text-[#eceae3] transition-colors hover:bg-white hover:text-black">Install Docs MCP →</Link>
          </aside>
        </main>
      </div>
    </div>
  );
}
