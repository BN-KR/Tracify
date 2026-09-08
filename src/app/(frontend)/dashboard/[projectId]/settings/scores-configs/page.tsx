import { redirect } from "next/navigation";

export default async function ScoresConfigsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/settings?tab=Scores`);
}
