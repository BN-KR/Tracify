import { type NextRequest, NextResponse } from "next/server";

const CLOUD_APP_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
  "/auth/error",
  "/auth/callback",
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

  if (
    deploymentKind === "cloud" &&
    !isCloudAppPath(pathname) &&
    !pathname.startsWith("/api/") &&
    !isLocalHost(request.nextUrl.hostname)
  ) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, "https://www.tracify.tech"));
  }

  if (deploymentKind === "marketing" && isCloudAppPath(pathname)) {
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
