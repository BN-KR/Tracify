import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require a logged-in Clerk session
const isProtected = createRouteMatcher(["/dashboard(.*)", "/runs(.*)"]);

// Routes that bypass Clerk entirely — they use their own auth
const isPublicApi = createRouteMatcher(["/api/ingest(.*)", "/api/inngest(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApi(req)) return; // SDK + Inngest handle their own auth
  if (isProtected(req)) await auth.protect(); // redirect to sign-in if not authenticated
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
