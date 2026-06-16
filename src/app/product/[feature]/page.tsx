import Link from "next/link";
import { notFound } from "next/navigation";

const productFeatures: Record<string, { title: string; description: string }> = {
  "trace-viewer": {
    title: "Trace Viewer",
    description: "Inspect every tool call, LLM decision, and failure in your agent workflows.",
  },
  "cost-dashboard": {
    title: "Cost Dashboard",
    description: "See spend by run, model, tool, and span across your entire agent infrastructure.",
  },
  "tool-calls": {
    title: "Tool Calls",
    description: "Track external API and function calls made by your agents.",
  },
  "llm-calls": {
    title: "LLM Calls",
    description: "Capture model, latency, tokens, and cost for every LLM interaction.",
  },
  failures: {
    title: "Failures",
    description: "Surface errors, retries, stalls, and loops in your agent pipelines.",
  },
};

export function generateStaticParams() {
  return Object.keys(productFeatures).map((feature) => ({ feature }));
}

export default async function ProductFeaturePage({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature } = await params;
  const page = productFeatures[feature];
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
            This page is under construction. In the meantime, check out the{" "}
            <Link href="/blog" className="text-white underline underline-offset-4 decoration-[#444444] hover:decoration-white transition-colors">
              blog
            </Link>{" "}
            for engineering insights or{" "}
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
