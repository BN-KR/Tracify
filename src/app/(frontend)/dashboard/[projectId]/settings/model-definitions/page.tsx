import { redirect } from "next/navigation";

export default async function ModelDefinitionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/settings?tab=Model%20Definitions`);
}
