import Link from "next/link";
import type { Metadata } from "next";
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
  prompts: {
    title: "Prompt deployment",
    description: "Resolve the labeled prompt version for an environment at runtime without redeploying your agent.",
  },
  evaluation: {
    title: "Evaluation Engine",
    description: "Score live traces and offline datasets with judges, deterministic rules, reviewers, regression gates, and monitors.",
  },
  lifecycle: {
    title: "AI engineering lifecycle",
    description: "Move from production traces to measured improvements and gated deployment in one workflow.",
  },
  integrations: {
    title: "Integrations",
    description: "Connect OpenAI, Anthropic, LangChain, LlamaIndex, and any OpenTelemetry-instrumented runtime.",
  },
  "self-hosting": {
    title: "Self-hosting",
    description: "Run the Tracify web application and connect it to your own Convex, Tinybird, Better Auth, and provider infrastructure.",
  },
};

const codeExamples: Record<string, { install: string; code: string; notes: string[] }> = {
  python: {
    install: "pip install tracify",
    code: "from tracify import Tracify\\n\\ntracify = Tracify(api_key=\"tracify_sk_live_...\")\\n\\n@tracify.trace(name=\"support-agent\")\\ndef answer(question: str):\\n    with tracify.span(\"retrieval\"):\\n        context = search_docs(question)\\n    return llm.complete(question, context=context)",
    notes: ["Set TRACIFY_API_KEY and TRACIFY_ENDPOINT in your runtime.", "Use session_id, user_id, environment, release, and tags to make metrics actionable.", "The SDK queues events asynchronously so tracing does not block the response."],
  },
  typescript: {
    install: "npm install @tracify/sdk",
    code: "import { Tracify } from \"@tracify/sdk\";\\n\\nconst tracify = new Tracify({ apiKey: process.env.TRACIFY_API_KEY });\\n\\nawait tracify.trace(\"support-agent\", async (trace) => {\\n  trace.setSession(\"session_42\", { userId: \"customer_7\" });\\n  return trace.span(\"llm.call\", () => callModel(question));\\n});",
    notes: ["Works in Node.js, Next.js route handlers, and worker runtimes.", "Pass promptVersionId on generation spans to connect prompt versions to traces.", "Use the OTLP endpoint when your framework already emits OpenTelemetry."],
  },
  api: {
    install: "POST https://tracify.tech/api/ingest",
    code: "curl -X POST https://tracify.tech/api/ingest \\\\n  -H \"Authorization: Bearer tracify_sk_live_...\" \\\\n  -H \"Content-Type: application/json\" \\\\n  -d '{\\n    \"spanId\": \"span_123\", \"runId\": \"run_123\",\\n    \"spanType\": \"llm\", \"createdAt\": \"2026-01-01T12:00:00Z\",\\n    \"latencyMs\": 420, \"input\": \"Hello\", \"output\": \"Hi\",\\n    \"modelId\": \"gpt-4o-mini\", \"promptVersionId\": \"<prompt-version-id>\"\\n  }'",
    notes: ["Every request must include a project API key.", "Payloads support sessions, parent spans, tokens, cost, errors, streaming fields, attachments, and promptVersionId.", "For OpenTelemetry, send OTLP HTTP JSON to /api/otel."],
  },
  prompts: {
    install: "GET https://tracify.tech/api/prompts/support-agent?environment=production",
    code: "const response = await fetch(\"https://tracify.tech/api/prompts/support-agent?environment=production\", {\n  headers: { Authorization: `Bearer ${process.env.TRACIFY_API_KEY}` },\n});\n\nconst { version } = await response.json();\nconst prompt = version.content;\n// Use version.id in your generation span as promptVersionId.",
    notes: ["The API returns only versions explicitly labeled for the requested environment.", "Use development, staging, or production labels to promote the same prompt safely.", "Keep the API key server-side and pass the returned version id into ingestion to link runtime traces."],
  },
  evaluation: {
    install: "POST /api/feedback\nPOST /api/evaluation/run",
    code: "// Feedback and typed scores use the same API key as ingestion.\nawait tracify.feedback(traceId, { kind: \"thumb\", value: true });\nawait tracify.score(traceId, \"groundedness\", 0.92);\n\n// Configure evaluators, datasets, suites, reviewers, and monitors\n// from Dashboard → Evaluation Engine.",
    notes: ["Online evaluators run asynchronously and never block ingestion.", "Offline suites support prompt/model candidates, pass-rate and score gates, and production-label promotion.", "Built-in detectors are observe-only; monitor breaches and recoveries use the existing alert surface.", "Configure EVALUATION_INTERNAL_SECRET in Next.js and Convex, and deploy Tinybird evaluation_scores.datasource for production time-series analytics."],
  },
  lifecycle: {
    install: "Trace → Understand → Evaluate → Experiment → Improve → Deploy",
    code: "1. Instrument agent runs with spans, sessions, costs, and prompt versions.\n2. Inspect timelines, payloads, failures, and linked quality signals.\n3. Build evaluators and datasets from real traces.\n4. Run prompt/model candidates against the same dataset.\n5. Compare quality, cost, latency, and failure rates.\n6. Promote only after the release gate passes, then monitor production drift.",
    notes: ["Every step keeps the same project permissions and trace identifiers.", "Prompt versions link back to the traces that used them, so regressions are explainable.", "Production labels are assigned only through a passed evaluation release gate."],
  },
  integrations: {
    install: "pip install opentelemetry-sdk opentelemetry-exporter-otlp-proto-http openai langchain llama-index",
    code: "import os\\nfrom opentelemetry import trace\\nfrom opentelemetry.sdk.trace import TracerProvider\\nfrom opentelemetry.sdk.trace.export import BatchSpanProcessor\\nfrom opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter\\n\\nprovider = TracerProvider()\\nprovider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(\\n    endpoint=\\\"https://tracify.tech/api/otel\\\",\\n    headers={\\\"Authorization\\\": f\\\"Bearer {os.environ['TRACIFY_API_KEY']}\\\"},\\n)))\\ntrace.set_tracer_provider(provider)\\n\\n# OpenAI: wrap the call in a span (or use OpenLLMetry for automatic attributes).\\n# LangChain: attach its OpenTelemetry callback handler to a chain/agent.\\n# LlamaIndex: configure its OTel instrumentation before querying an index.\\n# All three frameworks export through this same provider.",
    notes: ["OpenTelemetry gives you a vendor-neutral path for OpenAI, LangChain, LlamaIndex, and provider instrumentation.", "OpenLLMetry can populate GenAI model, token, retrieval, embedding, and tool attributes automatically.", "Keep the API key server-side; never ship it to browser code. Add session.id and deployment.environment.name attributes for grouping and release analysis."],
  },
  "self-hosting": {
    install: "git clone https://github.com/BN-KR/Tracify && cd Tracify && npm ci",
    code: "NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud\\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...\\nCLERK_SECRET_KEY=sk_...\\nTINYBIRD_HOST=https://api.tinybird.co\\nTINYBIRD_TOKEN=...\\nOPENAI_API_KEY=...\\nnpm run build && npm run start",
    notes: ["Deploy the Next.js application to Vercel, Docker, or your own Node host.", "Create separate Convex and Tinybird environments for staging and production.", "Configure Better Auth secrets, site URL, and Convex auth before exposing dashboard routes.", "Set provider keys only in server environments; use a reverse proxy for custom domains and TLS."],
  },
};

export function generateStaticParams() {
  return Object.keys(docPages)
    .filter((slug) => slug !== "index")
    .map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const docKey = slug?.[0] || "index";
  const page = docPages[docKey];
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: docKey === "index" ? "/docs" : `/docs/${docKey}` } };
}

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
        {codeExamples[docKey] ? <div className="space-y-6"><div className="border border-[#2A2A2A] bg-[#0A0A0A] p-6"><p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#666666]">Install / configure</p><pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-300">{codeExamples[docKey].install}</pre></div><div className="border border-[#2A2A2A] bg-[#0A0A0A] p-6"><p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#666666]">Example</p><pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-300">{codeExamples[docKey].code}</pre></div><ul className="space-y-3 border-l border-zinc-700 pl-5">{codeExamples[docKey].notes.map((note) => <li key={note} className="text-sm leading-6 text-zinc-400">{note}</li>)}</ul><Link href="/integrations" className="inline-flex text-xs font-mono uppercase tracking-widest text-white underline underline-offset-4">Browse integrations</Link></div> : null}
      </div>
    </div>
  );
}
