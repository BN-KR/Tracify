import { NextRequest, NextResponse } from "next/server";
import { denyProjectAccess } from "@/lib/project-route-access";
import { MAP_EDGE_LIMIT, MAP_NODE_LIMIT, traceAgentMap } from "@/lib/tinybird";
import { parseTraceFilters } from "@/lib/trace-filters";

/** Aggregate agent map (tools and models, and which ran after which) for the Tracing page's current filters. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const denied = await denyProjectAccess(request, projectId);
  if (denied) return denied;

  const filters = parseTraceFilters(request.nextUrl.searchParams);
  try {
    const map = await traceAgentMap(projectId, filters);
    return NextResponse.json({ ...map, limits: { nodes: MAP_NODE_LIMIT, edges: MAP_EDGE_LIMIT }, range: { from: filters.fromMs, to: filters.toMs } });
  } catch (error) {
    console.error("Agent map failed:", error);
    return NextResponse.json({ error: "Map data is temporarily unavailable. Try again in a moment." }, { status: 503 });
  }
}
