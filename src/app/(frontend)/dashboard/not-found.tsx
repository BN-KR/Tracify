import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="mx-6 my-10 border border-dashed border-black/25 bg-white p-10 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-black/70">Dashboard view not found</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black/55">This workspace route may have moved or the project may no longer be available.</p>
      <Link href="/dashboard" className="mt-5 inline-flex border border-black/30 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-black/70 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Return to projects</Link>
    </div>
  );
}
