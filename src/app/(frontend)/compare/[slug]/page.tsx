import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd, jsonLdString } from "@/lib/seo";
import { comparisons } from "@/lib/seo-pages";
import { PageHeader } from "@/components/marketing/page-header";
import { ClosingBand, CreamBand, DarkBand, Eyebrow, HeaderAction, SectionTitle } from "@/components/marketing/company/blocks";
import { FaqList } from "@/components/marketing/company/faq-list";

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = comparisons.find((item) => item.slug === slug);
  if (!c) return {};
  return pageMetadata({
    title: `Tracify vs ${c.name}: AI agent observability compared`,
    description: `Tracify vs ${c.name}: how they differ on tracing, cost tracking, evaluation and hosting, and when each is the better choice.`,
    path: `/compare/${c.slug}`,
  });
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = comparisons.find((item) => item.slug === slug);
  if (!c) notFound();
  const schema = [
    breadcrumbJsonLd([{ name: "Tracify", path: "/" }, { name: "Compare", path: "/compare" }, { name: `Tracify vs ${c.name}`, path: `/compare/${c.slug}` }]),
    faqJsonLd(c.faq),
  ];
  const others = comparisons.filter((item) => item.slug !== c.slug);
  return (
    <div className="overflow-x-clip bg-[#090909]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }} />
      <PageHeader eyebrow={`Compare / ${c.name}`} title={`Tracify vs ${c.name}`} lede={c.oneLine}>
        <HeaderAction href="/sign-up">Start free</HeaderAction>
        {c.post && <HeaderAction href={`/blog/${c.post}`} kind="secondary">Read the full comparison</HeaderAction>}
      </PageHeader>

      <CreamBand>
        <Eyebrow dark={false}>Short answer</Eyebrow>
        <SectionTitle>Which one should you pick?</SectionTitle>
        <div className="mt-12 grid gap-px border border-black bg-black md:grid-cols-2">
          <div className="bg-[#eceae3] p-8">
            <h3 className="font-pixel text-2xl tracking-[-0.05em]">Pick {c.name} if</h3>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-black/75">{c.pickThem.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div className="bg-[#f4d44d] p-8">
            <h3 className="font-pixel text-2xl tracking-[-0.05em]">Pick Tracify if</h3>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-black/80">{c.pickTracify.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-6 text-black/60">About {c.name}: {c.theirs}</p>
      </CreamBand>

      <DarkBand>
        <Eyebrow>Side by side</Eyebrow>
        <SectionTitle>The details.</SectionTitle>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/30 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                <th scope="col" className="py-4 pr-6">Area</th>
                <th scope="col" className="py-4 pr-6">{c.name}</th>
                <th scope="col" className="py-4 text-[#f4d44d]">Tracify</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map(([area, them, us]) => (
                <tr key={area} className="border-b border-white/15 align-top">
                  <th scope="row" className="py-5 pr-6 font-mono text-xs uppercase tracking-[0.12em] text-white/70">{area}</th>
                  <td className="py-5 pr-6 leading-6 text-white/70">{them}</td>
                  <td className="py-5 leading-6 text-[#eceae3]">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs leading-5 text-white/45">Descriptions of other products are summaries and can change. Check {c.name}&apos;s own site for current features and pricing.</p>
      </DarkBand>

      <CreamBand>
        <Eyebrow dark={false}>Questions</Eyebrow>
        <SectionTitle>Common questions.</SectionTitle>
        <div className="mt-10"><FaqList items={c.faq} /></div>
        <div className="mt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">More comparisons</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.slug}><Link href={`/compare/${o.slug}`} className="inline-block border border-black px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-[#f4d44d]">Tracify vs {o.name}</Link></li>
            ))}
            <li><Link href="/pricing" className="inline-block border border-black px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-[#f4d44d]">Pricing</Link></li>
            <li><Link href="/docs" className="inline-block border border-black px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-[#f4d44d]">Docs</Link></li>
          </ul>
        </div>
      </CreamBand>
      <ClosingBand title="See it on your own traces." body="Free to start. First trace in minutes." actions={[{ href: "/sign-up", label: "Start free", primary: true }, { href: "/demo", label: "Open the demo" }]} />
    </div>
  );
}
