import { NavigationSystemExplorations } from "@/components/marketing/navigation-system-explorations";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eceae3] pt-[54px] text-black">
      <main id="main-content">
        <NavigationSystemExplorations
          showIntroduction={false}
          showSectionLabels={false}
          showFooter={false}
        />
      </main>
    </div>
  );
}
