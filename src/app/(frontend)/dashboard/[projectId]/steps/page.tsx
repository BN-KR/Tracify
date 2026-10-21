import { redirect } from "next/navigation";
export default async function StepsPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; redirect(`/dashboard/${projectId}/tracing`); }
