import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Interactive AI agent observability demo", description: "Explore a realistic Tracify project with traces, quality scores, cost signals, and release decisions.", path: "/demo" });

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
