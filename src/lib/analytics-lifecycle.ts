import type { ConsentState } from "./consent";

export function createAnalyticsLifecycle(operations: { initialize: () => void; optIn: () => void; optOut: () => void }) {
  let initialized = false;
  return { apply(consent: Pick<ConsentState, "analytics">) { if (consent.analytics) { if (!initialized) { operations.initialize(); initialized = true; } operations.optIn(); } else if (initialized) operations.optOut(); } };
}
