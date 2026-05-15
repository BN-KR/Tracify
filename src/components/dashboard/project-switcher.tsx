"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PROJECTS = [
  { id: "research-agent-prod", name: "research-agent-prod", status: "prod" },
  {
    id: "support-agent-staging",
    name: "support-agent-staging",
    status: "staging",
  },
  { id: "automation-dev", name: "automation-dev", status: "dev" },
];

export const MOCK_PROJECT_ID = PROJECTS[0].id;
const LAST_PROJECT_STORAGE_KEY = "5to1r.lastProjectId";
const ONBOARDING_PROJECT_ID_STORAGE_KEY = "5to1r.onboarding.projectId";
const ONBOARDING_PROJECT_NAME_STORAGE_KEY = "5to1r.onboarding.projectName";

function getInitialProjects() {
  if (typeof window === "undefined") return PROJECTS;

  const projectId = window.sessionStorage.getItem(
    ONBOARDING_PROJECT_ID_STORAGE_KEY,
  );
  const projectName = window.sessionStorage.getItem(
    ONBOARDING_PROJECT_NAME_STORAGE_KEY,
  );

  if (!projectId || !projectName) return PROJECTS;

  return [
    { id: projectId, name: projectName, status: "free" },
    ...PROJECTS.filter((project) => project.id !== projectId),
  ];
}

export function ProjectSwitcher({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const router = useRouter();
  const [projects] = useState(getInitialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    if (typeof window === "undefined") return PROJECTS[0].id;
    const storedProjectId = window.localStorage.getItem(LAST_PROJECT_STORAGE_KEY);
    return storedProjectId ?? projects[0].id;
  });
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0];

  function selectProject(project: (typeof projects)[number]) {
    setSelectedProjectId(project.id);
    window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, project.id);
    router.push(`/dashboard/${project.id}`);
  }

  const trigger = (
    <button
      type="button"
      className={
        isCollapsed
          ? "flex size-9 items-center justify-center border border-[#2A2A2A] bg-[#0A0A0A] font-mono text-[12px] text-white outline-none transition-colors hover:bg-[#161616] focus-visible:border-[#999999]"
          : "flex h-10 w-full items-center justify-between border border-[#2A2A2A] bg-[#0A0A0A] px-3 font-mono text-[13px] text-[#CCCCCC] outline-none transition-colors hover:bg-[#161616] focus-visible:border-[#999999]"
      }
    >
      {isCollapsed ? (
        <span>{selectedProject.name.slice(0, 1).toUpperCase()}</span>
      ) : (
        <>
          <span className="truncate">{selectedProject.name}</span>
          <ChevronDown className="size-4 shrink-0 text-[#666666]" />
        </>
      )}
    </button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          isCollapsed ? (
            <Tooltip>
              <TooltipTrigger render={trigger} />
              <TooltipContent
                side="right"
                className="rounded-none border border-[#2A2A2A] bg-[#111111] font-mono text-xs text-[#CCCCCC] shadow-none"
              >
                {selectedProject.name}
              </TooltipContent>
            </Tooltip>
          ) : (
            trigger
          )
        }
      />
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-64 rounded-none border border-[#2A2A2A] bg-[#111111] p-1 font-mono text-[13px] text-[#CCCCCC] shadow-none ring-0"
      >
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => selectProject(project)}
            className="flex h-12 flex-col items-start justify-center gap-0 rounded-none px-2 text-[13px] text-[#CCCCCC] focus:bg-[#161616] focus:text-white"
          >
            <span>{project.name}</span>
            <span className="text-[11px] text-[#666666]">{project.status}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-1 bg-[#2A2A2A]" />
        <DropdownMenuItem
          onClick={() => router.push("/onboarding/project")}
          className="h-9 rounded-none px-2 text-[13px] text-[#999999] focus:bg-[#161616] focus:text-white"
        >
          <Plus className="size-4" />
          New project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
