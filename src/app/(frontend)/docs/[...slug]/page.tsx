import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { DocsActions } from "@/components/docs/docs-actions";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { MarkdocDoc } from "@/components/docs/markdoc-doc";
import Image from "next/image";
import { getDoc, getDocs, getDocMarkdown } from "@/lib/markdoc-docs";

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
  const markdown = getDocMarkdown(doc.slug) ?? "";
  const index = docs.findIndex((item) => item.slug === doc.slug);
  const previous = docs[index - 1];
  const next = docs[index + 1];

  return (
    <div className="bg-[#eceae3] text-black">
      <header className="relative isolate overflow-hidden bg-[#090909] text-[#eceae3]">
        <Image src="/images/reading/docs.png" alt="" fill priority unoptimized sizes="100vw" className="-z-10 object-cover object-right opacity-40 [image-rendering:pixelated]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#090909_35%,rgba(9,9,9,0.5)_100%)]" />
        <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-10 md:px-10 md:pb-14 md:pt-14">
          <Link href="/docs" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#f4d44d] transition-colors hover:text-white">
            <ChevronLeft className="size-3" />All documentation
          </Link>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[.16em] text-white/55">{doc.section} / guide {String(doc.order).padStart(2, "0")}</p>
          <h1 className="mt-4 max-w-4xl text-balance font-pixel text-[clamp(2.6rem,6vw,5.2rem)] leading-[.9] tracking-[-.06em]">{doc.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">{doc.description}</p>
          <div className="mt-6 text-white xl:hidden"><DocsActions markdown={markdown} installUrl="/docs/mcp-server" /></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[250px_minmax(0,1fr)_220px]">
        <DocsSidebar docs={navigationDocs} activeSlug={doc.slug} />
        <main className="min-w-0 px-5 py-10 md:px-10 lg:px-14 lg:py-14">
          <article className="docs-markdoc"><MarkdocDoc content={doc.content} /></article>
          <div className="mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
            {previous ? <Link href={`/docs/${previous.slug}`} className="group flex items-center gap-3 border border-black p-5 transition-colors hover:bg-[#f4d44d]"><ChevronLeft className="size-5 transition-transform group-hover:-translate-x-1" /><span><span className="font-mono text-[10px] uppercase tracking-[.14em] text-black/55">Previous</span><span className="mt-2 block font-pixel text-2xl tracking-[-.05em]">{previous.title}</span></span></Link> : <span />}
            {next ? <Link href={`/docs/${next.slug}`} className="group flex items-center justify-between gap-3 border border-black bg-[#090909] p-5 text-right text-[#eceae3] transition-colors hover:bg-[#f4d44d] hover:text-black"><span><span className="font-mono text-[10px] uppercase tracking-[.14em] opacity-60">Next</span><span className="mt-2 block font-pixel text-2xl tracking-[-.05em]">{next.title}</span></span><ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></Link> : null}
          </div>
        </main>
        <aside className="hidden border-l border-black/15 p-5 xl:block">
          <div className="sticky top-24">
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-black/55">Page actions</p>
            <div className="mt-4"><DocsActions markdown={markdown} installUrl="/docs/mcp-server" /></div>
            <p className="mt-12 font-mono text-[10px] uppercase tracking-[.16em] text-black/55">Agent access</p>
            <p className="mt-3 text-sm leading-6 text-black/65">Install the read-only docs MCP server for full documentation retrieval.</p>
            <Link href="/docs/mcp-server" className="mt-4 inline-flex font-mono text-[10px] uppercase tracking-[.14em] underline decoration-[#f4d44d] decoration-2 underline-offset-4 hover:bg-[#f4d44d]">MCP setup →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
