import { NextResponse } from "next/server";
import { demoSpans } from "@/lib/demo/demo-project";

export async function GET(_request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const found = demoSpans(runId);
  if (!found) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  const spans = found.spans.map(({ startMs, ...span }) => { void startMs; return span; });
  return NextResponse.json({ spans, meta: { source: "demo", cacheStatus: "fresh", reason: null, updatedAt: Date.now(), ageMs: 0 } });
}
