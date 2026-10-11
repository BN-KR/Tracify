import { LiveCapturedPrompts } from "@/components/dashboard/live-captured-prompts";

export default async function PromptsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ prompt?: string | string[] }>;
}) {
  const { projectId } = await params;
  const { prompt } = await searchParams;
  return <LiveCapturedPrompts projectId={projectId} initialPromptId={Array.isArray(prompt) ? prompt[0] : prompt} />;
}
