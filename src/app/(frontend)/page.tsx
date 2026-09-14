import { DarkHomepage } from "@/components/marketing/dark-homepage";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#091b20] text-white">
      <main id="main-content">
        <DarkHomepage />
      </main>
    </div>
  );
}
