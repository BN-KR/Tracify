import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FutureAction, FutureBand, FuturePage } from "@/components/marketing/future19-page";

const docPages: Record<string, { title: string; metaTitle?: string; description: string }> = {
  index: {
    title: "Documentation",
    description: "Learn how to install the SDK and send your first span.",
  },
  python: {
    title: "Python SDK",
    metaTitle: "Python SDK for AI agent tracing",
    description: "Install the Tracify Python SDK, instrument agent functions with a decorator, and send spans, sessions, costs, and model metadata.",
  },
  typescript: {
    title: "TypeScript SDK",
    metaTitle: "TypeScript SDK for AI agent tracing",
    description: "Trace Node.js and Next.js agent workflows with the Tracify TypeScript SDK, including spans, sessions, models, tools, and prompt versions.",
  },
  api: {
    title: "API Reference",
    metaTitle: "AI agent tracing ingestion API reference",
    description: "Send authenticated agent spans from custom runtimes to the Tracify ingestion and OpenTelemetry endpoints with the supported payload fields.",
  },
  prompts: {
    title: "Prompt deployment",
    metaTitle: "Versioned prompt deployment documentation",
    description: "Resolve the labeled prompt version for an environment at runtime without redeploying your agent.",
  },
  evaluation: {
    title: "Evaluation Engine",
    metaTitle: "AI agent evaluation engine documentation",
    description: "Score live traces and offline datasets with judges, deterministic rules, reviewers, regression gates, and monitors.",
  },
  lifecycle: {
    title: "AI engineering lifecycle",
    metaTitle: "AI engineering lifecycle documentation",
    description: "Move from production traces to measured improvements and gated deployment in one workflow.",
  },
  integrations: {
    title: "Integrations",
    metaTitle: "AI agent observability integrations",
    description: "Connect OpenAI, Anthropic, LangChain, LlamaIndex, and any OpenTelemetry-instrumented runtime.",
  },
  "self-hosting": {
    title: "Self-hosting",
    metaTitle: "Self-hosting Tracify infrastructure",
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
  return { title: page.metaTitle || page.title, description: page.description, alternates: { canonical: docKey === "index" ? "/docs" : `/docs/${docKey}` } };
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

  const example = codeExamples[docKey];
  const chapterIndex = Object.keys(docPages).filter((key) => key !== "index").indexOf(docKey) + 1;
  const motifs: Record<string, string> = { python: "PY", typescript: "{ }", api: "POST", prompts: "“ ”", evaluation: "0.92", lifecycle: "→", integrations: "⌘", "self-hosting": "▦" };
  return <FuturePage>
    <header className={`border-b border-black ${chapterIndex % 3 === 0 ? "bg-black text-white" : chapterIndex % 2 === 0 ? "bg-[#f4d44d]" : "bg-[#eceae3]"}`}><div className="mx-auto max-w-[1240px] border-x border-current"><div className="grid md:grid-cols-[120px_1fr_320px]">
      <div className="flex min-h-20 items-center justify-center border-b border-current font-pixel text-4xl opacity-25 md:min-h-[420px] md:border-b-0 md:border-r"><span className="md:-rotate-90">D{String(chapterIndex).padStart(2,"0")}</span></div>
      <div className="flex flex-col justify-between px-5 py-10 sm:px-8 md:px-10 md:py-12"><p className="font-mono text-[9px] uppercase tracking-[0.15em] opacity-50">Documentation / {docKey}</p><h1 className="my-10 font-pixel text-[clamp(3rem,6vw,5.25rem)] leading-[0.88] tracking-[-0.055em]">{page.title}</h1><p className="max-w-xl text-base leading-7 opacity-70">{page.description}</p></div>
      <aside className={`relative flex min-h-56 items-center justify-center overflow-hidden border-t border-current md:border-l md:border-t-0 ${chapterIndex % 3 === 0 ? "bg-[#f4d44d] text-black" : "bg-black text-white"}`}><span className="select-none font-pixel text-[clamp(5rem,11vw,9rem)] leading-none tracking-[-0.08em] opacity-90">{motifs[docKey] ?? "DOC"}</span><div className="absolute inset-x-5 bottom-5 flex justify-between border-t border-current/25 pt-3 font-mono text-[8px] uppercase tracking-[0.12em]"><span>Read</span><span>Run</span><span>Verify</span></div></aside>
    </div></div></header>
    {example ? <>
      <FutureBand label="01 / Activate"><div className="grid border-x border-black md:grid-cols-[220px_1fr]"><div className="border-black bg-[#f4d44d] p-6 md:border-r"><p className="font-pixel text-5xl leading-none tracking-[-0.06em]">Start here.</p></div><pre className="overflow-x-auto whitespace-pre-wrap bg-black p-6 font-mono text-xs leading-6 text-[#f4d44d] md:p-8"><code>{example.install}</code></pre></div></FutureBand>
      <FutureBand label="02 / Working example"><div className="border-x border-black bg-black"><div className="flex items-center justify-between border-b border-white/15 px-5 py-3 font-mono text-[8px] uppercase tracking-[0.13em] text-white/40"><span>example.{docKey === "python" ? "py" : "ts"}</span><span>copy → adapt → run</span></div><pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-xs leading-6 text-white/75 md:p-10"><code>{example.code}</code></pre></div></FutureBand>
      <FutureBand label="03 / Operational notes"><ol className="border-x border-black">{example.notes.map((note, index) => <li key={note} className="grid grid-cols-[54px_1fr] border-b border-black last:border-b-0"><span className="flex items-center justify-center border-r border-black bg-white/35 font-pixel text-3xl text-black/22">0{index + 1}</span><p className="p-5 text-sm leading-6 text-black/62 md:p-7">{note}</p></li>)}</ol></FutureBand>
    </> : null}
    <FutureBand tone="ink"><div className="flex flex-col gap-7 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10"><div><p className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/40">Next route</p><p className="mt-2 font-pixel text-4xl tracking-[-0.05em]">Connect the rest of your stack.</p></div><FutureAction href="/integrations" inverted>Browse integrations</FutureAction></div></FutureBand>
  </FuturePage>;
}
