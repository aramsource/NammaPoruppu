"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { claimPendingReport, claimSessionReports, consumeAuthNextRedirect } from "@/lib/report-claim";

/**
 * After sign-in (OTP, magic link, or existing session), attach pending anonymous report to the user
 * when /auth was opened with ?claim_report=…&next=…
 */
export function ClaimRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    void (async () => {
      // Always auto-claim unclaimed reports from this browser session.
      await claimSessionReports(user.id);

      if (sessionStorage.getItem("np_pending_report_claim")) {
        const dest = await claimPendingReport(user.id);
        if (!cancelled) router.replace(dest);
        return;
      }

      const next = consumeAuthNextRedirect();
      if (next && !cancelled) router.replace(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  return null;
}
