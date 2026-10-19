import { WidgetLibrary } from "@/components/dashboard/widgets/widget-library";

export default async function WidgetsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <WidgetLibrary projectId={projectId} />;
}
