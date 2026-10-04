import { CostDashboard } from "@/components/dashboard/cost-dashboard";

export default async function CostsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <CostDashboard projectId={projectId} />;
}
