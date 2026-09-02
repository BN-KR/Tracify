import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { PromptPlayground } from "@/components/dashboard/prompt-playground";
export default function Page() { return <div><DashboardTopbar title="Prompt Playground" /><div className="p-6"><PromptPlayground projectId="" /></div></div>; }
