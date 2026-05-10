"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageBody, PageHero } from "@/components/site-page-shell";
import { claimPendingReport, stashReportClaimFromSearchParams } from "@/lib/report-claim";
import { supabaseClient } from "@/lib/supabase/client";

/*
 * Phone OTP (Supabase SMS) is disabled in the UI for now. To restore:
 * - Add back `method` state `"email" | "phone"` and `phone` state.
 * - In handleSendOtp / handleVerifyOtp, branch like before: signInWithOtp({ phone }),
 *   verifyOtp({ phone, token, type: "sms" }).
 * - Restore the email/phone tab row and the tel input (E.164, e.g. +91…).
 */
function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cr = searchParams.get("claim_report");
    const next = searchParams.get("next");
    stashReportClaimFromSearchParams(cr, next);
  }, [searchParams]);

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const identifier = email.trim();
    if (!identifier) {
      setLoading(false);
      setError("Email is required.");
      return;
    }
    const { error: otpError } = await supabaseClient.auth.signInWithOtp({
      email: identifier,
      options: {
        shouldCreateUser: true,
      },
    });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setStep("otp");
    setMessage("Magic link and OTP sent to your email. Use either method to sign in.");
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error: verifyError } = await supabaseClient.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    setMessage("Login successful.");
    // Pending report claim is handled by <ClaimRedirect /> in layout once `user` updates.
    if (typeof window === "undefined" || !sessionStorage.getItem("np_pending_report_claim")) {
      router.push("/explore-map");
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Account"
        title="Sign in"
        subtitle="Magic link or OTP by email. Same bold civic platform, your account."
        tone="accent"
        containerWidth="md"
      />
      <PageBody maxWidth="md" className="pt-6 md:pt-8">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">

        {step === "identifier" ? (
          <form className="mt-6 space-y-4" onSubmit={handleSendOtp}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-brand-300 transition focus:ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Sending email OTP..." : "Send email OTP"}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleVerifyOtp}>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              We sent a magic link and OTP to <span className="font-semibold">{email}</span>.
              You can enter OTP below or open the magic link.
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                OTP code
              </label>
              <input
                type="text"
                required
                minLength={4}
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-brand-300 transition focus:ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep("identifier")}
              className="w-full text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={async () => {
                const { data: { session } } = await supabaseClient.auth.getSession();
                const uid = session?.user?.id;
                if (uid) {
                  const dest = await claimPendingReport(uid);
                  router.push(dest);
                } else {
                  router.push("/explore-map");
                }
              }}
              className="w-full text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              I already clicked the magic link
            </button>
          </form>
        )}

        {error ? <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p> : null}
        {message ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      </div>
      </PageBody>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
          <p className="text-sm text-slate-500">Loading sign-in…</p>
        </main>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
