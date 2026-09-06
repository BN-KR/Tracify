import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyScoreConfigs } from "@/components/dashboard/tracify-score-configs";

export default async function ScoresConfigsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Scores Configs" description="Configure score signals and evaluation thresholds." /><div className="px-6 pb-10"><TracifyScoreConfigs projectId={projectId} /></div></div>;
}
