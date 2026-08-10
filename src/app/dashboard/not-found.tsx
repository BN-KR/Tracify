import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="mx-6 my-10 border border-dashed border-zinc-700 bg-[#0D0D0D] p-10 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-300">Dashboard view not found</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">This workspace route may have moved or the project may no longer be available.</p>
      <Link href="/dashboard" className="mt-5 inline-flex border border-zinc-600 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Return to projects</Link>
    </div>
  );
}
