import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ReviewQueue } from "@/components/dashboard/review-queue";

export default async function HumanAnnotationRoute({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Human Annotation" description="Review production traces and capture labels for evaluation evidence." /><div className="p-6"><ReviewQueue projectId={projectId} /></div></div>;
}
