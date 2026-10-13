import { isAuthenticated } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { accessKey, hasRecentAccess, rememberAccess } from "@/lib/access-cache";
import { getAuthedConvexClient } from "@/lib/convex-server";
import { listTraces, traceFilterOptions, traceHistogram, traceStats } from "@/lib/tinybird";
import { parseTraceFilters } from "@/lib/trace-filters";


export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  // The list polls every few seconds; skip the Convex token and access round trips after a recent success.
  const key = accessKey(request, "project", projectId);
  if (!hasRecentAccess(key)) {
    if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const convex = await getAuthedConvexClient();
    const project = await convex.query(api.projects.getProjectById, { projectId: projectId as Id<"projects"> });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    rememberAccess(key);
  }

  const filters = parseTraceFilters(request.nextUrl.searchParams);
  try {
    const [list, histogram, stats, options] = await Promise.all([
      listTraces(projectId, filters),
      traceHistogram(projectId, filters),
      traceStats(projectId, filters),
      request.nextUrl.searchParams.get("options") === "1" ? traceFilterOptions(projectId, filters.fromMs, filters.toMs) : null,
    ]);
    return NextResponse.json({ ...list, histogram, stats, options, range: { from: filters.fromMs, to: filters.toMs } });
  } catch (error) {
    console.error("Trace list failed:", error);
    return NextResponse.json({ error: "Trace data is temporarily unavailable. Try again in a moment." }, { status: 503 });
  }
}
