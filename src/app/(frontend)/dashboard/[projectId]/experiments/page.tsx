import { ExperimentsWorkspace } from "@/components/dashboard/experiments/experiments-workspace";

export default async function ExperimentsPage({ params, searchParams }: { params: Promise<{ projectId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { projectId } = await params;
  const raw = await searchParams;
  const initialQuery = Object.fromEntries(Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" && value ? [[key, value.slice(0, 200)]] : [])));
  return <ExperimentsWorkspace projectId={projectId} initialQuery={initialQuery} />;
}
