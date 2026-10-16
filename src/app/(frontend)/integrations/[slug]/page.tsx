import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd, jsonLdString } from "@/lib/seo";
import { integrationPages } from "@/lib/seo-pages";
import { PageHeader } from "@/components/marketing/page-header";
import { ClosingBand, CreamBand, DarkBand, Eyebrow, HeaderAction, SectionTitle } from "@/components/marketing/company/blocks";
import { FaqList } from "@/components/marketing/company/faq-list";

export function generateStaticParams() {
  return integrationPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = integrationPages.find((item) => item.slug === slug);
  return p ? pageMetadata({ title: p.title, description: p.description, path: `/integrations/${p.slug}` }) : {};
}

export default async function IntegrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = integrationPages.find((item) => item.slug === slug);
  if (!p) notFound();
  const schema = [
    breadcrumbJsonLd([{ name: "Tracify", path: "/" }, { name: "Integrations", path: "/integrations" }, { name: p.name, path: `/integrations/${p.slug}` }]),
    faqJsonLd(p.faq),
  ];
  return (
    <div className="overflow-x-clip bg-[#090909]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }} />
      <PageHeader eyebrow={`Integrations / ${p.name}`} title={p.title} lede={p.answer} image="/images/company/integrations-hub.png">
        <HeaderAction href={`/docs/${p.doc}`}>Read the guide</HeaderAction>
        <HeaderAction href="/sign-up" kind="secondary">Start free</HeaderAction>
      </PageHeader>

      <DarkBand>
        <Eyebrow>What you get</Eyebrow>
        <SectionTitle>Recorded on every call.</SectionTitle>
        <ul className="mt-12 grid gap-px border border-white/20 bg-white/20 md:grid-cols-2">
          {p.captures.map((c) => <li key={c} className="bg-[#090909] p-6 text-base leading-7 text-white/80">{c}</li>)}
        </ul>
      </DarkBand>

      <CreamBand>
        <Eyebrow dark={false}>Setup</Eyebrow>
        <SectionTitle>A few lines.</SectionTitle>
        <pre className="mt-10 overflow-x-auto border border-black bg-[#090909] p-6 font-mono text-[13px] leading-6 text-[#eceae3]"><code>{p.code}</code></pre>
        <p className="mt-4 text-sm text-black/60">Full details in the <Link className="underline" href={`/docs/${p.doc}`}>documentation</Link>. All integrations are listed on the <Link className="underline" href="/integrations">integrations page</Link>.</p>
        <div className="mt-14"><FaqList items={p.faq} /></div>
        <ul className="mt-10 flex flex-wrap gap-3">
          {integrationPages.filter((o) => o.slug !== p.slug).map((o) => (
            <li key={o.slug}><Link href={`/integrations/${o.slug}`} className="inline-block border border-black px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-[#f4d44d]">{o.name}</Link></li>
          ))}
        </ul>
      </CreamBand>
      <ClosingBand title="Send your first trace." body="Free to start." actions={[{ href: "/sign-up", label: "Start free", primary: true }, { href: "/compare", label: "Compare tools" }]} />
    </div>
  );
}
