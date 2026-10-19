import { ReviewDeck } from "@/components/dashboard/labelling/review-deck";

export default async function AnnotationQueuesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ReviewDeck projectId={projectId} />;
}
