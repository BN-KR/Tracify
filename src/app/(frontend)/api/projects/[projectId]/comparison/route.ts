import { NextRequest, NextResponse } from "next/server";
import { denyProjectAccess } from "@/lib/project-route-access";
import { resolveTraceFlowFilters, traceHistogram, traceStats } from "@/lib/tinybird";
import { parseTraceFilters } from "@/lib/trace-filters";

const DAY_MS = 86_400_000;
const PERIODS = [1, 7, 14, 30];

/** The selected period and the period right before it, with the same stats and chart buckets for both. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const denied = await denyProjectAccess(request, projectId);
  if (denied) return denied;

  const requested = Number(request.nextUrl.searchParams.get("days"));
  const days = PERIODS.includes(requested) ? requested : 7;
  const now = Date.now();
  const windows = {
    current: { from: now - days * DAY_MS, to: now },
    previous: { from: now - 2 * days * DAY_MS, to: now - days * DAY_MS },
  };
  try {
    const entries = await Promise.all(
      (Object.entries(windows) as Array<[keyof typeof windows, { from: number; to: number }]>).map(async ([key, window]) => {
        const query = new URLSearchParams({ from: String(window.from), to: String(window.to) });
        const filters = await resolveTraceFlowFilters(projectId, parseTraceFilters(query, window.to));
        const [stats, histogram] = await Promise.all([traceStats(projectId, filters), traceHistogram(projectId, filters)]);
        return [key, { ...window, stats, histogram }] as const;
      }),
    );
    return NextResponse.json({ days, ...Object.fromEntries(entries) });
  } catch (error) {
    console.error("Comparison failed:", error);
    return NextResponse.json({ error: "Comparison data is temporarily unavailable. Try again in a moment." }, { status: 503 });
  }
}
