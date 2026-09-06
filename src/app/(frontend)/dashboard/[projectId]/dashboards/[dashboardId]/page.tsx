import { TracifyEmptyOverview } from "@/components/dashboard/tracify-empty-overview";
export default async function DashboardDetailPage({ params }: { params: Promise<{ projectId: string; dashboardId: string }> }) { const { projectId } = await params; return <div className="px-6 pb-10"><TracifyEmptyOverview projectId={projectId} dashboardMode liveData /></div>; }
