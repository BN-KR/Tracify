import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { CLERK_APPEARANCE } from "@/components/auth/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn appearance={CLERK_APPEARANCE} />
    </AuthShell>
  );
}
