import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default async function ApiKeysPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="API Keys"
        description="Manage security tokens for authenticating your agent runs."
      />

      <div className="px-6 pb-20">
        <ApiKeysManager projectId={projectId} />
      </div>
    </div>
  );
}
