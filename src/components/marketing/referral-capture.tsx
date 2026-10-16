"use client";

import { useEffect } from "react";
import { normalizeReferral, rememberReferral } from "@/lib/referral";

/** Remembers a ?ref= code from the address so forms later in the visit can send it. Renders nothing. */
export function ReferralCapture() {
  useEffect(() => {
    const code = normalizeReferral(new URLSearchParams(window.location.search).get("ref"));
    if (code) rememberReferral(code);
  }, []);
  return null;
}
