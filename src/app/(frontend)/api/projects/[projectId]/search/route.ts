import { isAuthenticated } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { getAuthedConvexClient } from "@/lib/convex-server";
import { searchTraces, type TraceSearchFilters } from "@/lib/tinybird";

function optionalNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const convex = await getAuthedConvexClient();
  const project = await convex.query(api.projects.getProjectById, {
    projectId: projectId as Id<"projects">,
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const filters: TraceSearchFilters = {
    query: searchParams.get("q") || undefined,
    sessionId: searchParams.get("sessionId") || undefined,
    endUserId: searchParams.get("endUserId") || undefined,
    environment: searchParams.get("environment") || undefined,
    release: searchParams.get("release") || undefined,
    modelId: searchParams.get("modelId") || undefined,
    tag: searchParams.get("tag") || undefined,
    status: status === "error" || status === "healthy" ? status : "all",
    minCostUsd: optionalNumber(searchParams.get("minCostUsd")),
    minLatencyMs: optionalNumber(searchParams.get("minLatencyMs")),
    days: optionalNumber(searchParams.get("days")),
    limit: optionalNumber(searchParams.get("limit")),
  };

  try {
    return NextResponse.json({ results: await searchTraces(projectId, filters) });
  } catch (error) {
    console.error("Trace search failed:", error);
    return NextResponse.json({ results: [], unavailable: true }, { status: 200 });
  }
}
