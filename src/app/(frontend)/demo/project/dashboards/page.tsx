import { DemoDashboards } from "@/components/dashboard/widgets/demo-dashboards";
import { DEMO_BASE_PATH, DEMO_PROJECT_ID } from "@/lib/demo/demo-config";

export default function DemoDashboardsPage() {
  return <DemoDashboards projectId={DEMO_PROJECT_ID} basePath={DEMO_BASE_PATH} />;
}
