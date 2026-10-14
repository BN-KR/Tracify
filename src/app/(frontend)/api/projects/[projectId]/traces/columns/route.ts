import { NextRequest, NextResponse } from "next/server";
import { denyProjectAccess } from "@/lib/project-route-access";
import { traceMetadataKeys } from "@/lib/tinybird";
import { parseTraceFilters } from "@/lib/trace-filters";

/** Metadata keys seen in the range, for the list's optional metadata columns. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const denied = await denyProjectAccess(request, projectId);
  if (denied) return denied;

  const { fromMs, toMs } = parseTraceFilters(request.nextUrl.searchParams);
  try {
    return NextResponse.json({ metadata: await traceMetadataKeys(projectId, { fromMs, toMs }) });
  } catch (error) {
    console.error("Trace column keys failed:", error);
    return NextResponse.json({ error: "Column data is temporarily unavailable. Try again in a moment." }, { status: 503 });
  }
}
