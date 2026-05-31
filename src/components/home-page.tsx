"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { issueCategories, Report, Ward } from "@/lib/domain";
import { useCity } from "@/context/city-context";
import { useTranslation } from "@/context/language-context";
import { categoryLabel } from "@/lib/i18n";
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

const stepsMeta = [
  { num: "01", numBg: "bg-brand-600", cardBg: "bg-brand-50 ring-brand-100", titleKey: "home.step1Title", descKey: "home.step1Desc" },
  { num: "02", numBg: "bg-accent-600", cardBg: "bg-accent-50 ring-accent-100", titleKey: "home.step2Title", descKey: "home.step2Desc" },
  { num: "03", numBg: "bg-emerald-600", cardBg: "bg-emerald-50 ring-emerald-100", titleKey: "home.step3Title", descKey: "home.step3Desc" },
];

type WardApiRow = {
  id: string;
  wardNumber: number;
  wardName: string;
  zoneName: string;
  city: string;
  assemblyConstituency: string;
};

export function HomePage() {
  const { city, cityReady } = useCity();
  const { t, locale } = useTranslation();
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportsSource, setReportsSource] = useState<Report[]>([]);
  const [wardsSource, setWardsSource] = useState<Ward[]>([]);

  useEffect(() => {
    if (!cityReady) return;
    let mounted = true;
    async function loadHomeData() {
      setLoading(true);
      setLoadError("");
      try {
        const [reportsRes, imagesRes, wardsApiRes] = await Promise.all([
          supabaseClient
            .from("reports")
            .select("*")
            .eq("city_id", city.id)
            .order("created_at", { ascending: false })
            .limit(500),
          supabaseClient
            .from("report_images")
            .select("report_id,image_url,created_at")
            .order("created_at", { ascending: true }),
          fetch(`/api/wards?cityId=${encodeURIComponent(city.id)}`, { cache: "no-store" }),
        ]);

        if (reportsRes.error) throw reportsRes.error;
        if (imagesRes.error) throw imagesRes.error;
        if (!wardsApiRes.ok) {
          throw new Error(`Failed to load wards (${wardsApiRes.status})`);
        }

        const wardsPayload = (await wardsApiRes.json()) as {
          data?: WardApiRow[];
          error?: string;
        };
        if (wardsPayload.error) throw new Error(wardsPayload.error);

        const wards: Ward[] = (wardsPayload.data ?? []).map((w) => ({
          id: w.id,
          wardNumber: w.wardNumber,
          wardName: w.wardName,
          zoneName: w.zoneName,
          city: w.city,
          assemblyConstituency: w.assemblyConstituency,
          boundary: [],
        }));

        const wardById = new Map(wards.map((w) => [w.id, w]));
        const imageMap = new Map<string, string[]>();
        for (const img of imagesRes.data ?? []) {
          const reportId = String(img.report_id ?? "");
          const imageUrl = String(img.image_url ?? "");
          if (!reportId || !imageUrl) continue;
          const arr = imageMap.get(reportId) ?? [];
          arr.push(imageUrl);
          imageMap.set(reportId, arr);
        }

        const reports: Report[] = (reportsRes.data ?? [])
          .map((r) => {
            const ward = wardById.get(String(r.ward_id));
            if (!ward) return null;
            return {
              id: String(r.id),
              userId: "anon",
              category: r.category as Report["category"],
              description: (r.description as string | null) ?? null,
              lat: Number(r.lat),
              lng: Number(r.lng),
              address: String(r.display_address ?? ""),
              status: r.status as Report["status"],
              supportCount: Number(r.support_count ?? 0),
              createdAt: String(r.created_at),
              governance: {
                wardId: ward.id,
                wardName: ward.wardName,
                wardNumber: ward.wardNumber,
                zoneName: ward.zoneName,
                city: ward.city,
                assemblyConstituency: ward.assemblyConstituency,
              },
              imageUrls: imageMap.get(String(r.id)) ?? [],
            } as Report;
          })
          .filter(Boolean) as Report[];

        if (mounted) {
          setWardsSource(wards);
          setReportsSource(reports);
        }
      } catch (err: unknown) {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load home data");
          setWardsSource([]);
          setReportsSource([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHomeData();
    return () => {
      mounted = false;
    };
  }, [city.id, cityReady]);

  const {
    totalReports,
    resolvedReports,
    openReports,
    totalSupport,
    resolutionRate,
    latestReports,
    resolvedThisWeek,
    latestDataAt,
    activeWardStats,
    wardTableRows,
    bestWards,
    worstWards,
    catStats,
    hotIssues,
  } = useMemo(() => {
    const totalReports = reportsSource.length;
    const resolvedReports = reportsSource.filter((r) => r.status === "resolved").length;
    const openReports = totalReports - resolvedReports;
    const totalSupport = reportsSource.reduce((s, r) => s + r.supportCount, 0);
    const resolutionRate = Math.round((resolvedReports / Math.max(totalReports, 1)) * 100);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const latestReports = reportsSource.filter((r) => new Date(r.createdAt).getTime() >= oneWeekAgo).length;
    const resolvedThisWeek = reportsSource.filter(
      (r) => r.status === "resolved" && new Date(r.createdAt).getTime() >= oneWeekAgo,
    ).length;
    const latestDataAt = reportsSource.length
      ? new Date(
          Math.max(...reportsSource.map((r) => new Date(r.createdAt).getTime())),
        ).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : null;

    const wardStats = wardsSource
      .map((w) => {
        const reports = reportsSource.filter((r) => r.governance.wardId === w.id);
        const total = reports.length;
        const resolved = reports.filter((r) => r.status === "resolved").length;
        const open = total - resolved;
        const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
        return { ward: w, total, resolved, open, rate };
      })
      .sort((a, b) => b.total - a.total);
    const activeWardStats = wardStats.filter((w) => w.total > 0);
    const wardTableRows = activeWardStats.slice(0, 10);
    const bestWards = [...activeWardStats].sort((a, b) => b.rate - a.rate).slice(0, 2);
    const worstWards = [...activeWardStats].sort((a, b) => a.rate - b.rate).slice(0, 2);

    const catStats = issueCategories
      .map((cat) => {
        const reports = reportsSource.filter((r) => r.category === cat);
        const resolved = reports.filter((r) => r.status === "resolved").length;
        return { cat, total: reports.length, resolved, open: reports.length - resolved };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const hotIssues = [...reportsSource]
      .filter((r) => r.status === "open")
      .sort((a, b) => b.supportCount - a.supportCount)
      .slice(0, 3);

    return {
      totalReports,
      resolvedReports,
      openReports,
      totalSupport,
      resolutionRate,
      latestReports,
      resolvedThisWeek,
      latestDataAt,
      activeWardStats,
      wardTableRows,
      bestWards,
      worstWards,
      catStats,
      hotIssues,
    };
  }, [reportsSource, wardsSource]);

  return (
    <main className="min-h-[calc(100vh-64px)]">

      {/* ── Hero ── accent-blue */}
      <section className="relative overflow-hidden bg-accent-600">

        <div className="relative mx-auto max-w-5xl px-4 pt-12 pb-12 md:pt-28 md:pb-20">
          {loadError ? (
            <p className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {t("home.liveDataUnavailable", { error: loadError })}
            </p>
          ) : null}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white ring-1 ring-amber-300/25">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
            {city.name} · {t("city.live")}
          </div>

          <h1 className="mt-5 font-black leading-[0.98] tracking-tight text-white md:mt-7 md:leading-[1.05]">
            <span className="block text-[4.1rem] md:text-8xl lg:text-[6.5rem]">{t("home.heroLine1")}</span>
            <span className="mt-2 inline-block -rotate-1 rounded-2xl bg-brand-600 px-4 py-1.5 text-[3.5rem] md:mt-3 md:px-5 md:py-2 md:text-7xl lg:text-[5.5rem]">
              {t("home.heroLine2")}
            </span>
          </h1>

          <p className="mt-6 max-w-md text-[1.05rem] font-medium leading-relaxed text-white/90 md:mt-7 md:text-lg">
            {t("home.heroSubtitle", { city: city.name })}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8 md:gap-4">
            <Link
              href="/report-issue"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-black text-white transition hover:bg-brand-700 active:scale-[0.98] md:px-7 md:py-4"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("home.reportAnIssue")}
            </Link>
            <Link
              href="/explore-map"
              className="flex items-center gap-2 text-base font-bold text-white/75 transition hover:text-white md:text-sm"
            >
              {t("home.exploreTheMap")}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

      </section>

      {/* ── Civic proof strip (below hero) ── */}
      <section className="border-y border-white/10 bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/55">{t("home.civicProof", { city: city.name })}</p>
            {latestDataAt ? (
              <p className="text-[11px] text-slate-400">{t("home.lastUpdated", { time: latestDataAt })}</p>
            ) : loading ? (
              <p className="text-[11px] text-slate-400">{t("common.loading")}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { label: t("home.latestReports"), value: latestReports, color: "text-amber-300" },
              { label: t("home.resolvedThisWeek"), value: resolvedThisWeek, color: "text-emerald-400" },
              { label: t("home.wardCoverage"), value: `${activeWardStats.length}`, color: "text-accent-300" },
              { label: t("home.communitySupports"), value: `${totalSupport}+`, color: "text-brand-300" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`px-4 py-5 text-center ${i % 2 === 0 ? "border-r border-white/10 sm:border-r" : ""} ${i < 2 ? "border-b border-white/10 sm:border-b-0" : ""} ${i < 3 ? "sm:border-r border-white/10" : ""}`}
              >
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/45">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border text-center border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {t("home.verificationNote")}
          </div>
        </div>
      </section>

      {/* ── How it works ── dark */}
      <section className="bg-slate-900 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("home.howItWorks")}
            </span>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
              {t("home.howItWorksTitle")}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stepsMeta.map((s) => (
              <div key={s.num} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white ${s.numBg}`}>
                  {s.num}
                </span>
                <h3 className="mt-4 text-base font-black text-white">{t(s.titleKey)}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Issues ── white */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                {t("home.liveUpdates")}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{t("home.trendingIssues")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("home.trendingSubtitle", { city: city.name })}</p>
            </div>
            <Link href="/explore-map" className="mt-1 flex shrink-0 items-center gap-1 text-sm font-bold text-accent-600 hover:underline">
              {t("common.viewAll")}
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <div className="mt-8 space-y-3">
            {hotIssues.length > 0 ? hotIssues.map((r, i) => (
              <Link
                key={r.id}
                href={`/explore-map?reportId=${encodeURIComponent(r.id)}&wardId=${encodeURIComponent(r.governance.wardId)}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-accent-200 hover:bg-accent-50"
              >
                <span className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-white ${i === 0 ? "bg-brand-600" : i === 1 ? "bg-accent-600" : "bg-slate-400"}`}>
                  #{i + 1}
                </span>
                <span className="text-2xl">{CAT_ICON[r.category] ?? "📌"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-slate-900">{categoryLabel(locale, r.category)}</p>
                  <p className="truncate text-xs text-slate-400">{r.address}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-brand-600">{r.supportCount} {t("common.supports")}</p>
                  <p className="text-[11px] text-slate-400">{r.governance.wardName}</p>
                </div>
              </Link>
            )) : (
              <p className="rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-400">
                {loading ? t("home.loadingIssues") : t("home.noOpenIssues", { city: city.name })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Ward Performance ── dark */}
      <section className="bg-slate-900 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t("home.accountabilityData")}
              </span>
              <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">{t("home.wardPerformance")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("home.wardPerformanceSubtitle", { city: city.name })}</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-400">
              {t("home.resolvedCityWide", { rate: resolutionRate })}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="flex items-center gap-2 mb-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/20 text-base">🔴</span>
                <div>
                  <p className="text-sm font-black text-white">{t("home.needsAttention")}</p>
                  <p className="text-[11px] text-slate-500">{t("home.lowestResolution")}</p>
                </div>
              </div>
              <div className="space-y-4">
                {worstWards.map((ws) => (
                  <Link key={ws.ward.id} href={`/explore-map?wardId=${encodeURIComponent(ws.ward.id)}`} className="block">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-white">{ws.ward.wardName} <span className="text-[10px] font-normal text-slate-500">{ws.ward.zoneName}</span></p>
                      <span className="text-xs font-black text-brand-400">{ws.rate}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${ws.rate}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      <span className="text-brand-400 font-semibold">{ws.open} open</span> · {ws.resolved} resolved · {ws.total} total
                    </p>
                  </Link>
                ))}
                {worstWards.length === 0 && <p className="text-sm text-slate-500">{loading ? t("common.loading") : t("home.noDataYet")}</p>}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="flex items-center gap-2 mb-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-base">🟢</span>
                <div>
                  <p className="text-sm font-black text-white">{t("home.topPerformers")}</p>
                  <p className="text-[11px] text-slate-500">{t("home.highestResolution")}</p>
                </div>
              </div>
              <div className="space-y-4">
                {bestWards.map((ws) => (
                  <Link key={ws.ward.id} href={`/explore-map?wardId=${encodeURIComponent(ws.ward.id)}`} className="block">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-white">{ws.ward.wardName} <span className="text-[10px] font-normal text-slate-500">{ws.ward.zoneName}</span></p>
                      <span className="text-xs font-black text-emerald-400">{ws.rate}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${ws.rate}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      <span className="text-emerald-400 font-semibold">{ws.resolved} resolved</span> · {ws.open} open · {ws.total} total
                    </p>
                  </Link>
                ))}
                {bestWards.length === 0 && <p className="text-sm text-slate-500">{loading ? t("common.loading") : t("home.noDataYet")}</p>}
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 border-b border-white/10 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>{t("home.ward")}</span>
              <span className="text-right">{t("common.total")}</span>
              <span className="text-right">{t("common.open")}</span>
              <span className="text-right">{t("common.resolved")}</span>
              <span className="text-right">{t("home.rate")}</span>
            </div>
            {wardTableRows.map((ws) => (
              <Link
                key={ws.ward.id}
                href={`/explore-map?wardId=${encodeURIComponent(ws.ward.id)}`}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 border-b border-white/5 px-5 py-3 text-sm last:border-0 hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="font-bold text-white">{ws.ward.wardName}</p>
                  <p className="text-[10px] text-slate-500">{ws.ward.zoneName}</p>
                </div>
                <span className="text-right font-semibold text-slate-300">{ws.total}</span>
                <span className={`text-right font-bold ${ws.open > 0 ? "text-brand-400" : "text-slate-600"}`}>{ws.open}</span>
                <span className={`text-right font-bold ${ws.resolved > 0 ? "text-emerald-400" : "text-slate-600"}`}>{ws.resolved}</span>
                <span className={`min-w-[3rem] rounded-full px-2 py-0.5 text-center text-[11px] font-black ${
                  ws.rate >= 60 ? "bg-emerald-500/20 text-emerald-400" :
                  ws.rate >= 30 ? "bg-amber-500/20 text-amber-400" :
                  ws.total > 0 ? "bg-brand-500/20 text-brand-400" : "bg-white/10 text-slate-500"
                }`}>
                  {ws.rate}%
                </span>
              </Link>
            ))}
            {wardTableRows.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-500">{loading ? t("home.loadingWardData") : t("home.noWardReports")}</p>
            )}
          </div>

          {catStats.length > 0 && (
            <div className="mt-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">{t("home.issuesByCategory")}</h3>
              <div className="space-y-3">
                {catStats.map((c) => {
                  const maxTotal = Math.max(...catStats.map((x) => x.total));
                  return (
                    <div key={c.cat} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-xs font-medium text-slate-400 truncate">{categoryLabel(locale, c.cat)}</span>
                      <div className="flex-1 relative h-4 overflow-hidden rounded-full bg-white/10">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-brand-500/50" style={{ width: `${(c.total / maxTotal) * 100}%` }} />
                        <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500" style={{ width: `${(c.resolved / maxTotal) * 100}%` }} />
                      </div>
                      <span className="w-8 shrink-0 text-right text-xs font-black text-white">{c.total}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> {t("home.resolvedLegend")}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500/50 inline-block" /> {t("home.openLegend")}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── accent-blue */}
      <section className="bg-accent-600 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center text-white">
          <span className="inline-block rounded-full bg-amber-300/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-100">
            {t("home.ctaEyebrow")}
          </span>
          <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="mt-4 text-accent-200">
            {t("home.ctaSubtitle", { city: city.name })}
          </p>
          <Link
            href="/report-issue"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-sm font-bold text-white transition hover:bg-brand-700 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t("common.reportNow")}
          </Link>
        </div>
      </section>

    </main>
  );
}
