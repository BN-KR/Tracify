import { NextRequest, NextResponse } from "next/server";
import { getOrchestrationSavings } from "@/lib/tinybird";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  const days = Number(request.nextUrl.searchParams.get("days") ?? "30");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const savings = await getOrchestrationSavings(projectId, days);
    return NextResponse.json(savings);
  } catch (error) {
    console.error("Orchestration savings query failed:", error);
    return NextResponse.json(
      { error: "Failed to query orchestration savings" },
      { status: 500 }
    );
  }
}
