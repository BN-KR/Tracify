import { redirect } from "next/navigation";

export default async function NewAlertPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/alerts?view=create`);
}
