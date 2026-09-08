import { TracifyEmptyOverview } from "@/components/dashboard/tracify-empty-overview";

export function ProjectDashboardContent({ projectId }: { projectId: string }) {
  // The capture-faithful Home surface already handles both empty and populated
  // projects through the live Tracify data adapters. Keeping one renderer here
  // prevents a first trace from switching the customer into a different design.
  return <TracifyEmptyOverview projectId={projectId} liveData />;
}
