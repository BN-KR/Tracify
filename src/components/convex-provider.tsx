"use client";

import { ConvexBetterAuthProvider, type AuthClient } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";

// Auth and marketing routes do not need Convex. Avoid constructing a client
// with an empty address so those routes remain usable when local/preview
// environment variables are not configured yet.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient as unknown as AuthClient} initialToken={initialToken}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
