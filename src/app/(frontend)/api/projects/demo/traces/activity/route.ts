import { NextRequest, NextResponse } from "next/server";
import { demoActivity } from "@/lib/demo/demo-queries";
import { parseTraceFilters } from "@/lib/trace-filters";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  return NextResponse.json({ days: demoActivity(parseTraceFilters(search), search.get("tz") ?? "UTC") });
}
