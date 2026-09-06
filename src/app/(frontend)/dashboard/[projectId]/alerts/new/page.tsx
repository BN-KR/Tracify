import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { CreateAlertForm } from "@/components/dashboard/create-alert-form";
export default async function NewAlertPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <div><DashboardTopbar title="Create alert" description="Set a threshold for the signals that matter to your team." /><div className="p-6"><CreateAlertForm projectId={projectId} /></div></div>; }
