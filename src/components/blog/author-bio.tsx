export function AuthorBio({ author }: { author: string }) {
  if (!author) return null;

  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 p-4 border border-[#2A2A2A] bg-[#0A0A0A]">
      <div className="w-12 h-12 border border-[#2A2A2A] bg-[#050505] flex items-center justify-center shrink-0">
        <span className="font-mono text-[14px] text-[#999999]">{initials}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[13px] text-white">{author}</span>
        <span className="font-sans text-[12px] text-[#999999]">
          Engineering team at tracify
        </span>
      </div>
    </div>
  );
}
