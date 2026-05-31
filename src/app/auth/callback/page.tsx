"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const oauthError = params.get("error_description") ?? params.get("error");

      if (oauthError) {
        if (!cancelled) setError(oauthError);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) setError(exchangeError.message);
          return;
        }
      }

      // Pending report claims are handled by <ClaimRedirect /> once the session is active.
      if (!cancelled) router.replace("/explore-map");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      {error ? (
        <div className="max-w-md rounded-3xl bg-white p-6 text-center ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-800">Sign-in failed</p>
          <p className="mt-2 text-sm text-brand-700">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/auth")}
            className="mt-4 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Completing sign-in…</p>
      )}
    </main>
  );
}
