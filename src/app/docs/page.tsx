import Link from "next/link";

export const metadata = {
  title: "Documentation — tracify",
  description: "Learn how to install the SDK and send your first span.",
  alternates: { canonical: "/docs" },
};

export default function DocsRootPage() {
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
          Documentation
        </h1>
        <p className="font-sans text-[16px] text-[#999999] leading-relaxed mb-8">
          Learn how to install the SDK and send your first span.
        </p>
        <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8">
          <div className="grid gap-3 sm:grid-cols-2"><Link href="/docs/lifecycle" className="border border-zinc-800 p-4 text-sm text-zinc-300 hover:border-zinc-500">Lifecycle overview</Link><Link href="/docs/python" className="border border-zinc-800 p-4 text-sm text-zinc-300 hover:border-zinc-500">Python SDK</Link><Link href="/docs/typescript" className="border border-zinc-800 p-4 text-sm text-zinc-300 hover:border-zinc-500">TypeScript SDK</Link><Link href="/docs/api" className="border border-zinc-800 p-4 text-sm text-zinc-300 hover:border-zinc-500">Ingestion API</Link><Link href="/docs/prompts" className="border border-zinc-800 p-4 text-sm text-zinc-300 hover:border-zinc-500">Prompt deployment</Link><Link href="/docs/integrations" className="border border-zinc-800 p-4 text-sm text-zinc-300 hover:border-zinc-500">Integrations + OTLP</Link><Link href="/docs/self-hosting" className="border border-zinc-800 p-4 text-sm text-zinc-300 hover:border-zinc-500">Self-hosting</Link><Link href="/roadmap" className="border border-zinc-800 p-4 text-sm text-zinc-300 hover:border-zinc-500">Roadmap</Link></div>
        </div>
      </div>
    </div>
  );
}
