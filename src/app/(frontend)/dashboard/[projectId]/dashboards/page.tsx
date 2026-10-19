import { DashboardsWorkspace } from "@/components/dashboard/widgets/dashboards-workspace";

export default async function DashboardsPage({ params, searchParams }: { params: Promise<{ projectId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { projectId } = await params;
  const { d } = await searchParams;
  return <DashboardsWorkspace projectId={projectId} initialDashboard={typeof d === "string" ? d.slice(0, 100) : undefined} />;
}
