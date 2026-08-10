import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DocsViewer } from "@/components/dashboard/docs-viewer";

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Documentation" description="SDK Reference & Quickstart" />
      <div className="px-6 pb-10">
        <DocsViewer />
      </div>
    </div>
  );
}
