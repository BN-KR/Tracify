import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export default function ResetPasswordPage() {
  return <AuthShell mode="reset-password"><PasswordRecoveryForm mode="reset" /></AuthShell>;
}
