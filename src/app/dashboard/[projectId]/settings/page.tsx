import { ProjectSettings } from "@/components/dashboard/project-settings";
import { ProjectMembers } from "@/components/dashboard/project-members";
import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";
import { ProjectManagement } from "@/components/dashboard/project-management";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Project Settings"
        description="Configure thresholds, members, and project lifecycle."
      />

      <div className="px-6 pb-20">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="h-12 w-full justify-start gap-8 rounded-none border-b border-[#2A2A2A] bg-transparent p-0">
            <TabsTrigger
              value="general"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Members
            </TabsTrigger>
            <TabsTrigger
              value="api-keys"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="management"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Management
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest opacity-50 data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white"
              disabled
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0 pt-8 focus-visible:ring-0">
            <ProjectSettings projectId={projectId} />
          </TabsContent>

          <TabsContent value="members" className="mt-0 pt-8 focus-visible:ring-0">
            <ProjectMembers projectId={projectId} />
          </TabsContent>

          <TabsContent value="api-keys" className="mt-0 pt-8 focus-visible:ring-0">
            <ApiKeysManager projectId={projectId} />
          </TabsContent>

          <TabsContent value="management" className="mt-0 pt-8 focus-visible:ring-0">
            <ProjectManagement projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
