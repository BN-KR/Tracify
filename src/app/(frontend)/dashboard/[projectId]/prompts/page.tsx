import { PromptsWorkspace } from "@/components/dashboard/prompts/prompts-workspace";

export default async function PromptsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { projectId } = await params;
  const raw = await searchParams;
  const initialQuery = Object.fromEntries(Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" && value ? [[key, value.slice(0, 200)]] : [])));
  return <PromptsWorkspace projectId={projectId} initialQuery={initialQuery} />;
}
