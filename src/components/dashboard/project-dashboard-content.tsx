import { LiveCapturedHome } from "@/components/dashboard/live-captured-home";

export function ProjectDashboardContent({ projectId }: { projectId: string }) {
  return <LiveCapturedHome projectId={projectId} />;
}
