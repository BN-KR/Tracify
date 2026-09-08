import { redirect } from "next/navigation";

export default async function ExportsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/settings?tab=${encodeURIComponent("Exports")}`);
}
