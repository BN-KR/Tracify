import { LiveCapturedAdmin } from "@/components/dashboard/live-captured-admin";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <LiveCapturedAdmin projectId={projectId} section="settings" />;
  /*
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Project Settings"
        description="Configure thresholds, members, and project lifecycle."
      />

      <div className="px-6 pb-20">
        <nav aria-label="Project settings" className="mb-6 flex flex-wrap gap-2 border border-black/15 bg-white p-3">
          {[['General', `/dashboard/${projectId}/settings`], ['API Keys', `/dashboard/${projectId}/settings?tab=api-keys`], ['MCP & CLI', `/dashboard/${projectId}/settings/mcp-cli`], ['LLM Connections', `/dashboard/${projectId}/settings/llm-connections`], ['Model Definitions', `/dashboard/${projectId}/settings/model-definitions`], ['Scores Configs', `/dashboard/${projectId}/settings/scores-configs`], ['Members', `/dashboard/${projectId}/settings?tab=members`], ['Integrations', `/dashboard/${projectId}/settings/integrations`], ['Exports', `/dashboard/${projectId}/settings/exports`], ['Batch Actions', `/dashboard/${projectId}/settings/batch-actions`], ['Audit Logs', `/dashboard/${projectId}/settings/audit-logs`], ['Notifications', `/dashboard/${projectId}/settings/notifications`], ['Billing', `/dashboard/${projectId}/billing`]].map(([label, href]) => <Link key={label} href={href} className="border border-black/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-black/55 transition-colors hover:border-black hover:text-black">{label}</Link>)}
        </nav>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="h-12 w-full justify-start gap-8 rounded-none border-b border-black/15 bg-transparent p-0">
            <TabsTrigger
              value="general"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black"
            >
              Members
            </TabsTrigger>
            <TabsTrigger
              value="api-keys"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black"
            >
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="management"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black"
            >
              Management
            </TabsTrigger>
            <TabsTrigger
              value="orchestration"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black"
            >
              Orchestration
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black"
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0 pt-8 focus-visible:ring-0">
            <ProjectSettings projectId={projectId} />
          </TabsContent>

          <TabsContent value="members" className="mt-0 pt-8 focus-visible:ring-0">
            <ProjectMembers />
          </TabsContent>

          <TabsContent value="api-keys" className="mt-0 pt-8 focus-visible:ring-0">
            <ApiKeysManager projectId={projectId} />
          </TabsContent>

          <TabsContent value="management" className="mt-0 pt-8 focus-visible:ring-0">
            <ProjectManagement projectId={projectId} />
          </TabsContent>

          <TabsContent value="orchestration" className="mt-0 pt-8 focus-visible:ring-0">
            <ProjectOrchestration projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </div> */
}
