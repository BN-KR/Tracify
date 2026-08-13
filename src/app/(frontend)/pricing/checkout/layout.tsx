import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete your Tracify subscription",
  robots: { index: false, follow: false, nocache: true },
};

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
