import { ConvexClientProvider } from "@/components/convex-provider";
import { getToken } from "@/lib/auth-server";
import { SiteChrome } from "@/components/marketing/site-chrome";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const isCloudDeployment = process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND === "cloud";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tracify.tech"),
  title: { default: "Tracify | AI agent observability and evaluation", template: "%s | Tracify" },
  description: "Trace, evaluate, and improve AI agents with one operational record for failures, cost, quality, prompts, and releases.",
  applicationName: "Tracify",
  category: "AI agent observability",
  keywords: ["AI agent observability", "LLM observability", "AI agent evaluation", "OpenTelemetry tracing", "agent tracing", "LLM cost monitoring"],
  robots: isCloudDeployment
    ? { index: false, follow: false }
    : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: {
    title: "Tracify | AI agent observability and evaluation",
    description: "Trace every decision, tool call, cost, quality signal, and deployment change in one debugging timeline.",
    type: "website",
    siteName: "Tracify",
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: "Tracify | AI agent observability and evaluation", description: "Agent observability for traces, cost, quality, prompts, and alerts." },
};

const structuredData = [
  { "@context": "https://schema.org", "@type": "Organization", name: "Tracify", url: "https://www.tracify.tech", logo: "https://www.tracify.tech/icon.png" },
  { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Tracify", applicationCategory: "DeveloperApplication", operatingSystem: "Web", url: "https://www.tracify.tech", description: "AI agent observability and evaluation for tracing failures, cost, quality, prompts, and releases.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
];

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <ConvexClientProvider initialToken={await getToken()}>
          <TooltipProvider><SiteChrome>{children}</SiteChrome></TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
