import { type NextRequest, NextResponse } from "next/server";

import { TRACIFY_REGIONS } from "@/lib/regions";

const DEMO_PREFIX = "/demo";

function isDemoPath(pathname: string) {
  return pathname === DEMO_PREFIX || pathname.startsWith(`${DEMO_PREFIX}/`);
}

const CLOUD_APP_PREFIXES = [
  "/dashboard",
  "/dash",
  "/playground",
  "/onboarding",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
  "/share",
  "/pricing/checkout",
  "/auth/error",
  "/auth/callback",
  "/cloud/mode",
  "/demo",
];

function isCloudAppPath(pathname: string) {
  return CLOUD_APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * A cloud deployment sends non-app paths to the marketing host. That is correct in
 * production, but on a developer machine it bounces you straight out of localhost and
 * onto www.tracify.tech, so the site root can never be opened locally and the
 * marketing/cloud boundary cannot be exercised. Keep local requests local.
 */
function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".localhost");
}

export function proxy(request: NextRequest) {
  const deploymentKind = process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND ?? "marketing";
  const { pathname, search } = request.nextUrl;

  // The sample project is a sandbox that lives on the cloud site; "/demo" is just its front door.
  if (pathname === DEMO_PREFIX || pathname === `${DEMO_PREFIX}/`) {
    const target = isLocalHost(request.nextUrl.hostname) || deploymentKind === "cloud" ? request.url : TRACIFY_REGIONS.eu.origin;
    return NextResponse.redirect(new URL(`${DEMO_PREFIX}/project${search}`, target));
  }
  if (deploymentKind === "marketing" && isDemoPath(pathname) && !isLocalHost(request.nextUrl.hostname)) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, TRACIFY_REGIONS.eu.origin));
  }

  if (
    deploymentKind === "cloud" &&
    !isCloudAppPath(pathname) &&
    !pathname.startsWith("/api/") &&
    !isLocalHost(request.nextUrl.hostname)
  ) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, "https://www.tracify.tech"));
  }

  if (deploymentKind === "marketing" && isCloudAppPath(pathname) && !isLocalHost(request.nextUrl.hostname)) {
    const selector = new URL("/cloud", request.url);
    selector.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(selector);
  }

  const response = NextResponse.next();
  if (deploymentKind === "cloud") response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
