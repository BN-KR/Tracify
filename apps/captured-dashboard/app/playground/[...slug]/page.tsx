import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SandboxWorkspace } from "../../../components/sandbox-workspace";
import { isKnownPlaygroundRoute } from "../../../features/dashboard-workspace/route-map";

export default async function PlaygroundNestedPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug[0] || !isKnownPlaygroundRoute(slug[0])) notFound();
  return <Suspense fallback={null}><SandboxWorkspace segments={slug} /></Suspense>;
}
