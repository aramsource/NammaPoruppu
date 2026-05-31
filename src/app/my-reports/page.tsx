"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageBody, PageHero } from "@/components/site-page-shell";
import { Report } from "@/lib/domain";
import { useAuth } from "@/context/auth-context";
import { useCity } from "@/context/city-context";
import { useTranslation } from "@/context/language-context";
import { statusLabel } from "@/lib/i18n";
import { supabaseClient } from "@/lib/supabase/client";

const CAT_ICON: Record<string, string> = {
  Pothole: "🕳",
  Garbage: "🗑",
  Waterlogging: "🌊",
  "Sewage Leak": "💧",
  "Streetlight Issue": "💡",
  "Broken Footpath": "🚶",
  Drainage: "🏗",
  "Dust Pollution": "💨",
  Encroachment: "🚧",
  Other: "📌",
};

function daysAgoLabel(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

type Filter = "all" | "open" | "resolved" | "withdrawn";
type EscalationInfo = {
  id: string;
  status: string;
  createdAt: string;
  reason: string | null;
  escalationLevel: number | null;
  escalatorUserId: string | null;
};

const LEGACY_ESCALATION_REASON = "Escalated by reporter from My Reports";

function getEscalationReasonLabel(reason: string | null | undefined) {
  const clean = (reason ?? "").trim();
  if (!clean || clean === LEGACY_ESCALATION_REASON) {
    return "Issue is still unresolved and needs higher-level attention.";
  }
  return clean;
}

export default function MyReportsPage() {
  const { user } = useAuth();
  const { city, cityReady } = useCity();
  const { t, locale } = useTranslation();
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [escalationsByReportId, setEscalationsByReportId] = useState<Record<string, EscalationInfo>>({});
  const [escalatingReportId, setEscalatingReportId] = useState<string | null>(null);
  const [deletingEscalationReportId, setDeletingEscalationReportId] = useState<string | null>(null);
  const [confirmDeleteReportId, setConfirmDeleteReportId] = useState<string | null>(null);
  const [withdrawingReportId, setWithdrawingReportId] = useState<string | null>(null);
  const [confirmWithdrawReportId, setConfirmWithdrawReportId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  function pushToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  }

  function getSessionId() {
    if (typeof window === "undefined") return "server";
    const existing = localStorage.getItem("np_session_id");
    if (existing) return existing;
    const generated = `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    localStorage.setItem("np_session_id", generated);
    return generated;
  }
  useEffect(() => {
    if (!cityReady) return;
    let mounted = true;
    async function load() {
      try {
        const [
          { data: reports, error: repErr },
          { data: images, error: imgErr },
          { data: wards, error: wardErr },
          { data: escalations, error: escalationErr },
        ] = await Promise.all([
          supabaseClient
            .from("reports")
            .select("id, category, description, lat, lng, display_address, status, support_count, created_at, ward_id, reporter_user_id, city_id")
            .eq("city_id", city.id)
            .order("created_at", { ascending: false })
            .limit(50),
          supabaseClient
            .from("report_images")
            .select("report_id, image_url, created_at")
            .order("created_at", { ascending: true }),
          supabaseClient
            .from("wards")
            .select("id, ward_name, ward_number, zone_name, assembly_constituency, city_id")
            .eq("city_id", city.id),
          supabaseClient
            .from("report_escalations")
            .select("id, report_id, status, created_at, reason, escalation_level, escalator_user_id")
            .order("created_at", { ascending: false }),
        ]);
        if (repErr) throw repErr;
        if (imgErr) throw imgErr;
        if (wardErr) throw wardErr;
        if (escalationErr) throw escalationErr;
        const wardById = new Map(
          (wards ?? []).map((w) => [w.id, w]),
        );
        const imageMap = new Map<string, string[]>();
        for (const img of images ?? []) {
          const arr = imageMap.get(img.report_id) ?? [];
          arr.push(img.image_url);
          imageMap.set(img.report_id, arr);
        }
        const mapped: Report[] = (reports ?? [])
          .map((r) => {
            const ward = wardById.get(r.ward_id);
            if (!ward) return null;
            return {
              id: r.id,
              userId: "anon",
              category: r.category as Report["category"],
              description: r.description,
              lat: r.lat,
              lng: r.lng,
              address: r.display_address,
              status: r.status as Report["status"],
              supportCount: r.support_count ?? 0,
              createdAt: r.created_at,
              governance: {
                wardId: ward.id,
                wardName: ward.ward_name,
                wardNumber: ward.ward_number,
                zoneName: ward.zone_name,
                city: city.name,
                assemblyConstituency: ward.assembly_constituency ?? "Unknown",
              },
              imageUrls: imageMap.get(r.id) ?? [],
              reporterUserId: r.reporter_user_id ?? null,
            } as Report;
          })
          .filter(Boolean) as Report[];
        const escalationMap: Record<string, EscalationInfo> = {};
        for (const esc of escalations ?? []) {
          if (!escalationMap[esc.report_id]) {
            escalationMap[esc.report_id] = {
              status: esc.status,
              createdAt: esc.created_at,
              reason: esc.reason ?? null,
              escalationLevel: esc.escalation_level ?? null,
              id: esc.id,
              escalatorUserId: esc.escalator_user_id ?? null,
            };
          }
        }
        if (mounted) {
          setMyReports(mapped);
          setEscalationsByReportId(escalationMap);
        }
      } catch (err: unknown) {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load reports");
        }
      }
    }
    load();
    return () => { mounted = false; };
  }, [city.id, cityReady]);

  async function handleEscalate(reportId: string) {
    if (escalatingReportId) return;
    if (escalationsByReportId[reportId]?.status === "open") return;
    setEscalatingReportId(reportId);
    try {
      const { data, error } = await supabaseClient
        .from("report_escalations")
        .insert({
          report_id: reportId,
          escalator_session_id: getSessionId(),
          escalator_user_id: user?.id ?? null,
          reason: "Issue is still unresolved and needs higher-level attention.",
          escalation_level: 1,
          status: "open",
        })
        .select("id, report_id, status, created_at, reason, escalation_level, escalator_user_id")
        .single();
      if (error) throw error;
      if (data) {
        setEscalationsByReportId((prev) => ({
          ...prev,
          [data.report_id]: {
            status: data.status,
            createdAt: data.created_at,
            reason: data.reason ?? null,
            escalationLevel: data.escalation_level ?? null,
            id: data.id,
            escalatorUserId: data.escalator_user_id ?? null,
          },
        }));
        pushToast("success", "Escalation created.");
      }
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: string }).message)
          : "Could not escalate this issue right now.";
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
        setEscalationsByReportId((prev) => ({
          ...prev,
          [reportId]: {
            status: "open",
            createdAt: new Date().toISOString(),
            reason: "Issue is still unresolved and needs higher-level attention.",
            escalationLevel: 1,
            id: "unknown",
            escalatorUserId: user?.id ?? null,
          },
        }));
        pushToast("success", "Escalation already exists.");
      } else {
        pushToast("error", msg);
      }
    } finally {
      setEscalatingReportId(null);
    }
  }

  async function handleDeleteEscalation(reportId: string) {
    const escalation = escalationsByReportId[reportId];
    if (!escalation || !user || escalation.escalatorUserId !== user.id) {
      pushToast("error", "Only the user who escalated can hard-delete this escalation.");
      return;
    }
    setDeletingEscalationReportId(reportId);
    try {
      const { error } = await supabaseClient
        .from("report_escalations")
        .delete()
        .eq("id", escalation.id)
        .eq("escalator_user_id", user.id);
      if (error) throw error;
      setEscalationsByReportId((prev) => {
        const next = { ...prev };
        delete next[reportId];
        return next;
      });
      setConfirmDeleteReportId(null);
      pushToast("success", "Escalation removed.");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: string }).message)
          : "Could not delete escalation.";
      pushToast("error", msg);
    } finally {
      setDeletingEscalationReportId(null);
    }
  }

  async function handleWithdraw(reportId: string) {
    if (!user) return;
    setWithdrawingReportId(reportId);
    try {
      const { error } = await supabaseClient
        .from("reports")
        .update({ status: "withdrawn" })
        .eq("id", reportId)
        .eq("reporter_user_id", user.id);
      if (error) throw error;
      setMyReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "withdrawn" as const } : r))
      );
      setConfirmWithdrawReportId(null);
      pushToast("success", "Report withdrawn from public map.");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: string }).message)
          : "Could not withdraw this report.";
      pushToast("error", msg);
    } finally {
      setWithdrawingReportId(null);
    }
  }

  const filtered = useMemo(() => myReports.filter((r) =>
    filter === "all" ? true : r.status === filter
  ), [myReports, filter]);

  const openCount = myReports.filter((r) => r.status === "open").length;
  const resolvedCount = myReports.filter((r) => r.status === "resolved").length;
  const withdrawnCount = myReports.filter((r) => r.status === "withdrawn").length;

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow={t("myReports.eyebrow")}
        title={t("myReports.title")}
        subtitle={t("myReports.subtitle", { city: city.name })}
        tone="accent"
        containerWidth="2xl"
        actions={
          <Link
            href="/report-issue"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            + {t("common.newReport")}
          </Link>
        }
      />
      <PageBody maxWidth="2xl">
        {loadError ? (
          <p className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-700">
            Failed to load from Supabase: {loadError}
          </p>
        ) : null}
        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("common.total"), value: myReports.length, color: "text-slate-900" },
            { label: t("common.open"), value: openCount, color: "text-brand-600" },
            { label: t("common.resolved"), value: resolvedCount, color: "text-emerald-600" },
            { label: t("common.withdrawn"), value: withdrawnCount, color: "text-slate-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white px-4 py-4 text-center ring-1 ring-slate-200">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mt-6 flex gap-1 rounded-full bg-slate-200/60 p-1">
          {(["all", "open", "resolved", "withdrawn"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-full py-1.5 text-xs font-semibold capitalize transition ${
                filter === f
                  ? f === "open"
                    ? "bg-brand-600 text-white"
                    : f === "resolved"
                    ? "bg-emerald-600 text-white"
                    : f === "withdrawn"
                    ? "bg-slate-500 text-white"
                    : "bg-white text-slate-900 ring-1 ring-slate-300"
                  : "text-slate-500"
              }`}
            >
              {f === "all" ? t("common.all") : statusLabel(locale, f)}
            </button>
          ))}
        </div>

        {/* Report cards */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200">
              <p className="text-3xl">📭</p>
              <p className="mt-3 font-semibold text-slate-700">No {filter} reports</p>
              <p className="mt-1 text-sm text-slate-400">
                {filter === "open" ? "All your issues have been resolved!" : "You have no resolved reports yet."}
              </p>
            </div>
          )}

          {filtered.map((r) => (
            // Latest escalation row controls the badge/action state.
            // "open" means this report is currently escalated.
            <div key={r.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
              <div className="flex gap-4 p-4">
                {/* Thumb */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {r.imageUrls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      {CAT_ICON[r.category] ?? "📌"}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                        <span>{CAT_ICON[r.category] ?? "📌"}</span>
                        {r.category}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{r.address}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      r.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "withdrawn"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-brand-100 text-brand-700"
                    }`}>
                      {r.status === "resolved" ? "✓ Resolved" : r.status === "withdrawn" ? "Withdrawn" : "Open"}
                    </span>
                  </div>

                  {r.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{r.description}</p>
                  )}

                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{daysAgoLabel(r.createdAt)}</span>
                    <span>·</span>
                    <span>{r.governance.wardName}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-600">👍 {r.supportCount} supports</span>
                  </div>
                  {escalationsByReportId[r.id] && (
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                      <p className="font-semibold">
                        Escalation {escalationsByReportId[r.id].escalationLevel ? `L${escalationsByReportId[r.id].escalationLevel}` : ""}
                        {" · "}
                        {escalationsByReportId[r.id].status}
                      </p>
                      <p className="mt-0.5">
                        {new Date(escalationsByReportId[r.id].createdAt).toLocaleString()}
                      </p>
                      {escalationsByReportId[r.id].reason ? (
                        <p className="mt-0.5 line-clamp-2">{getEscalationReasonLabel(escalationsByReportId[r.id].reason)}</p>
                      ) : null}
                      {user && escalationsByReportId[r.id].escalatorUserId === user.id ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteReportId(r.id)}
                          disabled={deletingEscalationReportId === r.id}
                          className="mt-2 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                        >
                          {deletingEscalationReportId === r.id ? "Removing..." : "Remove Escalation"}
                        </button>
                      ) : null}
                    </div>
                  )}

                  {/* Withdrawn notice */}
                  {r.status === "withdrawn" && (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                      This report has been withdrawn and is no longer visible on the public map.
                    </div>
                  )}

                  {/* Withdraw button - only for the reporter, on open reports */}
                  {user && r.reporterUserId === user.id && r.status === "open" && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmWithdrawReportId(r.id)}
                        className="text-[11px] text-slate-400 transition hover:text-brand-600 hover:underline"
                      >
                        Withdraw report
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="flex border-t border-slate-100">
                {r.status !== "withdrawn" ? (
                  <Link
                    href={`/explore-map?reportId=${encodeURIComponent(r.id)}&wardId=${encodeURIComponent(r.governance.wardId)}`}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                    </svg>
                    View on Map
                  </Link>
                ) : (
                  <div className="flex flex-1 items-center justify-center py-2.5 text-xs text-slate-400">
                    Not visible on map
                  </div>
                )}
                {r.status === "open" && (
                  <>
                    <div className="w-px bg-slate-100" />
                    {escalationsByReportId[r.id]?.status === "open" ? (
                      <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-amber-700 bg-amber-50">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                        </svg>
                        Escalated
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={escalatingReportId === r.id}
                        onClick={() => handleEscalate(r.id)}
                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                        {escalatingReportId === r.id ? "Escalating..." : "Escalate"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if no reports at all */}
        {myReports.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-5xl">📍</p>
            <h2 className="mt-4 text-lg font-bold text-slate-700">No reports yet</h2>
            <p className="mt-2 text-sm text-slate-400">Be the first to report a civic issue in your area.</p>
            <Link
              href="/report-issue"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Report an Issue
            </Link>
          </div>
        )}

        {/* Withdraw confirmation modal */}
        {confirmWithdrawReportId && (() => {
          const target = myReports.find((r) => r.id === confirmWithdrawReportId);
          const hasSupports = (target?.supportCount ?? 0) > 0;
          return (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 px-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 ring-2 ring-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Withdraw this report?</h3>
                <p className="mt-1.5 text-xs text-slate-500">
                  It will be removed from the public map and search. You can still see it here in your reports list.
                </p>
                {hasSupports && (
                  <p className="mt-2 text-xs font-semibold text-amber-600">
                    {target!.supportCount} {target!.supportCount === 1 ? "person has" : "people have"} supported this report - withdrawing will also hide their signal.
                  </p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmWithdrawReportId(null)}
                    className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWithdraw(confirmWithdrawReportId)}
                    disabled={withdrawingReportId === confirmWithdrawReportId}
                    className="rounded-lg bg-slate-700 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {withdrawingReportId === confirmWithdrawReportId ? "Withdrawing..." : "Withdraw"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {confirmDeleteReportId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 ring-2 ring-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Remove escalation?</h3>
              <p className="mt-1.5 text-xs text-slate-500">
                This will permanently delete the escalation record for this report.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteReportId(null)}
                  className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEscalation(confirmDeleteReportId)}
                  disabled={deletingEscalationReportId === confirmDeleteReportId}
                  className="rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {deletingEscalationReportId === confirmDeleteReportId ? "Removing..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
        {toast && (
          <div className="fixed right-4 top-20 z-[1100]">
            <div className={`rounded-xl px-4 py-2 text-xs font-semibold text-white ${
              toast.type === "success" ? "bg-emerald-600" : "bg-brand-600"
            }`}>
              {toast.message}
            </div>
          </div>
        )}
      </PageBody>
    </main>
  );
}
