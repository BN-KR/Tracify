import { PlaygroundWorkspace } from "@/components/dashboard/prompts/playground-workspace";

export default async function PlaygroundPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { projectId } = await params;
  const raw = await searchParams;
  const prompt = typeof raw.prompt === "string" ? raw.prompt.slice(0, 100) : undefined;
  const version = typeof raw.version === "string" && /^\d{1,6}$/.test(raw.version) ? Number(raw.version) : undefined;
  return <PlaygroundWorkspace projectId={projectId} initialPrompt={prompt} initialVersion={version} />;
}
