import { TraceFirstHomepage } from "@/components/marketing/trace-first-homepage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent Tracing and Observability",
  description:
    "Follow the model, tool, and retrieval decisions behind an agent's response. Inspect traces, run context, cost, and evaluation signals in one workspace.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AI Agent Tracing and Observability | Tracify",
    description:
      "Follow the model, tool, and retrieval decisions behind an agent's response with connected traces and run context.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent Tracing and Observability | Tracify",
    description:
      "Inspect the trace behind an agent response, from model and tool calls to retrieval and evaluation signals.",
  },
};

export default function LandingPage() {
  return (
    <TraceFirstHomepage />
  );
}
