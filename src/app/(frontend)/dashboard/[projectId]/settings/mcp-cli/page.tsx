import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyMcpCli } from "@/components/dashboard/tracify-mcp-cli";

export default async function McpCliPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="MCP & CLI" description="Connect developer tools to your project." /><div className="px-6 pb-10"><TracifyMcpCli projectId={projectId} /></div></div>;
}
