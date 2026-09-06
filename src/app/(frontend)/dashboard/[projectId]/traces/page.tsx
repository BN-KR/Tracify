import { RunsTable } from "@/components/dashboard/runs-table";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
export default async function TracesPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <div className="flex flex-col gap-6"><DashboardTopbar title="Tracing" description="View and inspect the execution streams your agents produce." /><div className="px-6 pb-10"><RunsTable projectId={projectId} /></div></div>; }
