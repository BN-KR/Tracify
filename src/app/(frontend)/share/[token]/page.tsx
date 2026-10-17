import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { getSpansForRun } from "@/lib/tinybird";
import { SharedTraceView, type SharedSpan } from "@/components/share/shared-trace-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shared trace",
  robots: { index: false, follow: false },
};

const MAX_SPANS = 500;

export default async function SharedTracePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) notFound();

  // No sign-in: the unguessable link is the permission, and revoking it makes this query return null.
  const shared = await new ConvexHttpClient(url).query(api.sharedTraces.resolve, { token });
  if (!shared) notFound();

  let spans: SharedSpan[] = [];
  let unavailable = false;
  try {
    const rows = await getSpansForRun(shared.runId, shared.projectId);
    // Only what is needed to read the trace. User ids, sessions, metadata and stack traces stay private.
    spans = rows.slice(0, MAX_SPANS).map((span) => ({
      spanId: span.spanId,
      parentSpanId: span.parentSpanId || "",
      spanType: span.spanType,
      label: span.modelId || span.toolName || span.spanType,
      input: span.input ?? "",
      output: span.output ?? "",
      latencyMs: Number(span.latencyMs) || 0,
      costUsd: Number(span.costUsd) || 0,
      inputTokens: Number(span.inputTokens) || 0,
      outputTokens: Number(span.outputTokens) || 0,
      errorMessage: span.errorMessage ?? "",
      createdAt: span.createdAt,
    }));
  } catch {
    unavailable = true;
  }

  return (
    <SharedTraceView
      run={{
        runId: shared.runId,
        status: shared.status,
        spanCount: shared.spanCount,
        totalCostUsd: shared.totalCostUsd,
        startedAt: shared.startedAt,
        finishedAt: shared.finishedAt ?? null,
        primaryModel: shared.primaryModel ?? null,
      }}
      spans={spans}
      unavailable={unavailable}
    />
  );
}
