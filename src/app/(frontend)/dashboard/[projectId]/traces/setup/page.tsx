import { CapturedSurface } from "@/components/dashboard/captured-surface";
export default async function TracingSetupPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <CapturedSurface projectId={projectId} title="Configure tracing" description="Connect your SDK and send your first Tracify trace." />; }
