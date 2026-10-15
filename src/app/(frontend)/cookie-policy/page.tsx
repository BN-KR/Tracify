import type { Metadata } from "next";
import { LegalDocument } from "@/components/reading/legal-document";

export const metadata: Metadata = { title: "Cookie Policy", description: "How Tracify uses necessary storage and optional analytics.", alternates: { canonical: "/cookie-policy" } };

const sections = [
  { id: "overview", title: "What we store", body: "Tracify uses a small amount of necessary storage for authentication, security, and core application behavior. We use optional analytics to understand whether onboarding and product workflows are useful." },
  { id: "choices", title: "Your choices", body: "Analytics is enabled by default, but you can turn it off at any time using the privacy preferences control. Turning analytics off does not affect signup, trace ingestion, dashboards, or support." },
  { id: "analytics", title: "Analytics providers", body: "When analytics is enabled, Tracify uses Google Analytics 4, provided by Google LLC, to measure page views and understand site usage. Advertising storage and ad personalization remain disabled. Google Analytics is not loaded when analytics is rejected before page load, and withdrawing consent sends a denied analytics-storage signal." },
  { id: "necessary", title: "Necessary storage", body: "Authentication sessions, security controls, and saved application state may be required for Tracify to work. These cannot be disabled through the optional consent controls." },
] as const;

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      current="/cookie-policy"
      eyebrow="Cookie policy"
      title="Small storage. Your call."
      description="What Tracify keeps in your browser, and what you can switch off."
      updated="16 May 2026"
      summary="We keep only what login and security need. Analytics is optional and you can turn it off whenever you like without losing anything."
      sections={sections}
      contact={{ label: "More detail", title: "Read how we handle data overall.", href: "/privacy", action: "Privacy policy" }}
    />
  );
}
