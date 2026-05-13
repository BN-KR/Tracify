import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-[56px] flex items-center border-b border-border px-6 gap-4 bg-background z-10 sticky top-0">
            <SidebarTrigger />
            <div className="font-mono text-sm text-white flex-1">
              Overview
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
