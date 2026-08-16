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
];

function isCloudAppPath(pathname: string) {
  return CLOUD_APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const deploymentKind = process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND ?? "marketing";
  const { pathname, search } = request.nextUrl;

  if (deploymentKind === "cloud" && !isCloudAppPath(pathname) && !pathname.startsWith("/api/")) {
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
