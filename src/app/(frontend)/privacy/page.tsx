import type { Metadata } from "next";
import { LegalDocument } from "@/components/reading/legal-document";

export const metadata: Metadata = { title: "Privacy policy", description: "Tracify privacy policy and information about how we handle data.", alternates: { canonical: "/privacy" } };

const sections = [
  { id: "overview", title: "Overview", body: "This policy explains how Tracify collects, uses, and safeguards information when you use the agent observability platform.", bullets: [] },
  { id: "collection", title: "Collection", body: "We collect information you provide directly and technical data generated through use of the platform.", bullets: ["Account information such as name, email, and organization.", "Telemetry sent through the SDK, including spans, tool calls, and model logs.", "Usage data such as browser type and platform interaction."] },
  { id: "use", title: "Use", body: "Collected data is used to provide, maintain, protect, and improve the service. Product analytics is enabled by default and can be rejected or changed at any time through the privacy preferences control. Marketing cookies and marketing scripts are not currently used.", bullets: ["Process and visualize agent telemetry.", "Provide cost and performance analytics.", "Send requested system alerts and notifications."] },
  { id: "protection", title: "Protection", body: "Telemetry is encrypted in transit and at rest. Access is limited to authorized people and systems needed to provide the service.", bullets: [] },
  { id: "data-residency", title: "Data residency", body: "For the EU region, account data, traces, and cache are stored in Ireland. Inngest Cloud currently processes queued span events in the United States, so the EU region is not end-to-end EU-resident.", bullets: ["Span input and output are redacted before being sent to the US event-processing provider.", "Stripe processes billing and payment information as a separate payment provider; Tracify does not store full card numbers.", "Redis and the EU application data services are operated in the documented EU region."] },
  { id: "control", title: "Control", body: "You can accept, reject, or change optional analytics preferences at any time through the privacy preferences control or the cookie policy. Questions and privacy requests can be sent directly to privacy@tracify.tech.", bullets: [] },
] as const;

export default function PrivacyPage() {
  return (
    <LegalDocument
      current="/privacy"
      eyebrow="Privacy policy"
      title="What enters. What stays. What leaves."
      description="How Tracify handles the information that passes through it, in the order it happens."
      updated="16 May 2026"
      summary="We collect your account details and the traces your SDK sends, use them only to run and improve Tracify, encrypt them, and let you control optional analytics at any time."
      sections={sections}
      contact={{ label: "Privacy questions", title: "Ask us anything about your data.", href: "mailto:privacy@tracify.tech", action: "privacy@tracify.tech" }}
    />
  );
}
