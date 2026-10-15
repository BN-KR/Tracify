"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { SiteAssistant } from "@/components/marketing/site-assistant";
import { LandingFooter } from "@/components/marketing/landing/landing-footer";
import { LandingNav } from "@/components/marketing/landing/landing-nav";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/tracify-preview");
  const isPlayground = pathname.startsWith("/playground");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isCloudDirectory = pathname.startsWith("/cloud");
  const isAuth = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/accept-invitation", "/auth/error"].some((route) => pathname.startsWith(route));

  if (isDashboard || isPlayground || isOnboarding || isAuth || isCloudDirectory) return <>{children}</>;

  if (pathname === "/") {
    return (
      <>
        <LandingNav />
        {children}
        <LandingFooter />
        <SiteAssistant />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <SiteAssistant />
    </>
  );
}
