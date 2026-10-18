import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd, jsonLdString } from "@/lib/seo";
import { integrationPages } from "@/lib/seo-pages";
import { IntegrationWire } from "@/components/marketing/company/integration-wire";
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
      <section className="bg-[#090909] px-5 pb-8 pt-16 text-[#eceae3] md:px-10 md:pt-24">
        <div className="mx-auto max-w-[1320px]">
          <Eyebrow>Integrations / {p.name}</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-pixel text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.88] tracking-[-0.06em]">{p.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">{p.answer}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <HeaderAction href={`/docs/${p.doc}`}>Read the guide</HeaderAction>
            <HeaderAction href="/sign-up" kind="secondary">Start free</HeaderAction>
          </div>
        </div>
      </section>

      <DarkBand className="!pt-8 md:!pt-8">
        <IntegrationWire name={p.name} captures={p.captures} />
      </DarkBand>

      <CreamBand>
        <Eyebrow dark={false}>Setup</Eyebrow>
        <SectionTitle>A few lines.</SectionTitle>
        <div className="mt-10 border-2 border-black bg-[#090909] text-[#eceae3]">
          <div className="flex items-center gap-2 border-b border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50"><span className="size-2 bg-[#f4d44d]" aria-hidden="true" />{p.language}</div>
          <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-6"><code>{p.code}</code></pre>
        </div>
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
