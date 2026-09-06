import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { NotificationPreferences } from "@/components/dashboard/notification-preferences";

export default async function ProjectNotificationsPage() {
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Notifications" description="Choose which Tracify updates reach your workspace." /><div className="px-6 pb-10"><NotificationPreferences /></div></div>;
}
