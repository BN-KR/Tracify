import { type NextRequest, NextResponse } from "next/server";
import { isRegionAvailable, parseTracifyRegion, TRACIFY_REGION_COOKIE, TRACIFY_REGIONS } from "@/lib/regions";

export function GET(request: NextRequest) {
  const regionId = parseTracifyRegion(request.nextUrl.searchParams.get("region"));
  // Reject dormant regions here too, not just in the UI — otherwise a hand-typed
  // ?region=us would still set the cookie and redirect into a region that must not
  // take production traffic.
  if (!regionId || !isRegionAvailable(regionId)) {
    return NextResponse.redirect(new URL("/cloud", request.url));
  }

  const requestedNext = request.nextUrl.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/sign-in";
  const destination = new URL(next, TRACIFY_REGIONS[regionId].origin);
  const response = NextResponse.redirect(destination);
  response.cookies.set(TRACIFY_REGION_COOKIE, regionId, {
    domain: request.nextUrl.hostname.endsWith("tracify.tech") ? ".tracify.tech" : undefined,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
  });
  return response;
}
