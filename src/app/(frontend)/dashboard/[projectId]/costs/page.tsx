import { CostsExplorer } from "@/components/dashboard/costs/costs-explorer";

export default async function CostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { projectId } = await params;
  const raw = await searchParams;
  const initialQuery = Object.fromEntries(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" && value ? [[key, value.slice(0, 4096)]] : [])),
  );
  return <CostsExplorer projectId={projectId} initialQuery={initialQuery} />;
}
