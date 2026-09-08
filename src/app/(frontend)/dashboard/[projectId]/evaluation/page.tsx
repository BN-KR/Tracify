import { redirect } from "next/navigation";

export default async function EvaluationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/evaluators`);
}
