import { redirect } from "next/navigation";

export default async function NewDashboardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/dashboards?view=create`);
}
