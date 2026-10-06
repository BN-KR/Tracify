import { SandboxWorkspace } from "@/features/dashboard-workspace/components/sandbox-workspace";

export default async function PlaygroundNestedPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <SandboxWorkspace segments={slug} />;
}
