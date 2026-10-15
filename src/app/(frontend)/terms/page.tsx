import type { Metadata } from "next";
import { LegalDocument } from "@/components/reading/legal-document";

export const metadata: Metadata = { title: "Terms of service", description: "Tracify terms of service.", alternates: { canonical: "/terms" } };

const clauses = [
  { id: "acceptance", title: "Acceptance", body: "By accessing or using Tracify, you agree to these Terms of Service and applicable laws. If you do not agree, you may not use the service." },
  { id: "use-license", title: "Use license", body: "You may use the platform for agent observability. You may not reverse engineer the service, remove proprietary notices, violate applicable law, or exceed the limits of your plan." },
  { id: "disclaimer", title: "Disclaimer", body: "Tracify is provided on an 'as is' basis without implied warranties of merchantability, fitness for a particular purpose, or non-infringement." },
  { id: "limitations", title: "Limitations", body: "To the extent permitted by law, Tracify and its suppliers are not liable for indirect damages, loss of data, profit, or business interruption arising from use of the service." },
  { id: "governing-law", title: "Governing law", body: "These terms are governed by the laws of the jurisdiction in which Tracify operates, subject to the courts with applicable jurisdiction." },
] as const;

export default function TermsPage() {
  return (
    <LegalDocument
      current="/terms"
      eyebrow="Terms of service"
      title="The rules of the relationship."
      description="The ground rules for using Tracify, written to be read."
      updated="16 May 2026"
      summary="Use Tracify to observe your agents, stay within your plan and the law, and know the service is provided as it is."
      sections={clauses}
    />
  );
}
