import { getPublicDocs } from "@/lib/markdoc-docs";
import { glossaryTerms } from "@/lib/glossary";
import { comparisons, integrationPages } from "@/lib/seo-pages";

export const dynamic = "force-static";

/** One plain-text file with Tracify's public docs, glossary, comparisons and integrations, for AI assistants and AI search. */
export function GET() {
  const parts: string[] = [
    "# Tracify (full text)\n\nTracify is an observability and evaluation platform for AI agents. It records agent runs, model calls and tool calls as traces, tracks cost, tokens and latency, raises alerts, and runs evaluations. Traces can be sent with the TypeScript or Python SDK or over OpenTelemetry (OTLP HTTP). An EU region is available. Canonical site: https://www.tracify.tech",
    "## Glossary\n" + glossaryTerms.map((t) => `### ${t.term}\n${t.definition} ${t.expansion}\nhttps://www.tracify.tech/glossary/${t.slug}`).join("\n\n"),
    "## Comparisons\n" + comparisons.map((c) => `### Tracify vs ${c.name}\n${c.oneLine}\nPick ${c.name} if: ${c.pickThem.join("; ")}.\nPick Tracify if: ${c.pickTracify.join("; ")}.\nhttps://www.tracify.tech/compare/${c.slug}`).join("\n\n"),
    "## Integrations\n" + integrationPages.map((p) => `### ${p.title}\n${p.answer}\nhttps://www.tracify.tech/integrations/${p.slug}`).join("\n\n"),
    "## Documentation\n" + getPublicDocs().map((d) => `### ${d.title}\nSource: ${d.canonicalUrl}\n\n${d.body}`).join("\n\n---\n\n"),
  ];
  return new Response(parts.join("\n\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
