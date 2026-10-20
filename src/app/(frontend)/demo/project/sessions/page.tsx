import { GroupExplorer } from "@/components/dashboard/groups/group-explorer";
import { DEMO_BASE_PATH, DEMO_PROJECT_ID } from "@/lib/demo/demo-config";

export default async function DemoSessionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const initialQuery = Object.fromEntries(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" && value ? [[key, value.slice(0, key === "q" || key === "id" ? 200 : 4096)]] : [])),
  );
  return <GroupExplorer projectId={DEMO_PROJECT_ID} kind="session" initialQuery={initialQuery} basePath={DEMO_BASE_PATH} />;
}
