import { NextRequest, NextResponse } from "next/server";
import { demoCostStats } from "@/lib/demo/demo-queries";

// The public demo project's cost breakdowns, answered from the generated sample data (see the traces route).
export async function GET(request: NextRequest) {
  const days = Math.min(Math.max(Math.floor(Number(request.nextUrl.searchParams.get("days"))) || 30, 1), 90);
  return NextResponse.json(demoCostStats(days));
}
