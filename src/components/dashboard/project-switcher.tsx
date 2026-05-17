"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const LAST_PROJECT_STORAGE_KEY = "5to1r.lastProjectId";

export function ProjectSwitcher({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const router = useRouter();
  const params = useParams();
  const currentProjectId = params?.projectId as string | undefined;
  
  const projects = useQuery(api.projects.getProjectsByUserOrOrg) || [];
  
  const selectedProject =
    projects.find((project) => project._id === currentProjectId) ??
    projects[0] ??
    null;

  function selectProject(projectId: string) {
    window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, projectId);
    router.push(`/dashboard/${projectId}`);
  }

  const label = selectedProject?.name ?? "No projects";
  const initials = label.slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center border border-[#2A2A2A] bg-[#0A0A0A] font-mono text-[#CCCCCC] outline-none transition-colors hover:border-white hover:text-white focus-visible:border-white",
            isCollapsed ? "size-9 justify-center text-[12px]" : "h-10 w-full justify-between px-3 text-[13px]"
          )}
        >
          {isCollapsed ? (
            <span>{initials}</span>
          ) : (
            <>
              <span className="truncate">{label}</span>
              <ChevronDown className="size-4 shrink-0 text-[#666666]" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isCollapsed ? "start" : "center"}
        side={isCollapsed ? "right" : "bottom"}
        sideOffset={isCollapsed ? 12 : 8}
        className="w-64"
      >
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.length ? (
          projects.map((project) => (
            <DropdownMenuItem
              key={project._id}
              onClick={() => selectProject(project._id)}
              className="flex flex-col items-start gap-0"
            >
              <span className={project._id === currentProjectId ? "text-white" : ""}>
                {project.name}
              </span>
              <span className="text-[10px] text-[#666666] uppercase">{project.planTier}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/onboarding/project")}>
          <Plus className="size-4" />
          <span>New project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
