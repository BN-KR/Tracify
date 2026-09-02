export const CONSENT_VERSION = "2026-09-02";
export type ConsentState = { version: string; analytics: boolean; marketing: boolean };
export const CONSENT_KEY = "tracify.consent";
// Analytics is enabled by default for a frictionless product experience. Users
// can reject it from the banner or reopen preferences from the privacy footer.
export const defaultConsent: ConsentState = { version: CONSENT_VERSION, analytics: true, marketing: false };

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return defaultConsent;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CONSENT_KEY) || "null") as Partial<ConsentState> | null;
    if (!parsed || parsed.version !== CONSENT_VERSION) return defaultConsent;
    return { version: CONSENT_VERSION, analytics: parsed.analytics === true, marketing: parsed.marketing === true };
  } catch { return defaultConsent; }
}

export function writeConsent(value: Omit<ConsentState, "version">) {
  const next = { version: CONSENT_VERSION, ...value };
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("tracify:consent", { detail: next }));
  return next;
}
