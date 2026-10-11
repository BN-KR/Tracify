import type { Metadata } from "next";
import { CapturedShell } from "../../components/captured-shell";

export const metadata: Metadata = {
  title: "Sandbox",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <CapturedShell>{children}</CapturedShell>;
}
