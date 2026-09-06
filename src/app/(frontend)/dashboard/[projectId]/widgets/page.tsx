import { CapturedSurface } from "@/components/dashboard/captured-surface";
export default async function WidgetsPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <CapturedSurface projectId={projectId} title="Widget library" description="Create reusable dashboard widgets from project telemetry." />; }
