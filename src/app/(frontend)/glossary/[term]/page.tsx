import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata, breadcrumbJsonLd, jsonLdString } from "@/lib/seo";
import { glossaryTerms } from "@/lib/glossary";
import { PageHeader } from "@/components/marketing/page-header";
import { ClosingBand, CreamBand, Eyebrow, HeaderAction } from "@/components/marketing/company/blocks";

export function generateStaticParams() {
  return glossaryTerms.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const { term } = await params;
  const t = glossaryTerms.find((item) => item.slug === term);
  return t ? pageMetadata({ title: `What is ${t.term}?`, description: t.definition.slice(0, 158), path: `/glossary/${t.slug}` }) : {};
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const t = glossaryTerms.find((item) => item.slug === term);
  if (!t) notFound();
  const related = t.related.map((slug) => glossaryTerms.find((x) => x.slug === slug)).filter((x): x is (typeof glossaryTerms)[number] => Boolean(x));
  const schema = [
    breadcrumbJsonLd([{ name: "Tracify", path: "/" }, { name: "Glossary", path: "/glossary" }, { name: t.term, path: `/glossary/${t.slug}` }]),
    { "@context": "https://schema.org", "@type": "DefinedTerm", name: t.term, description: t.definition, url: `https://www.tracify.tech/glossary/${t.slug}`, inDefinedTermSet: "https://www.tracify.tech/glossary" },
  ];
  return (
    <div className="overflow-x-clip bg-[#090909]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }} />
      <PageHeader eyebrow="Glossary" title={`What is ${t.term}?`} image="/images/company/glossary-text.png">
        <HeaderAction href="/glossary">All terms</HeaderAction>
        <HeaderAction href="/demo" kind="secondary">See it in a live trace</HeaderAction>
      </PageHeader>
      <CreamBand>
        <div className="max-w-3xl">
          <Eyebrow dark={false}>Definition</Eyebrow>
          <p className="mt-6 text-2xl leading-9 tracking-[-0.01em]">{t.definition}</p>
          <p className="mt-6 text-base leading-7 text-black/70">{t.expansion}</p>
          {related.length > 0 && (
            <div className="mt-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">Related terms</p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {related.map((r) => <li key={r.slug}><Link href={`/glossary/${r.slug}`} className="inline-block border border-black px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-[#f4d44d]">{r.term}</Link></li>)}
              </ul>
            </div>
          )}
        </div>
      </CreamBand>
      <ClosingBand title="Definitions are the start." body="Open a real trace and watch these terms move." actions={[{ href: "/demo", label: "Open the demo", primary: true }, { href: "/docs", label: "Read the docs" }]} />
    </div>
  );
}
