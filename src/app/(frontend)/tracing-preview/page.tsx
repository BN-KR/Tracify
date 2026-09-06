import { notFound } from "next/navigation";
import { TracifyTracingPreview } from "@/components/dashboard/tracify-tracing-preview";

export default function TracingPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TracifyTracingPreview />;
}
