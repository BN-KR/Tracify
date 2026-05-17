"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight, Save } from "lucide-react";

interface ProjectSettingsProps {
  projectId: string;
}

export function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const project = useQuery(
    api.projects.getProjectById, 
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  const updateProject = useMutation(api.projects.updateProject);

  const [name, setName] = useState("");
  const [costThreshold, setCostThreshold] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [maxStall, setMaxStall] = useState("");
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setCostThreshold(project.costThresholdUsd?.toString() || "1.00");
      setMaxDuration(project.maxDurationSeconds?.toString() || "300");
      setMaxStall(project.maxStallMinutes?.toString() || "5");
      setSlackWebhookUrl(project.slackWebhookUrl || "");
    }
  }, [project]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateProject({
        projectId: projectId as Id<"projects">,
        name,
        costThresholdUsd: parseFloat(costThreshold),
        maxDurationSeconds: parseInt(maxDuration),
        maxStallMinutes: parseInt(maxStall),
        slackWebhookUrl: slackWebhookUrl || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setSaving(false);
    }
  }

  if (project === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-none" />
        <Skeleton className="h-60 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* General Settings */}
      <Card className="p-6 rounded-none border-border bg-[#111111] shadow-none space-y-6">
        <div>
          <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">General Settings</h3>
          <p className="text-[11px] text-[#666666] mt-1">Basic project identification and identity.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Project Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
          </div>
          
          <div className="space-y-2 opacity-50">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Project ID</label>
            <Input 
              value={projectId} 
              readOnly
              className="rounded-none border-zinc-800 bg-black text-zinc-500 font-mono h-10 cursor-not-allowed"
            />
          </div>
        </div>
      </Card>

      {/* Thresholds & Limits */}
      <Card className="p-6 rounded-none border-border bg-[#111111] shadow-none space-y-6">
        <div>
          <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">Alert Thresholds</h3>
          <p className="text-[11px] text-[#666666] mt-1">Set boundaries for your agent's resource usage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Cost (USD)</label>
            <Input 
              type="number"
              step="0.01"
              value={costThreshold} 
              onChange={(e) => setCostThreshold(e.target.value)}
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Duration (sec)</label>
            <Input 
              type="number"
              value={maxDuration} 
              onChange={(e) => setMaxDuration(e.target.value)}
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Stall (min)</label>
            <Input 
              type="number"
              value={maxStall} 
              onChange={(e) => setMaxStall(e.target.value)}
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#2A2A2A]">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono text-zinc-500">Slack Webhook URL</label>
          <Input 
            value={slackWebhookUrl} 
            onChange={(e) => setSlackWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/..."
            className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
          />
          <p className="text-[9px] text-zinc-600 font-mono uppercase">Alerts will be sent to this channel when thresholds are exceeded.</p>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-4">
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-[11px] font-mono">
            <AlertCircle className="size-3" />
            {error}
          </div>
        )}
        <div />
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-none h-10 px-8 font-mono uppercase text-xs"
        >
          {saving ? "Saving..." : <span className="flex items-center gap-2"><Save className="size-4" /> Save Changes</span>}
        </Button>
      </div>

      <div className="pt-12">
        <div className="border border-red-900/30 bg-red-950/5 p-6 rounded-none space-y-4">
          <div>
            <h3 className="font-mono text-[14px] text-red-500 uppercase tracking-widest">Danger Zone</h3>
            <p className="text-[11px] text-red-500/60 mt-1 uppercase tracking-tighter">Permanently delete this project and all of its data.</p>
          </div>
          
          <Link
            href={`/dashboard/${projectId}/manage`}
            className={buttonVariants({
              variant: "destructive",
              className: "h-10 px-6 text-xs uppercase",
            })}
          >
            Open Management
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
