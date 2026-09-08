import { LiveCapturedPrompts } from "@/components/dashboard/live-captured-prompts";

export default async function PromptsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LiveCapturedPrompts projectId={projectId} />;
}
