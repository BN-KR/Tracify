import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SandboxWorkspace } from "../../../components/sandbox-workspace";
import { SURFACE_LABELS, isKnownPlaygroundRoute, normalizePlaygroundSegment } from "../../../features/dashboard-workspace/route-map";
import { WorkspaceLoadingState } from "../../../features/dashboard-workspace/captured-workspace";

type NestedPageProps = { params: Promise<{ slug?: string[] }> };

function parseSegments(slug: string[] | undefined) {
  return (slug ?? []).filter(Boolean);
}

export async function generateMetadata({ params }: NestedPageProps): Promise<Metadata> {
  const { slug } = await params;
  const segments = parseSegments(slug);
  const surface = segments[0] ? normalizePlaygroundSegment(segments[0]) : "home";
  if (!surface) return {};
  return { title: SURFACE_LABELS[surface] };
}

export default async function PlaygroundNestedPage({ params }: NestedPageProps) {
  const { slug } = await params;
  const segments = parseSegments(slug);
  if (!segments[0] || !isKnownPlaygroundRoute(segments[0])) notFound();
  return <Suspense fallback={<WorkspaceLoadingState />}><SandboxWorkspace segments={segments} /></Suspense>;
}
