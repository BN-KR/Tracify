const simpleIcon = (slug: string) =>
  `https://cdn.simpleicons.org/${slug}/111111`;
const pinnedSimpleIcon = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/${slug}.svg`;
const lobeIcon = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@1.94.0/icons/${slug}.svg`;

const brandLogos = {
  Anthropic: simpleIcon("anthropic"),
  Cohere: lobeIcon("cohere"),
  Convex: simpleIcon("convex"),
  GitHub: simpleIcon("github"),
  Google: simpleIcon("google"),
  LangChain: simpleIcon("langchain"),
  LlamaIndex: lobeIcon("llamaindex"),
  "Mistral AI": simpleIcon("mistralai"),
  "Next.js": simpleIcon("nextdotjs"),
  OpenAI: pinnedSimpleIcon("openai"),
  OpenTelemetry: simpleIcon("opentelemetry"),
  PagerDuty: simpleIcon("pagerduty"),
  Redis: simpleIcon("redis"),
  Slack: pinnedSimpleIcon("slack"),
  Tinybird: "https://github.com/tinybirdco.png?size=96",
  Vercel: simpleIcon("vercel"),
  "Vercel AI SDK": simpleIcon("vercel"),
} as const;

export type ThirdPartyBrand = keyof typeof brandLogos;

export function ThirdPartyLogo({ brand, className = "size-6" }: {
  brand: ThirdPartyBrand;
  className?: string;
}) {
  return (
    // Simple Icons provides the brands' official SVG marks under their respective licenses.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brandLogos[brand]}
      alt={`${brand} logo`}
      width={24}
      height={24}
      className={className}
    />
  );
}

export function getThirdPartyBrand(name: string): ThirdPartyBrand | null {
  const normalized = name.endsWith(" SDK") ? name.slice(0, -4) : name;
  return normalized in brandLogos ? (normalized as ThirdPartyBrand) : null;
}
