"use client";

import { Suspense } from "react";
import { AccountSettings } from "@/components/dashboard/account/account-settings";

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountSettings />
    </Suspense>
  );
}
