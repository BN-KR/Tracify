import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AuthErrorPage() {
  return <AuthShell mode="error"><div><div className="mb-6 h-2 w-20 bg-[#f4d44d]" /><h2 className="font-pixel text-4xl tracking-[-0.06em]">Could not sign you in</h2><p className="mt-4 text-sm leading-6 text-black/55">The provider declined the request or the session expired. No account changes were made.</p><Link href="/sign-in" className="active-press mt-7 flex h-12 items-center justify-between bg-black px-4 font-mono text-[10px] uppercase tracking-[0.13em] text-white hover:bg-[#f4d44d] hover:text-black">Try again <ArrowRight className="size-4" /></Link></div></AuthShell>;
}
