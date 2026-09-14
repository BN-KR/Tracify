import { ProjectExploreClient } from "@/components/dashboard/explore/project-explore-client";

export default async function ProjectExplorePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectExploreClient projectId={projectId} />;
}
