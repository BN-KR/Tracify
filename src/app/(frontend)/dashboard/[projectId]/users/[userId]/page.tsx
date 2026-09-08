import { LiveCapturedUsers } from "@/components/dashboard/live-captured-users";

export default async function UserDetailPage({ params }: { params: Promise<{ projectId: string; userId: string }> }) {
  const { projectId, userId } = await params;
  return <LiveCapturedUsers projectId={projectId} userId={decodeURIComponent(userId)} />;
}
