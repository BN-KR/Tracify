import { CapturedSurface } from "@/components/dashboard/captured-surface";
export default async function ScoresAnalyticsPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <CapturedSurface projectId={projectId} title="Scores analytics" description="Analyze score distributions and quality trends over time." />; }
