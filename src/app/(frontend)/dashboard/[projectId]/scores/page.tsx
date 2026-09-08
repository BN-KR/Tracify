import { LiveCapturedEvaluation } from "@/components/dashboard/live-captured-evaluation";

export default async function ScoresPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LiveCapturedEvaluation projectId={projectId} section="scores" />;
}
