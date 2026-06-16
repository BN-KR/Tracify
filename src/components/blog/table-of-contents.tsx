export function TableOfContents({ body, collapsible }: { body: any[]; collapsible?: boolean }) {
  if (!body || !Array.isArray(body)) return null;

  const headings = body.filter(
    (block: any) => block?._type === "block" && (block.style === "h2" || block.style === "h3")
  );

  if (headings.length < 2) return null;

  const list = (
    <ul className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
      {headings.map((heading: any, i: number) => {
        const text = heading.children?.map((c: any) => c.text).join("") || "";
        const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return (
          <li key={i}>
            <a
              href={`#${slug}`}
              className={`block font-sans text-[13px] transition-colors hover:text-white ${
                heading.style === "h3" ? "pl-4 text-[#777777]" : "text-[#999999]"
              }`}
            >
              {text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (collapsible) {
    return (
      <details open className="border border-[#2A2A2A] bg-[#0A0A0A] group">
        <summary className="font-mono text-[11px] uppercase tracking-widest text-[#666666] px-4 py-3 cursor-pointer select-none list-none flex items-center justify-between">
          On this page
          <span className="text-[#666666] group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-4 pb-4 border-t border-[#2A2A2A] pt-3">
          {list}
        </div>
      </details>
    );
  }

  return (
    <nav className="border border-[#2A2A2A] bg-[#0A0A0A] p-4">
      <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#666666] mb-3">
        On this page
      </h4>
      {list}
    </nav>
  );
}
