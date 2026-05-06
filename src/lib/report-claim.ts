import { supabaseClient } from "@/lib/supabase/client";

const PENDING_REPORT_KEY = "np_pending_report_claim";
const CLAIM_NEXT_KEY = "np_claim_next";

/** Call on /auth when URL contains claim_report / next (e.g. from report success screen). */
export function stashReportClaimFromSearchParams(claimReport: string | null, next: string | null) {
  if (typeof window === "undefined") return;
  if (claimReport) sessionStorage.setItem(PENDING_REPORT_KEY, claimReport);
  if (next) sessionStorage.setItem(CLAIM_NEXT_KEY, next);
}

/**
 * Attach the signed-in user to the report created in this browser session, then clear stash.
 * @returns redirect path: `/my-reports` when a claim was attempted, else `/explore-map`.
 */
export async function claimPendingReport(userId: string): Promise<string> {
  if (typeof window === "undefined") return "/explore-map";

  const reportId = sessionStorage.getItem(PENDING_REPORT_KEY);
  const next = sessionStorage.getItem(CLAIM_NEXT_KEY) ?? "/my-reports";

  if (!reportId) {
    return "/explore-map";
  }

  const sessionId = localStorage.getItem("np_session_id");
  sessionStorage.removeItem(PENDING_REPORT_KEY);
  sessionStorage.removeItem(CLAIM_NEXT_KEY);

  if (!sessionId) {
    return next;
  }

  const { error } = await supabaseClient
    .from("reports")
    .update({ reporter_user_id: userId })
    .eq("id", reportId)
    .eq("reporter_session_id", sessionId);

  if (error) {
    console.error("claimPendingReport:", error.message);
  }

  return next;
}

/**
 * Auto-claim all unclaimed reports created in this browser session.
 * Safe to call repeatedly; only rows with reporter_user_id IS NULL are updated.
 */
export async function claimSessionReports(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const sessionId = localStorage.getItem("np_session_id");
  if (!sessionId) return;

  const { error } = await supabaseClient
    .from("reports")
    .update({ reporter_user_id: userId })
    .eq("reporter_session_id", sessionId)
    .is("reporter_user_id", null);

  if (error) {
    console.error("claimSessionReports:", error.message);
  }
}
