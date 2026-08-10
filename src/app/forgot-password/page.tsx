import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export default function ForgotPasswordPage() {
  return <AuthShell mode="forgot-password"><PasswordRecoveryForm mode="request" /></AuthShell>;
}
