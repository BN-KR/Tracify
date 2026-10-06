import { CapturedShell } from "../../components/captured-shell";

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <CapturedShell>{children}</CapturedShell>;
}
