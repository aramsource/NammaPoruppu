"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Report, Ward } from "@/lib/domain";
import { useCity } from "@/context/city-context";
import { useTranslation } from "@/context/language-context";
import { categoryLabel } from "@/lib/i18n";
import { buildReportIssueUrl } from "@/lib/report-url";
import { buildWardElectedGroups } from "@/lib/representative-accountability";
import { WardElectedAccountability } from "@/components/ward-elected-accountability";
import { loadCityDashboardData } from "@/lib/load-city-dashboard-data";
import type { Representative } from "@/lib/domain";

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

export function HomePage() {
  const { city, cityReady } = useCity();
  const { t, locale } = useTranslation();
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportsSource, setReportsSource] = useState<Report[]>([]);
  const [wardsSource, setWardsSource] = useState<Ward[]>([]);
  const [representativesSource, setRepresentativesSource] = useState<Representative[]>([]);

  useEffect(() => {
    if (!cityReady) return;
    let mounted = true;
    async function loadHomeData() {
      setLoading(true);
      setLoadError("");
      try {
        const { wards, reports, representatives } = await loadCityDashboardData(city.id);
        if (mounted) {
          setWardsSource(wards);
          setReportsSource(reports);
          setRepresentativesSource(representatives);
        }
      } catch (err: unknown) {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load home data");
          setWardsSource([]);
          setReportsSource([]);
          setRepresentativesSource([]);
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
    activeWardCount,
    hotIssues,
    wardElectedGroups,
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
    const activeWardCount = wardStats.filter((w) => w.total > 0).length;

    const hotIssues = [...reportsSource]
      .filter((r) => r.status === "open")
      .sort((a, b) => b.supportCount - a.supportCount)
      .slice(0, 3);

    const wardById = new Map(wardsSource.map((w) => [w.id, w]));
    const wardElectedGroups = buildWardElectedGroups(
      representativesSource,
      wardById,
      reportsSource,
    );

    return {
      totalReports,
      resolvedReports,
      openReports,
      totalSupport,
      resolutionRate,
      latestReports,
      resolvedThisWeek,
      latestDataAt,
      activeWardCount,
      hotIssues,
      wardElectedGroups,
    };
  }, [reportsSource, wardsSource, representativesSource]);

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
              href={buildReportIssueUrl({})}
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
              { label: t("home.wardCoverage"), value: `${activeWardCount}`, color: "text-accent-300" },
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
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("home.accountabilityData")}
            </span>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">{t("home.wardPerformance")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("home.wardPerformanceSubtitle", { city: city.name })}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-center">
              <p className="text-2xl font-black text-brand-400">{openReports}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{t("common.open")}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-center">
              <p className="text-2xl font-black text-emerald-400">{resolutionRate}%</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{t("home.cityResolutionRate")}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-center">
              <p className="text-2xl font-black text-white">{activeWardCount}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{t("home.wardCoverage")}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-black text-white">{t("home.repAccountability")}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("home.repAccountabilitySubtitle")}</p>
            <div className="mt-4">
              <WardElectedAccountability groups={wardElectedGroups} variant="dark" limit={15} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              {t("home.viewFullAnalytics")}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/explore-map"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/15"
            >
              {t("nav.exploreMap")}
              <span aria-hidden>→</span>
            </Link>
          </div>
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
            href={buildReportIssueUrl({})}
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
