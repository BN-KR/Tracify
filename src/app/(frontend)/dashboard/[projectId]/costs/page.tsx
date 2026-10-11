import { CostDashboard } from "@/components/dashboard/cost-dashboard";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function CostsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return (
    <CapturedWorkspace workspace={workspace} toolbarTitle="Costs" childrenOnly segments={["costs"]}>
      <CostDashboard projectId={projectId} />
    </CapturedWorkspace>
  );
}
