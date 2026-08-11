import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const useCases: Record<string, { title: string; description: string }> = {
  research: {
    title: "Research Agents",
    description: "Trace browsing, summarization, and source gathering across research workflows.",
  },
  support: {
    title: "Support Agents",
    description: "Inspect conversations, tools, and escalation paths in customer support agents.",
  },
  automation: {
    title: "Automation Agents",
    description: "Debug multi-step workflows and retries in automated pipelines.",
  },
  "tool-calling": {
    title: "Tool-Calling Agents",
    description: "Catch loops, failed APIs, and hidden cost spikes in tool-using agents.",
  },
};

export function generateStaticParams() {
  return Object.keys(useCases).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = useCases[slug];
  return page ? { title: `${page.title} observability`, description: page.description, alternates: { canonical: `/use-cases/${slug}` } } : {};
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = useCases[slug];
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
            This page is under construction. Check out the{" "}
            <Link href="/blog" className="text-white underline underline-offset-4 decoration-[#444444] hover:decoration-white transition-colors">
              blog
            </Link>{" "}
            for related content or{" "}
            <Link href="/pricing" className="text-white underline underline-offset-4 decoration-[#444444] hover:decoration-white transition-colors">
              view pricing
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
