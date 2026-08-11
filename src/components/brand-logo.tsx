import { cn } from "@/lib/utils";

/** Canonical Tracify wordmark. Keep every product-shell logo on this component. */
export function BrandLogo({
  className,
  highlighted = true,
}: {
  className?: string;
  highlighted?: boolean;
}) {
  return (
    <span
      aria-label="Tracify"
      className={cn(
        "relative isolate inline-block px-1 font-pixel text-2xl leading-none tracking-[-0.06em]",
        highlighted && "before:absolute before:-inset-x-1 before:bottom-0.5 before:-z-10 before:h-[68%] before:-rotate-1 before:skew-x-[-7deg] before:bg-[#f4d44d]/80 before:content-['']",
        className,
      )}
    >
      tracify
    </span>
  );
}
