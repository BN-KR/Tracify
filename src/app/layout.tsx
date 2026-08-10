import { ConvexClientProvider } from "@/components/convex-provider";
import { getToken } from "@/lib/auth-server";
import { SiteChrome } from "@/components/marketing/site-chrome";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tracify.tech"),
  title: "tracify — Know why your agent failed",
  description:
    "Investigate AI agent failures with one operational record for traces, cost, quality, prompts, and alerts.",
  openGraph: {
    title: "tracify — Know why your agent failed",
    description:
      "Trace every decision, tool call, cost, quality signal, and deployment change in one debugging timeline.",
    type: "website",
    siteName: "tracify",
  },
  twitter: {
    card: "summary_large_image",
    title: "tracify — Know why your agent failed",
    description:
      "Agent observability for traces, cost, quality, prompts, and alerts.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ConvexClientProvider initialToken={await getToken()}>
            <TooltipProvider>
              <SiteChrome>{children}</SiteChrome>
            </TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
