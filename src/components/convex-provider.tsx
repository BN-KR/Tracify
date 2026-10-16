"use client";

import { ConvexBetterAuthProvider, type AuthClient } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthIdentityProvider } from "@/components/auth/auth-identity";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

// Auth and marketing routes do not need Convex. Avoid constructing a client
// with an empty address so those routes remain usable when local/preview
// environment variables are not configured yet.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// posthog-js is large and only needed once someone has consented and signed in,
// so it loads on demand instead of inside every page bundle.
const loadPostHog = () => import("posthog-js").then((module) => module.default);

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

function PostHogIdentity() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    const handleConsent = (event: Event) => {
      if (!(event as CustomEvent<{ analytics: boolean }>).detail.analytics) {
        void loadPostHog().then((posthog) => posthog.reset());
        identifiedUserId.current = null;
      }
    };
    window.addEventListener(CONSENT_EVENT, handleConsent);
    if (isPending || !isPostHogConfigured || !readConsent().analytics) {
      return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
    }

    if (!user) {
      if (identifiedUserId.current) {
        void loadPostHog().then((posthog) => posthog.reset());
        identifiedUserId.current = null;
      }
      return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
    }

    const switchedUser = Boolean(identifiedUserId.current && identifiedUserId.current !== user.id);
    void loadPostHog().then((posthog) => {
      if (switchedUser) posthog.reset();
      posthog.identify(user.id, {
        ...(user.email ? { email: user.email } : {}),
        ...(user.name ? { name: user.name } : {}),
      });
    });
    identifiedUserId.current = user.id;
    return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
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
      <AuthIdentityProvider initialToken={initialToken}>
        <PostHogIdentity />
        {children}
      </AuthIdentityProvider>
    </ConvexBetterAuthProvider>
  );
}
