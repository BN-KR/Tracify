import { redirect } from "next/navigation";

/** Old user links keep working: the user opens in the list's detail panel. */
export default async function UserDetailPage({ params }: { params: Promise<{ projectId: string; userId: string }> }) {
  const { projectId, userId } = await params;
  redirect(`/dashboard/${projectId}/users?id=${encodeURIComponent(decodeURIComponent(userId))}`);
}
