import Link from "next/link";
import { notFound } from "next/navigation";

import { DemoHeader, Page, Table, panel } from "@/components/demo/demo-ui";
import { SAMPLE_PAGES } from "@/components/demo/sample-pages";

export default async function DemoSamplePage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  const page = Object.hasOwn(SAMPLE_PAGES, view) ? SAMPLE_PAGES[view] : undefined;
  if (!page) notFound();
  return (
    <Page>
      <DemoHeader title={page.title} />
      <div className="space-y-4 p-4">
        <p className="max-w-2xl text-[#C9CED6]">{page.intro}</p>
        {page.tables.map((table) => (
          <section key={table.title} className={panel}>
            <div className="border-b border-[#1F242C] px-3 py-2 text-xs font-medium">{table.title}</div>
            <Table head={table.head.map((label, i) => (table.right?.includes(i) ? { label, right: true } : label))} rows={table.rows.map((row) => row.map((value, i) => (i === 0 ? <span key={i} className="text-[#E6E9EE]">{value}</span> : value)))} />
          </section>
        ))}
        <p className="text-xs text-[#8B93A1]">Sample content. <Link href="/sign-up" className="!text-[#f4d44d] hover:underline">{page.cta} →</Link></p>
      </div>
    </Page>
  );
}
