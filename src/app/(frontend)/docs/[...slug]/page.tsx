import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { DocsActions } from "@/components/docs/docs-actions";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { MarkdocDoc } from "@/components/docs/markdoc-doc";
import { FuturePage } from "@/components/marketing/future19-page";
import { getDoc, getDocs } from "@/lib/markdoc-docs";

export function generateStaticParams() {
  return getDocs().map((doc) => ({ slug: [doc.slug] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const doc = getDoc((await params).slug?.[0] ?? "");
  return doc ? { title: doc.title, description: doc.description, alternates: { canonical: `/docs/${doc.slug}` } } : {};
}

export default async function DocsArticlePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const doc = getDoc((await params).slug?.[0] ?? "");
  if (!doc) notFound();

  const docs = getDocs();
  const navigationDocs = docs.map(({ slug, title, section }) => ({ slug, title, section }));
  const markdown = `# ${doc.title}\n\n${doc.description}\n\n${doc.body}`;
  const next = docs[docs.findIndex((item) => item.slug === doc.slug) + 1];

  return (
    <FuturePage>
      <div className="min-h-screen bg-[#f3f2ed] text-black">
        <div className="mx-auto grid max-w-[1440px] border-x border-b border-black lg:grid-cols-[250px_minmax(0,1fr)_200px]">
          <DocsSidebar docs={navigationDocs} activeSlug={doc.slug} />
          <main className="min-w-0 p-5 md:p-10 lg:p-14">
            <Link href="/docs" className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.13em] text-black/55 transition hover:text-black">
              <ChevronLeft className="size-3" />All documentation
            </Link>
            <div className="mt-10 flex flex-col gap-6 border-b border-black pb-8 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.14em] text-black/45">{doc.section} / guide {String(doc.order).padStart(2, "0")}</p>
                <h1 className="mt-6 max-w-3xl font-pixel text-[clamp(3.25rem,7vw,6.5rem)] leading-[.84] tracking-[-.07em]">{doc.title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-black/60">{doc.description}</p>
              </div>
              <div className="xl:hidden"><DocsActions markdown={markdown} installUrl="/docs/mcp-server" /></div>
            </div>
            <article className="docs-markdoc mt-10 max-w-3xl"><MarkdocDoc content={doc.content} /></article>
            {next ? (
              <Link href={`/docs/${next.slug}`} className="mt-16 flex max-w-3xl items-center justify-between border-t border-black py-6 transition-colors hover:bg-[#f4d44d]">
                <span><span className="font-mono text-[9px] uppercase tracking-[.13em] text-black/45">Next guide</span><span className="mt-2 block font-pixel text-3xl tracking-[-.05em]">{next.title}</span></span>
                <ArrowRight className="size-5" />
              </Link>
            ) : null}
          </main>
          <aside className="hidden border-l border-black bg-[#eceae3] p-5 xl:block">
            <div className="sticky top-6">
              <p className="font-mono text-[9px] uppercase tracking-[.14em] text-black/45">Page actions</p>
              <DocsActions markdown={markdown} installUrl="/docs/mcp-server" />
              <p className="mt-12 font-mono text-[9px] uppercase tracking-[.14em] text-black/45">Agent access</p>
              <p className="mt-3 text-sm leading-6 text-black/55">Install the read-only docs MCP server for full documentation retrieval.</p>
              <Link href="/docs/mcp-server" className="mt-4 inline-flex font-mono text-[9px] uppercase tracking-[.12em] underline underline-offset-4">MCP setup →</Link>
            </div>
          </aside>
        </div>
      </div>
    </FuturePage>
  );
}
