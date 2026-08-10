"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Command, Search, ArrowUpRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type CommandMenuProps = { projectId?: string };

export function DashboardCommandMenu({ projectId }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo(() => {
    const base = projectId ? `/dashboard/${projectId}` : "/dashboard";
    const destinations = [
      ["Overview", base],
      ["Runs", `${base}/runs`],
      ["Sessions", `${base}/sessions`],
      ["Search traces", `${base}/search`],
      ["Costs", `${base}/costs`],
      ["Evaluation", `${base}/evaluation`],
      ["Prompts", `${base}/prompts`],
      ["Settings", `${base}/settings`],
      ["Quickstart", `${base}/quickstart`],
    ];
    const lookup = query.trim();
    if (projectId && lookup.length >= 3) {
      destinations.unshift(
        [`Inspect run “${lookup}”`, `${base}/runs/${encodeURIComponent(lookup)}`],
        [`Open session “${lookup}”`, `${base}/sessions/${encodeURIComponent(lookup)}`],
      );
    }
    return destinations.filter(([label]) => label.toLowerCase().includes(lookup.toLowerCase()));
  }, [projectId, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="hidden h-8 items-center gap-2 border border-[#2A2A2A] bg-[#111111] px-3 font-mono text-[10px] uppercase tracking-widest text-[#777777] transition-colors hover:border-white hover:text-white md:flex"
      >
        <Command className="size-3" aria-hidden="true" />
        <span>Command</span>
        <kbd className="border border-[#333333] px-1.5 py-0.5 text-[9px] text-[#666666]">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden border-[#3A3A3A] bg-[#111111] p-0 shadow-2xl" showCloseButton={false}>
          <DialogTitle className="sr-only">Dashboard command menu</DialogTitle>
          <DialogDescription className="sr-only">Navigate to a dashboard surface.</DialogDescription>
          <div className="flex items-center gap-3 border-b border-[#2A2A2A] px-4">
            <Search className="size-4 text-[#666666]" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dashboard…"
              aria-label="Search dashboard destinations"
              className="h-14 min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-[#555555]"
            />
            <kbd className="border border-[#333333] px-1.5 py-0.5 font-mono text-[9px] text-[#666666]">ESC</kbd>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-2">
            {items.length ? items.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="flex items-center justify-between border border-transparent px-3 py-3 font-mono text-xs text-[#CCCCCC] transition-colors hover:border-[#3A3A3A] hover:bg-[#181818] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
              >
                <span>{label}</span>
                <ArrowUpRight className="size-3 text-[#666666]" aria-hidden="true" />
              </Link>
            )) : (
              <div className="p-8 text-center font-mono text-[10px] uppercase tracking-widest text-[#666666]">No destinations found</div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[#2A2A2A] px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-[#555555]"><span>Navigate workspace surfaces</span><span>⌘⇧O active project</span><span>Ctrl+\ sidebar</span></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
