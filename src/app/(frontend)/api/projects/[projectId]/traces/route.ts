import { NextRequest, NextResponse } from "next/server";
import { denyProjectAccess } from "@/lib/project-route-access";
import { listTraces, traceErrorGroups, traceFilterOptions, traceHistogram, traceStats } from "@/lib/tinybird";
import { parseTraceFilters } from "@/lib/trace-filters";


export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  // The list polls every few seconds; skip the Convex token and access round trips after a recent success.
  const denied = await denyProjectAccess(request, projectId);
  if (denied) return denied;

  const filters = parseTraceFilters(request.nextUrl.searchParams);
  const search = request.nextUrl.searchParams;
  try {
    const [list, histogram, stats, options, errorGroups] = await Promise.all([
      listTraces(projectId, filters),
      traceHistogram(projectId, filters),
      traceStats(projectId, filters),
      search.get("options") === "1" ? traceFilterOptions(projectId, filters.fromMs, filters.toMs) : null,
      search.get("errors") === "1" ? traceErrorGroups(projectId, filters) : null,
    ]);
    return NextResponse.json({ ...list, histogram, stats, options, errorGroups, range: { from: filters.fromMs, to: filters.toMs } });
  } catch (error) {
    console.error("Trace list failed:", error);
    return NextResponse.json({ error: "Trace data is temporarily unavailable. Try again in a moment." }, { status: 503 });
  }
}
