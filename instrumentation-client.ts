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
  // posthog-js is ~300 KB. Loading it before hydration delays every page, so it
  // starts once the browser is idle. Consent is re-read when it arrives, so a
  // choice made in the meantime is still honoured.
  const start = async () => {
    const posthog = (await import("posthog-js")).default;
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
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(() => void start(), { timeout: 4000 });
  else setTimeout(() => void start(), 2000);
}
