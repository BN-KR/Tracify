import Link from "next/link";
import { notFound } from "next/navigation";

const docPages: Record<string, { title: string; description: string }> = {
  index: {
    title: "Documentation",
    description: "Learn how to install the SDK and send your first span.",
  },
  python: {
    title: "Python SDK",
    description: "Instrument your Python agents with a single decorator.",
  },
  typescript: {
    title: "TypeScript SDK",
    description: "Trace Node.js and Next.js agent workflows with the TypeScript SDK.",
  },
  api: {
    title: "API Reference",
    description: "Ingest spans directly from custom runtimes using the tracify API.",
  },
};

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const docKey = slug?.[0] || "index";
  const page = docPages[docKey];
  if (!page) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#050505" }}>
      <div className="max-w-[720px] mx-auto px-6 py-24">
        <Link
          href="/"
          className="font-mono text-[13px] text-[#666666] hover:text-white transition-colors inline-block mb-12"
        >
          ← Back to home
        </Link>
        <h1 className="font-mono text-[44px] font-bold text-white mb-6 tracking-tight">
          {page.title}
        </h1>
        <p className="font-sans text-[16px] text-[#999999] leading-relaxed mb-8">
          {page.description}
        </p>
        <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8">
          <p className="font-sans text-[14px] text-[#666666] leading-relaxed">
            Documentation is being written. In the meantime, check the{" "}
            <Link href="/blog" className="text-white underline underline-offset-4 decoration-[#444444] hover:decoration-white transition-colors">
              blog
            </Link>{" "}
            for guides and patterns.
          </p>
        </div>
      </div>
    </div>
  );
}
