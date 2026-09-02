import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { PromptManagement } from "@/components/dashboard/prompt-management";
export default function Page() { return <div><DashboardTopbar title="Prompt Management" /><div className="p-6"><PromptManagement projectId="" /></div></div>; }
