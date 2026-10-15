import { LandingPage } from "@/components/marketing/landing/landing-page";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <main id="main-content">
        <LandingPage />
      </main>
    </div>
  );
}
