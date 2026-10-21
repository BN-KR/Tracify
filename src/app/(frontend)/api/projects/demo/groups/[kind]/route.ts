import { NextRequest, NextResponse } from "next/server";
import { demoGroupDetail, demoGroups } from "@/lib/demo/demo-queries";
import { isGroupKind, parseGroupFilters } from "@/lib/group-filters";

// The public demo project's sessions and users, answered from the generated sample data (see the traces route).
export async function GET(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isGroupKind(kind)) return NextResponse.json({ error: "Unknown kind" }, { status: 404 });
  const id = request.nextUrl.searchParams.get("id");
  if (id) return NextResponse.json(demoGroupDetail(kind, id.slice(0, 200)));
  return NextResponse.json(demoGroups(kind, parseGroupFilters(request.nextUrl.searchParams)));
}
