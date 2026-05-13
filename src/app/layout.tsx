import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/convex-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "5to1r — Agent Observability",
  description:
    "Full visibility into every step an AI agent takes — tools, decisions, cost, and failures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider
          appearance={{
            variables: {
              colorBackground: '#000000',
              colorInputBackground: '#0A0A0A',
              colorInputText: '#FFFFFF',
              colorText: '#A1A1AA',
              colorPrimary: '#FFFFFF',
              borderRadius: '0px',
              fontFamily: 'var(--font-geist-mono)',
            },
            elements: {
              card: "border border-zinc-800",
              navbar: "border-b border-zinc-800",
              footer: "hidden",
            }
          }}
        >
          <ConvexClientProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

