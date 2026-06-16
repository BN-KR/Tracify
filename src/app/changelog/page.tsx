import Link from "next/link";

export const metadata = {
  title: "Changelog — tracify",
  description: "Product updates and release notes from the tracify team.",
};

const changes = [
  {
    date: "June 2026",
    items: [
      "Blog launched with reading progress bar, table of contents, related posts, and more.",
      "New navbar structure with dedicated Blog navigation link.",
      "Sanity Studio deployed with internal linking support for blog posts.",
    ],
  },
  {
    date: "May 2026",
    items: [
      "Cost Dashboard now supports filtering by date range and model.",
      "Trace Viewer performance improvements for long-running agent traces.",
      "New alerts system: Slack and email notifications for span failures.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#050505" }}>
      <div className="max-w-[720px] mx-auto px-6 py-24">
        <Link
          href="/"
          className="font-mono text-[13px] text-[#666666] hover:text-white transition-colors inline-block mb-12"
        >
          ← Back to home
        </Link>
        <h1 className="font-mono text-[44px] font-bold text-white mb-4 tracking-tight">
          Changelog
        </h1>
        <p className="font-sans text-[16px] text-[#999999] leading-relaxed mb-12 max-w-[600px]">
          Product updates and release notes from the tracify team.
        </p>
        <div className="flex flex-col gap-10">
          {changes.map((release) => (
            <div key={release.date}>
              <h2 className="font-mono text-[14px] font-bold text-white mb-4 tracking-tight">
                {release.date}
              </h2>
              <ul className="flex flex-col gap-3">
                {release.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-sans text-[14px] text-[#999999] leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#444444]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
