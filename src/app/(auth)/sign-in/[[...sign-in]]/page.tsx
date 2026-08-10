import { AuthShell } from "@/components/auth/auth-shell";
import { BetterAuthForm } from "@/components/auth/better-auth-form";

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <BetterAuthForm mode="sign-in" />
    </AuthShell>
  );
}
