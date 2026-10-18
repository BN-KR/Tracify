import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { ProjectRouteGate } from "@/components/dashboard/project-route-gate";

export default async function ProjectDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <ProjectRouteGate projectId={projectId}>
      <UpgradeBanner projectId={projectId} />
      {children}
    </ProjectRouteGate>
  );
}
