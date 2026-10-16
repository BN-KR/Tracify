import { ComparisonsExplorer } from "@/components/dashboard/comparisons/comparisons-explorer";

export const metadata = { title: "Comparisons" };

export default async function ComparisonsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ComparisonsExplorer projectId={projectId} />;
}
