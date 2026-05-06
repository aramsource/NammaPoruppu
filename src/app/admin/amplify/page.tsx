"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageBody, PageHero } from "@/components/site-page-shell";
import { useAuth } from "@/context/auth-context";

type Row = {
  id: string;
  report_id: string;
  requested_by: string | null;
  status: string;
  suggested_text: string;
  twitter_post_id: string | null;
  twitter_url: string | null;
  created_at: string;
  primary_report_image_url: string | null;
};

function xIntentComposeUrl(text: string) {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export default function AdminAmplifyPage() {
  const { session, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [manualUrlById, setManualUrlById] = useState<Record<string, string>>({});
  const [copyFlashId, setCopyFlashId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    setLoadError("");
    const res = await fetch("/api/admin/amplify-requests", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = (await res.json()) as { data?: Row[]; error?: string };
    if (!res.ok) {
      setLoadError(json.error ?? `Failed to load (${res.status})`);
      setRows([]);
      return;
    }
    setRows(json.data ?? []);
  }, [session?.access_token]);

  useEffect(() => {
    if (!loading && session?.access_token) void load();
  }, [loading, session?.access_token, load]);

  async function copyText(id: string, text: string) {
    setActionError("");
    try {
      await navigator.clipboard.writeText(text);
      setCopyFlashId(id);
      window.setTimeout(() => setCopyFlashId((cur) => (cur === id ? null : cur)), 2000);
    } catch {
      setActionError("Could not copy to clipboard. Select the text manually.");
    }
  }

  async function markPostedManual(id: string) {
    if (!session?.access_token) return;
    const twitter_url = (manualUrlById[id] ?? "").trim();
    if (!twitter_url) {
      setActionError("Paste the published post URL before marking as posted.");
      return;
    }
    setBusyId(id);
    setActionError("");
    const res = await fetch(`/api/admin/amplify-requests/${id}/mark-posted`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ twitter_url }),
    });
    const json = (await res.json()) as { error?: string };
    setBusyId(null);
    if (!res.ok) {
      setActionError(json.error ?? `Mark posted failed (${res.status})`);
      return;
    }
    setManualUrlById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await load();
  }

  async function postToXApi(id: string) {
    if (!session?.access_token) return;
    setBusyId(id);
    setActionError("");
    const res = await fetch(`/api/admin/amplify-requests/${id}/post`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = (await res.json()) as { twitter_url?: string; error?: string };
    setBusyId(null);
    if (!res.ok) {
      setActionError(json.error ?? `Post failed (${res.status})`);
      return;
    }
    await load();
  }

  async function reject(id: string) {
    if (!session?.access_token) return;
    setBusyId(id);
    setActionError("");
    const res = await fetch(`/api/admin/amplify-requests/${id}/reject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const json = (await res.json()) as { error?: string };
    setBusyId(null);
    if (!res.ok) {
      setActionError(json.error ?? `Reject failed (${res.status})`);
      return;
    }
    await load();
  }

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Admin"
        title="Official X queue"
        subtitle="Post manually from the @nammaporuppu account: copy the draft, attach the reporter’s photo in X, publish, then paste the post URL here. API posting is optional if server Twitter keys are configured."
        tone="accent"
        containerWidth="2xl"
        actions={
          <Link href="/explore-map" className="text-sm font-semibold text-white/90 hover:underline">
            ← Map
          </Link>
        }
      />
      <PageBody maxWidth="2xl">
        {!session?.access_token && !loading ? (
          <p className="mt-6 text-sm text-slate-600">
            <Link href="/auth" className="font-semibold text-brand-600 hover:underline">
              Sign in
            </Link>{" "}
            with an admin account to use this page.
          </p>
        ) : null}

        {loadError ? (
          <p className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{loadError}</p>
        ) : null}
        {actionError ? (
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{actionError}</p>
        ) : null}

        <div className="mt-6 space-y-4">
          {rows.length === 0 && !loadError ? (
            <p className="text-sm text-slate-500">No requests yet.</p>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 ring-1 ring-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                      r.status === "posted"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "rejected"
                          ? "bg-slate-200 text-slate-600"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {r.status}
                  </span>
                  <span className="text-[11px] text-slate-400">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">Report {r.report_id}</p>

                {r.primary_report_image_url ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-700">Reporter photo (attach in X)</p>
                    <div className="mt-2 flex flex-wrap items-start gap-3">
                      <img
                        src={r.primary_report_image_url}
                        alt=""
                        className="h-28 max-w-[200px] rounded-lg border border-slate-200 object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-2 text-xs text-slate-600">
                        <p>
                          X cannot pre-fill media from a link. Open the image, save it (or drag the tab), then add it in the post
                          composer while logged in as @nammaporuppu.
                        </p>
                        <a
                          href={r.primary_report_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block font-semibold text-accent-700 hover:underline"
                        >
                          Open full image
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">No report photo on file for this item.</p>
                )}

                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Draft text</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-800">
                  {r.suggested_text}
                </p>

                {r.twitter_url ? (
                  <a href={r.twitter_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-accent-700 hover:underline">
                    Open post
                  </a>
                ) : null}

                {r.status === "pending" ? (
                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Manual post (recommended)</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => void copyText(r.id, r.suggested_text)}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          {copyFlashId === r.id ? "Copied" : "Copy draft text"}
                        </button>
                        <a
                          href={xIntentComposeUrl(r.suggested_text)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                          Open X compose
                        </a>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">
                        Log in as @nammaporuppu in that browser tab, paste if needed, attach the photo above, then publish.
                      </p>
                    </div>

                    <div>
                      <label htmlFor={`manual-url-${r.id}`} className="text-xs font-bold uppercase tracking-wide text-slate-600">
                        After publishing — paste post URL
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input
                          id={`manual-url-${r.id}`}
                          type="url"
                          placeholder="https://x.com/nammaporuppu/status/…"
                          value={manualUrlById[r.id] ?? ""}
                          onChange={(e) => setManualUrlById((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          className="min-w-[200px] flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none ring-accent-500/30 focus:border-accent-500 focus:ring-2"
                        />
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => void markPostedManual(r.id)}
                          className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                        >
                          {busyId === r.id ? "Saving…" : "Mark posted"}
                        </button>
                      </div>
                    </div>

                    <details className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm">
                      <summary className="cursor-pointer font-semibold text-slate-700">Other actions</summary>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => void postToXApi(r.id)}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          {busyId === r.id ? "Working…" : "Post via API"}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => void reject(r.id)}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">
                        API post sends text only (no image). Reject if you will not amplify this report.
                      </p>
                    </details>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </PageBody>
    </main>
  );
}
