import { ConvexHttpClient } from "convex/browser";

// Server-side Convex client for use in Route Handlers and server actions.
// The browser client is used in Client Components via ConvexReactClient.
export function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}
