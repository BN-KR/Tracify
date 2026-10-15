import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = noIndex;

export default function NoIndexLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
