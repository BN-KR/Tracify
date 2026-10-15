import { LandingPage } from "@/components/marketing/landing/landing-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { title: "Tracify | AI agent observability and evaluation", description: "Trace every decision, tool call, cost, quality signal, and deployment change in one debugging timeline.", url: "/", siteName: "Tracify", locale: "en_US", type: "website" },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <main id="main-content">
        <LandingPage />
      </main>
    </div>
  );
}
