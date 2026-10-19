import { PlaygroundWorkspace } from "@/components/dashboard/prompts/playground-workspace";
import { DEMO_PROJECT_ID } from "@/lib/demo/demo-config";

export default async function DemoPlaygroundPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const prompt = typeof raw.prompt === "string" ? raw.prompt.slice(0, 100) : undefined;
  const version = typeof raw.version === "string" && /^\d{1,6}$/.test(raw.version) ? Number(raw.version) : undefined;
  return <PlaygroundWorkspace demo projectId={DEMO_PROJECT_ID} initialPrompt={prompt} initialVersion={version} />;
}
