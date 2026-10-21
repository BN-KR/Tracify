import Link from "next/link";

/** Runs (whole traces) and Actions (single steps) share the Tracing page; the choice lives in the URL. */
export function ViewSwitch({ projectId, view }: { projectId: string; view: "runs" | "actions" }) {
  const base = `/dashboard/${encodeURIComponent(projectId)}/tracing`;
  const item = (active: boolean) => `px-2.5 py-1 ${active ? "bg-[#F4D44D] text-[#0B0D10]" : "text-[#C9CED6] hover:text-white"}`;
  return (
    <nav aria-label="Tracing view" className="mr-1 flex overflow-hidden rounded-md border border-[#262C35] text-xs">
      <Link href={base} aria-current={view === "runs" ? "page" : undefined} className={item(view === "runs")}>Runs</Link>
      <Link href={`${base}?view=actions`} aria-current={view === "actions" ? "page" : undefined} className={item(view === "actions")}>Actions</Link>
    </nav>
  );
}
