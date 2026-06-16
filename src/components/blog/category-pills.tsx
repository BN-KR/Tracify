"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function CategoryPills({ categories, active }: { categories: string[]; active?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cat === active) {
        params.delete("category");
      } else {
        params.set("category", cat);
      }
      router.push(`/blog${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [searchParams, active, router]
  );

  const handleClear = useCallback(() => {
    router.push("/blog");
  }, [router]);

  return (
    <div className="flex flex-wrap gap-2">
      {active && (
        <button
          onClick={handleClear}
          className="font-mono text-[11px] uppercase tracking-wider border px-2 py-1 transition-colors border-white text-white"
        >
          Clear all
        </button>
      )}
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`font-mono text-[11px] uppercase tracking-wider border px-2 py-1 transition-colors ${
            active === cat
              ? "border-white text-white"
              : "border-[#2A2A2A] text-[#666666] hover:border-[#666666] hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
