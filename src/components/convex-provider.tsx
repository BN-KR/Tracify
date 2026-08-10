"use client";

import { ConvexBetterAuthProvider, type AuthClient } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";

// Auth and marketing routes do not need Convex. Avoid constructing a client
// with an empty address so those routes remain usable when local/preview
// environment variables are not configured yet.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

function PostHogIdentity() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending || !isPostHogConfigured) return;

    if (!user) {
      if (identifiedUserId.current) {
        posthog.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current && identifiedUserId.current !== user.id) {
      posthog.reset();
    }

    posthog.identify(user.id, {
      ...(user.email ? { email: user.email } : {}),
      ...(user.name ? { name: user.name } : {}),
    });
    identifiedUserId.current = user.id;
  }, [isPending, user]);

  return null;
}

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
      <PostHogIdentity />
      {children}
    </ConvexBetterAuthProvider>
  );
}
