import { LiveCapturedAnnotations } from "@/components/dashboard/live-captured-annotations";
export default async function AnnotationQueuesPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <LiveCapturedAnnotations projectId={projectId} />; }
