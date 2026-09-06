import posthog from "posthog-js";
import { readConsent } from "./consent";

export function captureAnalytics(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !readConsent().analytics) return;
  posthog.capture(event, properties);
}
