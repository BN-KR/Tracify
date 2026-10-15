import { NextRequest, NextResponse } from "next/server";
import { denyProjectAccess } from "@/lib/project-route-access";
import { parseTraceFilters } from "@/lib/trace-filters";
import {
  resolveTraceFlowFilters,
  traceSteps,
  validStepSort,
} from "@/lib/tinybird";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const denied = await denyProjectAccess(request, projectId);
  if (denied) return denied;
  try {
    const parsed = parseTraceFilters(request.nextUrl.searchParams);
    const filters = await resolveTraceFlowFilters(projectId, {
      ...parsed,
      sort: validStepSort(request.nextUrl.searchParams.get("sort")),
    });
    return NextResponse.json(
      await traceSteps(
        projectId,
        filters,
        request.nextUrl.searchParams.get("groupBy") === "step",
        request.nextUrl.searchParams.get("facets") === "1",
      ),
    );
  } catch (error) {
    console.error("Step list failed", error);
    return NextResponse.json(
      { error: "Steps are temporarily unavailable. Try again." },
      { status: 503 },
    );
  }
}
