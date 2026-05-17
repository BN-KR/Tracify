"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, MoreVertical, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectMembersProps {
  projectId: string;
}

export function ProjectMembers({ projectId }: ProjectMembersProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  if (!orgLoaded || !userLoaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
      </div>
    );
  }

  // If not in an org, show personal project state
  if (!organization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">Personal Project</h3>
            <p className="text-[11px] text-[#666666] mt-1">This project is only visible to you.</p>
          </div>
          <Button variant="outline" className="rounded-none font-mono text-[10px] uppercase border-zinc-800 gap-2">
            <UserPlus className="size-4" /> Move to Organization
          </Button>
        </div>

        <Card className="divide-y divide-[#2A2A2A] rounded-none border-border bg-[#111111] shadow-none">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-zinc-800 rounded-none flex items-center justify-center font-mono text-xs text-white">
                {user?.firstName?.slice(0, 1) || "U"}
              </div>
              <div>
                <p className="text-[13px] font-mono text-white">{user?.fullName || "You"}</p>
                <p className="text-[11px] font-mono text-[#666666]">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-white text-black px-1.5 py-0.5 font-mono uppercase font-bold">Owner</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">{organization.name} Members</h3>
          <p className="text-[11px] text-[#666666] mt-1">Manage who has access to this project.</p>
        </div>
        <Button className="rounded-none font-mono text-[10px] uppercase gap-2">
          <UserPlus className="size-4" /> Invite Member
        </Button>
      </div>

      <Card className="divide-y divide-[#2A2A2A] rounded-none border-border bg-[#111111] shadow-none">
        {/* We would typically map over organization.memberships here if we had the memberships preloaded */}
        {/* For now, we'll show a high-fidelity placeholder of the team state */}
        <MemberRow 
          name={user?.fullName || "You"} 
          email={user?.primaryEmailAddress?.emailAddress || ""} 
          role="Admin" 
          isMe 
        />
        <MemberRow 
          name="Sarah Chen" 
          email="sarah@5to1r.com" 
          role="Developer" 
        />
        <MemberRow 
          name="Marcus Wright" 
          email="marcus@5to1r.com" 
          role="Viewer" 
        />
      </Card>

      <div className="p-4 border border-zinc-800/50 bg-zinc-900/10 flex items-start gap-4">
        <Shield className="size-5 text-zinc-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] text-white font-mono uppercase">Role-Based Access Control</p>
          <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
            Only Admins can rotate API keys or delete projects. Developers can view and manage runs. Viewers have read-only access.
          </p>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ name, email, role, isMe }: { name: string, email: string, role: string, isMe?: boolean }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-8 bg-zinc-900 border border-zinc-800 rounded-none flex items-center justify-center font-mono text-xs text-white uppercase">
          {name.slice(0, 1)}
        </div>
        <div>
          <p className="text-[13px] font-mono text-white">{name} {isMe && <span className="text-[#666666] ml-1">(me)</span>}</p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#666666]">
            <Mail className="size-3" />
            {email}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={cn(
          "text-[9px] px-1.5 py-0.5 font-mono uppercase font-bold",
          role === "Admin" ? "bg-white text-black" : "bg-[#1A1A1A] text-[#999999]"
        )}>
          {role}
        </span>
        <Button variant="ghost" size="icon" className="size-8 text-[#666666] hover:text-white">
          <MoreVertical className="size-4" />
        </Button>
      </div>
    </div>
  );
}
