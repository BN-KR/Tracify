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
  // Selecting a region from a local marketing server must not jump to the live
  // regional host, or local sign-in lands on production. TRACIFY_LOCAL_CLOUD_ORIGIN
  // points at the locally running cloud host (see `npm run dev:cloud`).
  const localCloudOrigin =
    process.env.NODE_ENV !== "production" &&
    (request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1")
      ? (process.env.TRACIFY_LOCAL_CLOUD_ORIGIN ?? "http://localhost:4000")
      : null;
  const destination = new URL(next, localCloudOrigin ?? TRACIFY_REGIONS[regionId].origin);
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
