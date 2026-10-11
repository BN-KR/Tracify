import type { Metadata } from "next";
import { ProjectDashboardContent } from "@/components/dashboard/project-dashboard-content";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectDashboardContent projectId={projectId} />;
}
