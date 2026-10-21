import { NextRequest, NextResponse } from "next/server";
import { denyProjectAccess } from "@/lib/project-route-access";
import { costBreakdown, resolveTraceFlowFilters } from "@/lib/tinybird";
import { parseTraceFilters } from "@/lib/trace-filters";

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  // The page polls every few seconds; skip the Convex round trips after a recent success.
  const denied = await denyProjectAccess(request, projectId);
  if (denied) return denied;
  try {
    const filters = await resolveTraceFlowFilters(projectId, parseTraceFilters(request.nextUrl.searchParams));
    return NextResponse.json(await costBreakdown(projectId, filters));
  } catch (error) {
    console.error("Cost breakdown failed:", error);
    return NextResponse.json({ error: "Cost data is temporarily unavailable. Try again in a moment." }, { status: 503 });
  }
}
