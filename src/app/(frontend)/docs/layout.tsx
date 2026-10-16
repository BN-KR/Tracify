import { getDocs } from "@/lib/markdoc-docs";
import { DocsDock } from "@/components/docs/docs-dock";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const docs = getDocs().map(({ slug, title, description, section, headings, bodyText, body, noindex }) => ({ slug, title, description, section, headings, bodyText, body, noindex }));
  return (
    <>
      {children}
      <div aria-hidden className="h-20 bg-[#eceae3]" />
      <DocsDock docs={docs} />
    </>
  );
}
