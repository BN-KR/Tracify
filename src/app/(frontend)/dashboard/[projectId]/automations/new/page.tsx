import { CapturedSurface } from "@/components/dashboard/captured-surface";
export default async function NewAutomationPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <CapturedSurface projectId={projectId} title="Create automation" description="Define an event source, action, and destination." />; }
