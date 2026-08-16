"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isCloudDirectory = pathname.startsWith("/cloud");
  const isAuth = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/accept-invitation", "/auth/error"].some((route) => pathname.startsWith(route));

  if (isDashboard || isOnboarding || isAuth || isCloudDirectory) return <>{children}</>;

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
