import { ProjectOrchestration } from "@/components/dashboard/project-orchestration";

export default async function ControlPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectOrchestration projectId={projectId} />;
}
