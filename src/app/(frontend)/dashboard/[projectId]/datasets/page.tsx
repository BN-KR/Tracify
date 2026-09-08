import { LiveCapturedEvaluation } from "@/components/dashboard/live-captured-evaluation";

export default async function DatasetsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <div>
      <LiveCapturedEvaluation projectId={projectId} section="datasets" />
    </div>
  );
}
