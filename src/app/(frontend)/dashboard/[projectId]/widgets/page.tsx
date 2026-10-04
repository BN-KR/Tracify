import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { WidgetLibrary } from "@/components/dashboard/widget-library";

export default async function WidgetsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Widget library" description="Create reusable dashboard widgets from project telemetry." />
      <div className="px-6 pb-10"><WidgetLibrary projectId={projectId} /></div>
    </div>
  );
}
