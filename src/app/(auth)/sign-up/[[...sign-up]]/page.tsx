import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { CLERK_APPEARANCE } from "@/components/auth/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp appearance={CLERK_APPEARANCE} />
    </AuthShell>
  );
}
