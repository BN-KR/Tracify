import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getSpansForRun } from "@/lib/tinybird";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; runId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, runId } = await params;

  try {
    const spans = await getSpansForRun(runId, projectId);
    return NextResponse.json({ spans });
  } catch (error) {
    console.error("Failed to fetch spans from Tinybird:", error);
    return NextResponse.json(
      { error: "Failed to fetch spans" },
      { status: 500 },
    );
  }
}
