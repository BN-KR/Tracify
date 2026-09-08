import { redirect } from "next/navigation";

export default async function SearchPage({ params, searchParams }: { params: Promise<{ projectId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { projectId } = await params;
  const query = await searchParams;
  const suffix = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== undefined) suffix.set(key, Array.isArray(value) ? value[0] : value);
  redirect(`/dashboard/${projectId}/tracing${suffix.toString() ? `?${suffix}` : ""}`);
}
