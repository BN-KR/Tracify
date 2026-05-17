"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { SpanRow } from "@/lib/tinybird";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronDown, 
  Cpu, 
  Wrench, 
  Lightbulb, 
  AlertCircle, 
  Flag,
  Clock,
  DollarSign,
  Activity,
  MessageSquare,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TraceViewerProps {
  projectId: string;
  runId: string;
}

export function TraceViewer({ projectId, runId }: TraceViewerProps) {
  const run = useQuery(
    api.agentRuns.getByRunId, 
    projectId ? { runId, projectId: projectId as Id<"projects"> } : "skip"
  );

  const [spans, setSpans] = useState<SpanRow[] | null>(null);
  const [loadingSpans, setLoadingSpans] = useState(true);

  useEffect(() => {
    async function fetchSpans() {
      try {
        const res = await fetch(`/api/projects/${projectId}/runs/${runId}/spans`);
        if (!res.ok) throw new Error("Failed to fetch spans");
        const data = await res.json();
        setSpans(data.spans);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSpans(false);
      }
    }
    fetchSpans();
  }, [projectId, runId]);

  if (run === undefined || (loadingSpans && !spans)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-none" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Run not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Run Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border bg-muted/10 p-5">
        <StatItem label="Status" value={<span className="capitalize">{run.status}</span>} />
        <StatItem label="Total Cost" value={formatCurrency(run.totalCostUsd)} />
        <StatItem label="Span Count" value={run.spanCount.toString()} />
        <StatItem label="Started" value={formatRelativeTime(run.startedAt)} />
      </div>

      {/* Timeline */}
      <div className="relative pl-8 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
        {spans?.map((span, index) => (
          <SpanCard key={span.spanId} span={span} index={index} projectId={projectId} />
        ))}
        
        {run.status === "running" && (
          <div className="relative flex items-center gap-4 text-zinc-500">
            <div className="absolute -left-[23px] size-4 rounded-full border border-border bg-black flex items-center justify-center">
              <div className="size-1.5 bg-white animate-pulse" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest animate-pulse">
              Agent is thinking...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{label}</div>
      <div className="text-sm font-mono text-white">{value}</div>
    </div>
  );
}

function SpanCard({ span, index, projectId }: { span: SpanRow, index: number, projectId: string }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const comments = useQuery(api.comments.listBySpan, { spanId: span.spanId });
  const createComment = useMutation(api.comments.create);

  async function handleAddComment() {
    if (!commentContent.trim()) return;
    setIsCommenting(true);
    try {
      await createComment({
        spanId: span.spanId,
        projectId: projectId as Id<"projects">,
        runId: span.runId,
        content: commentContent,
      });
      setCommentContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  }

  const typeConfig = {
    llm_call: { icon: Cpu, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
    tool_call: { icon: Wrench, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    decision: { icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    run_end: { icon: Flag, color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20" },
  }[span.spanType] || { icon: Activity, color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20" };

  const Icon = typeConfig.icon;

  return (
    <div className="relative">
      {/* Timeline Node */}
      <div className={cn(
        "absolute -left-[23px] top-4 size-4 rounded-full border bg-black flex items-center justify-center z-10",
        typeConfig.border
      )}>
        <Icon className={cn("size-2.5", typeConfig.color)} />
      </div>

      {/* Card */}
      <div className={cn(
        "border transition-all duration-200",
        isExpanded ? "border-zinc-700 bg-muted/20 shadow-lg" : "border-border bg-transparent hover:border-zinc-700 hover:bg-muted/5"
      )}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-4 min-w-0">
            <Badge variant="outline" className={cn("rounded-none border-0 px-0 font-mono", typeConfig.color)}>
              {span.spanType.replace("_", " ")}
            </Badge>
            <div className="truncate font-mono text-xs text-white max-w-[200px] md:max-w-md">
              {span.modelId || span.toolName || "Processing..."}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
              <span className="flex items-center gap-1"><Clock className="size-3" /> {formatDuration(span.latencyMs)}</span>
              <span className="flex items-center gap-1"><DollarSign className="size-3" /> {formatCurrency(span.costUsd)}</span>
            </div>
            {isExpanded ? <ChevronDown className="size-4 text-zinc-500" /> : <ChevronRight className="size-4 text-zinc-500" />}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4 border-t border-border/50">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono">Input</label>
                    <pre className="p-3 bg-black/40 border border-border/30 text-[11px] font-mono overflow-auto max-h-[300px] text-zinc-300">
                      {formatJson(span.input)}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono">Output</label>
                    <pre className="p-3 bg-black/40 border border-border/30 text-[11px] font-mono overflow-auto max-h-[300px] text-zinc-300">
                      {formatJson(span.output)}
                    </pre>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="pt-4 border-t border-border/30 space-y-4">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    <MessageSquare className="size-3" />
                    Human-in-the-loop Comments
                  </div>
                  
                  {comments && comments.length > 0 && (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment._id} className="bg-black/20 p-3 border border-border/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">{comment.userName}</span>
                            <span className="text-[9px] font-mono text-zinc-600">{formatRelativeTime(comment.createdAt.toString())}</span>
                          </div>
                          <p className="text-[11px] font-mono text-zinc-300">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input 
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Add an annotation or correction..."
                      className="rounded-none border-zinc-800 bg-black/40 text-[11px] font-mono h-9"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleAddComment}
                      disabled={isCommenting || !commentContent.trim()}
                      className="size-9 rounded-none bg-zinc-800 hover:bg-white hover:text-black shrink-0"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatJson(str: string) {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
}
