import posthog from "posthog-js";
import { CONSENT_EVENT, readConsent } from "./src/lib/consent";
import { createAnalyticsLifecycle } from "./src/lib/analytics-lifecycle";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken || !host) {
  if (process.env.NODE_ENV === "development") {
    const missingVariable = !projectToken
      ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
      : "NEXT_PUBLIC_POSTHOG_HOST";

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
  }
}

if (typeof window !== "undefined" && projectToken && host) {
  const lifecycle = createAnalyticsLifecycle({
    initialize: () => posthog.init(projectToken, { api_host: host, defaults: "2026-01-30", capture_exceptions: true, debug: process.env.NODE_ENV === "development" }),
    optIn: () => posthog.opt_in_capturing(),
    optOut: () => posthog.opt_out_capturing(),
  });
  lifecycle.apply(readConsent());
  window.addEventListener(CONSENT_EVENT, (event: Event) => {
    const detail = (event as CustomEvent<{ analytics: boolean }>).detail;
    lifecycle.apply(detail);
  });
}
