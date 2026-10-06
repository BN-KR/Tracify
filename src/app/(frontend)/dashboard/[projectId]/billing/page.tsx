import { BillingPlan } from "@/components/dashboard/billing-plan";
import { IngestQuotaCard } from "@/components/dashboard/ingest-quota-card";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return <CapturedWorkspace workspace={workspace} childrenOnly segments={["settings"]}><div className="captured-route-stack"><IngestQuotaCard projectId={projectId} /><BillingPlan projectId={projectId} /></div></CapturedWorkspace>;
}
