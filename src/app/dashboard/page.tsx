"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { FolderGit2, ActivitySquare, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
};

export default function DashboardPage() {
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  
  const projects = useQuery(
    api.projects.listByOrg,
    organization?.id ? { clerkOrgId: organization.id } : "skip"
  );

  const isLoading = !isOrgLoaded || projects === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-none" />
          <Skeleton className="h-48 w-full rounded-none" />
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (projects.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
        className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
          <FolderGit2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-mono font-bold tracking-tight mb-2 text-white uppercase">Create your first project</h2>
        <p className="text-zinc-500 mb-8 leading-relaxed font-sans">
          Projects are isolated environments that give you a dedicated API key to track your agent's spans, costs, and failures.
        </p>
        <CreateProjectModal />
      </motion.div>
    );
  }

  // POPULATED STATE
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold tracking-tight font-mono uppercase">Projects</h1>
          <p className="text-zinc-500 mt-1 text-sm font-sans">
            Manage your observability projects and API keys.
          </p>
        </motion.div>
        <CreateProjectModal />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {projects.map((project) => (
          <motion.div key={project._id} variants={item}>
            <Card 
              className="group overflow-hidden border-zinc-800 bg-zinc-950/50 transition-all duration-300 hover:border-white rounded-none shadow-none"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-none bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                </div>
                <CardTitle className="text-xl mt-4 font-mono text-white uppercase">{project.name}</CardTitle>
                <CardDescription className="font-mono text-[10px] mt-2 truncate text-zinc-600 uppercase tracking-widest">
                  {project.apiKey.substring(0, 10)}...{project.apiKey.substring(project.apiKey.length - 4)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                  <div className="flex items-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    <ActivitySquare className="w-3 h-3 mr-2" />
                    <span>Active</span>
                  </div>
                  <Link href={`/dashboard/${project._id}`} passHref>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs font-mono uppercase opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/5"
                    >
                      View traces <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
