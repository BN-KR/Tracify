import { LandingPage } from "@/components/marketing/landing/landing-page";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <div className="min-h-screen bg-[#eceae3] pt-[54px] text-black">
      <main id="main-content">
        <LandingPage />
      </main>
    </div>
  );
}
