import { notFound } from "next/navigation";
import { TracifyOperationsPreview } from "@/components/dashboard/tracify-operations-preview";

export default function OperationsPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TracifyOperationsPreview />;
}
