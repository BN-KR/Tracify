import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { BillingPlan } from "@/components/dashboard/billing-plan";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Billing" /><div className="px-6 pb-10"><BillingPlan projectId="" /></div></div>; }
