import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
export default async function SettingsApiKeysPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <div><DashboardTopbar title="API Keys" description="Create and rotate keys for sending telemetry to Tracify." /><div className="p-6"><ApiKeysManager projectId={projectId} /></div></div>; }
