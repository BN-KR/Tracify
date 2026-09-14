import { WireframeHomepage } from "@/components/marketing/wireframe-homepage";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eceae3] pt-[54px] text-black">
      <main id="main-content">
        <WireframeHomepage />
      </main>
    </div>
  );
}
