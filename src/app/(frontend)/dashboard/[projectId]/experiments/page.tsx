import { LiveCapturedExperiments } from "@/components/dashboard/live-captured-experiments";

export default async function ExperimentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LiveCapturedExperiments projectId={projectId} />;
}
