import { NextRequest, NextResponse } from "next/server";
import { demoMetadataKeys } from "@/lib/demo/demo-queries";
import { parseTraceFilters } from "@/lib/trace-filters";

export async function GET(request: NextRequest) {
  const { fromMs, toMs } = parseTraceFilters(request.nextUrl.searchParams);
  return NextResponse.json({ metadata: demoMetadataKeys({ fromMs, toMs }) });
}
