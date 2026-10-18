import { redirect } from "next/navigation";

// The old standalone explorer was a duplicate of the demo project's Tracing page.
export default function DemoExplorePage() {
  redirect("/demo/project/tracing");
}
