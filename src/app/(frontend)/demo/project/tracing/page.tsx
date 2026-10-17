import { TracingExplorer } from "@/components/dashboard/tracing/tracing-explorer";
import { DEMO_PROJECT_ID } from "@/lib/demo/demo-config";

export default async function DemoTracingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const initialQuery = Object.fromEntries(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" && value ? [[key, value.slice(0, key === "q" || key === "sort" ? 200 : 4096)]] : [])),
  );
  return <TracingExplorer projectId={DEMO_PROJECT_ID} initialQuery={initialQuery} />;
}
