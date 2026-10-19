import { DatasetsWorkspace } from "@/components/dashboard/datasets/datasets-workspace";

export default async function DatasetsPage({ params, searchParams }: { params: Promise<{ projectId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { projectId } = await params;
  const { dataset } = await searchParams;
  return <DatasetsWorkspace projectId={projectId} initialDataset={typeof dataset === "string" ? dataset.slice(0, 100) : undefined} />;
}
