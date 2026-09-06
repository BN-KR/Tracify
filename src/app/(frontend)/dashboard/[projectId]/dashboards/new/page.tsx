import { CapturedSurface } from "@/components/dashboard/captured-surface";
export default async function NewDashboardPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <CapturedSurface projectId={projectId} title="Create dashboard" description="Start a focused view of your Tracify telemetry." />; }
