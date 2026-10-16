import { NextRequest, NextResponse } from "next/server";
import { demoErrorGroups, demoFacets, demoFilter, demoHistogram, demoList, demoStats } from "@/lib/demo/demo-queries";
import { facetValues, parseTraceFilters } from "@/lib/trace-filters";

// The public demo project. A literal "demo" folder wins over [projectId], so these routes never reach the
// signed-in versions and never read a database: they answer from the generated sample data.
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const filters = parseTraceFilters(search);
  const runs = demoFilter(filters);
  return NextResponse.json({
    ...demoList(runs, filters, { extras: facetValues(search.get("extras")), meta: facetValues(search.get("meta")) }),
    histogram: demoHistogram(runs, filters),
    stats: demoStats(runs),
    facets: search.get("facets") === "1" ? demoFacets(filters) : null,
    errorGroups: search.get("errors") === "1" ? demoErrorGroups(runs) : null,
    range: { from: filters.fromMs, to: filters.toMs },
  });
}
