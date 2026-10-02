import { AmoledHomepage } from "@/components/marketing/amoled-homepage";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black pt-[54px] text-white">
      <main id="main-content">
        <AmoledHomepage />
      </main>
    </div>
  );
}
