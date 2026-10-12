import { TracingExplorer } from "@/components/dashboard/tracing/tracing-explorer";

export default async function TracingPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { projectId } = await params;
  const raw = await searchParams;
  const initialQuery = Object.fromEntries(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" && value ? [[key, value.slice(0, 200)]] : [])),
  );
  return <TracingExplorer projectId={projectId} initialQuery={initialQuery} />;
}
