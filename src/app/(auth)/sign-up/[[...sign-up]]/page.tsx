import { AuthShell } from "@/components/auth/auth-shell";
import { BetterAuthForm } from "@/components/auth/better-auth-form";

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <BetterAuthForm mode="sign-up" />
    </AuthShell>
  );
}
