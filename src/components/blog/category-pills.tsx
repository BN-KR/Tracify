"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function CategoryPills({ categories, active = [] }: { categories: string[]; active?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleToggle = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("category");
      params.delete("category");
      const next = current.includes(cat) ? current.filter((value) => value !== cat) : [...current, cat];
      for (const value of next) params.append("category", value);
      router.push(`/blog${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [searchParams, router]
  );

  const handleClear = useCallback(() => {
    router.push("/blog");
  }, [router]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((cat) => {
        const isActive = active.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleToggle(cat)}
            className={`font-mono text-[11px] uppercase tracking-wider border-2 px-3 py-1.5 transition-colors ${
              isActive
                ? "border-black bg-[#f4d44d] text-black font-bold"
                : "border-black/30 bg-transparent text-black/60 hover:border-black hover:text-black"
            }`}
          >
            {isActive ? "✓ " : ""}
            {cat}
          </button>
        );
      })}
      {active.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="font-mono text-[11px] uppercase tracking-wider border-2 border-black bg-black px-3 py-1.5 text-white transition-colors hover:bg-black/80"
        >
          Clear all ({active.length})
        </button>
      )}
    </div>
  );
}
