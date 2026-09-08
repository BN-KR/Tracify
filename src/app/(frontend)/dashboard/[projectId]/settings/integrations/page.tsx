import { redirect } from "next/navigation";

export default async function IntegrationsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/settings?tab=Integrations`);
}
