import type { Metadata } from "next";
import { DemoShell } from "@/components/demo/demo-shell";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { ...noIndex, title: "Demo project" };

export default function DemoProjectLayout({ children }: { children: React.ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}
