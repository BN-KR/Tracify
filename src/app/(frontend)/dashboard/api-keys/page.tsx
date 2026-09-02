import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";
export default function Page() { return <div><DashboardTopbar title="API Keys" /><div className="p-6"><ApiKeysManager projectId="" /></div></div>; }
