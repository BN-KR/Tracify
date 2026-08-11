import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ReviewQueue } from "@/components/dashboard/review-queue";

export default async function ReviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Annotation Queue" description="Turn production edge cases into reviewed labels and evaluation evidence." /><div className="p-6"><ReviewQueue projectId={projectId} /></div></div>;
}
