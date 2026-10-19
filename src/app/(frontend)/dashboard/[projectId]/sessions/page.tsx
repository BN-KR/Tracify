import { GroupExplorer } from "@/components/dashboard/groups/group-explorer";

export default async function SessionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { projectId } = await params;
  const raw = await searchParams;
  const initialQuery = Object.fromEntries(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" && value ? [[key, value.slice(0, key === "q" || key === "id" ? 200 : 4096)]] : [])),
  );
  return <GroupExplorer projectId={projectId} kind="session" initialQuery={initialQuery} />;
}
