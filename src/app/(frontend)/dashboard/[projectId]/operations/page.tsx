import { redirect } from "next/navigation";

export default async function OperationsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/sessions`);
}
