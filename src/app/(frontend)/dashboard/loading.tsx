import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 px-6 pb-10" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-none" />
          <Skeleton className="h-3 w-72 rounded-none" />
        </div>
        <Skeleton className="h-8 w-32 rounded-none" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-none" />)}
      </div>
      <Skeleton className="h-72 w-full rounded-none" />
    </div>
  );
}
