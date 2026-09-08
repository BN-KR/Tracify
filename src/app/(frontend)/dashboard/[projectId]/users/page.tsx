import { LiveCapturedUsers } from "@/components/dashboard/live-captured-users";

export default async function UsersPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LiveCapturedUsers projectId={projectId} />;
}
