export function TableOfContents({ body }: { body: any[] }) {
  if (!body || !Array.isArray(body)) return null;

  const headings = body.filter(
    (block: any) => block?._type === "block" && (block.style === "h2" || block.style === "h3")
  );

  if (headings.length < 2) return null;

  return (
    <nav className="border border-[#2A2A2A] bg-[#0A0A0A] p-4">
      <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#666666] mb-3">
        On this page
      </h4>
      <ul className="flex flex-col gap-1.5">
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
    </nav>
  );
}
