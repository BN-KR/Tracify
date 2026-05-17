import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getCostByModel, getDailyCosts } from "@/lib/tinybird";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const daysParam = req.nextUrl.searchParams.get("days");
  const days = daysParam ? parseInt(daysParam, 10) : 30;

  try {
    const [dailyCosts, modelCosts] = await Promise.all([
      getDailyCosts(projectId, days),
      getCostByModel(projectId, days),
    ]);

    return NextResponse.json({ dailyCosts, modelCosts });
  } catch (error) {
    console.error("Failed to fetch dashboard stats from Tinybird:", error);
    return NextResponse.json({
      dailyCosts: [],
      modelCosts: [],
      unavailable: true,
    });
  }
}
