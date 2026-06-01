"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnalyticsPagination } from "@/components/analytics-pagination";
import { AnalyticsSearchInput } from "@/components/analytics-search-input";
import { PaginatedRepAccountability } from "@/components/paginated-rep-accountability";
import { PageBody } from "@/components/site-page-shell";
import { WardElectedAccountability } from "@/components/ward-elected-accountability";
import { useCity } from "@/context/city-context";
import { useTranslation } from "@/context/language-context";
import { exportCityDataCsv } from "@/lib/analytics-export";
import {
  matchesAreaQuery,
  wardElectedGroupMatchesQuery,
  wardStatMatchesQuery,
} from "@/lib/analytics-search";
import { computeCityAnalytics } from "@/lib/city-analytics";
import { categoryLabel } from "@/lib/i18n";
import { loadCityDashboardData } from "@/lib/load-city-dashboard-data";
import { usePaginatedSlice } from "@/lib/use-paginated-slice";
import type { WardStat } from "@/lib/city-analytics";

const WARD_PAGE_SIZE = 15;

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "brand" | "emerald" | "default";
}) {
  const valueCls =
    tone === "brand"
      ? "text-brand-600"
      : tone === "emerald"
        ? "text-emerald-600"
        : "text-slate-900";
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 text-center">
      <p className={`text-2xl font-black ${valueCls}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>
      {children}
    </div>
  );
}

export function CityAnalyticsPage() {
  const { city, cityReady } = useCity();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [wards, setWards] = useState<Awaited<ReturnType<typeof loadCityDashboardData>>["wards"]>([]);
  const [reports, setReports] = useState<Awaited<ReturnType<typeof loadCityDashboardData>>["reports"]>([]);
  const [representatives, setRepresentatives] = useState<
    Awaited<ReturnType<typeof loadCityDashboardData>>["representatives"]
  >([]);
  const [wardAreaSearchIndex, setWardAreaSearchIndex] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cityReady) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await loadCityDashboardData(city.id);
        if (mounted) {
          setWards(data.wards);
          setReports(data.reports);
          setRepresentatives(data.representatives);
          setWardAreaSearchIndex(data.wardAreaSearchIndex);
        }
      } catch (err: unknown) {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load analytics");
          setWards([]);
          setReports([]);
          setRepresentatives([]);
          setWardAreaSearchIndex({});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [city.id, cityReady]);

  const a = useMemo(
    () => computeCityAnalytics(reports, wards, representatives),
    [reports, wards, representatives],
  );

  const filteredWardStats = useMemo(
    () => a.activeWardStats.filter((ws) => wardStatMatchesQuery(areaSearch, ws.ward, wardAreaSearchIndex)),
    [a.activeWardStats, areaSearch, wardAreaSearchIndex],
  );

  const wardPagination = usePaginatedSlice<WardStat>(filteredWardStats, WARD_PAGE_SIZE, areaSearch);

  const filteredWorstWards = useMemo(() => {
    const pool = [...filteredWardStats].sort((x, y) => x.rate - y.rate);
    return pool.slice(0, 5);
  }, [filteredWardStats]);

  const filteredBestWards = useMemo(() => {
    const pool = [...filteredWardStats].sort((x, y) => y.rate - x.rate);
    return pool.slice(0, 5);
  }, [filteredWardStats]);

  const filteredWardElected = useMemo(
    () => a.wardElectedGroups.filter((g) => wardElectedGroupMatchesQuery(areaSearch, g, wardAreaSearchIndex)),
    [a.wardElectedGroups, areaSearch, wardAreaSearchIndex],
  );

  const filteredConstituencies = useMemo(
    () =>
      a.constituencyStats.filter((ac) =>
        matchesAreaQuery(areaSearch, [ac.constituency]),
      ),
    [a.constituencyStats, areaSearch],
  );

  const filteredZoneStats = useMemo(
    () => a.zoneStats.filter((z) => matchesAreaQuery(areaSearch, [z.zone])),
    [a.zoneStats, areaSearch],
  );

  const areaFilterActive = areaSearch.trim().length > 0;

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <section className="bg-slate-900 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
            {t("analytics.eyebrow")}
          </span>
          <h1 className="mt-4 text-3xl font-black text-white md:text-4xl">{t("analytics.title")}</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-400">
            {t("analytics.subtitle", { city: city.name })}
          </p>
          {a.latestDataAt ? (
            <p className="mt-2 text-xs text-slate-500">
              {t("analytics.lastUpdated", { time: a.latestDataAt })}
            </p>
          ) : null}

          <div className="mt-6">
            <button
              type="button"
              disabled={loading || (reports.length === 0 && representatives.length === 0)}
              onClick={() =>
                exportCityDataCsv(city.id, reports, representatives, a.repAccountability)
              }
              className="rounded-full bg-brand-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("analytics.exportData")}
            </button>
            <p className="mt-2 text-[11px] text-slate-500">{t("analytics.exportDataHint")}</p>
          </div>

          {loadError ? (
            <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {loadError}
            </p>
          ) : null}
        </div>
      </section>

      <PageBody maxWidth="5xl" className="py-8 md:py-10">
        <div className="flex flex-col gap-8 md:gap-10">
          {/* Ward / area search toolbar */}
          <SectionCard className="p-4 md:p-5">
            <label htmlFor="analytics-area-search" className="text-sm font-black text-slate-900">
              {t("analytics.searchWardArea")}
            </label>
            <p className="mt-0.5 text-xs text-slate-500">{t("analytics.searchWardAreaHint")}</p>
            <AnalyticsSearchInput
              id="analytics-area-search"
              value={areaSearch}
              onChange={setAreaSearch}
              placeholder={t("analytics.searchWardPlaceholder")}
              className="mt-3"
            />
            {areaFilterActive ? (
              <p className="mt-2 text-xs font-medium text-brand-700">
                {t("analytics.filteredWardCount", { count: filteredWardStats.length })}
                {" · "}
                <button
                  type="button"
                  onClick={() => setAreaSearch("")}
                  className="underline decoration-dotted"
                >
                  {t("analytics.clearSearch")}
                </button>
              </p>
            ) : null}
          </SectionCard>

          {/* Overview — city-wide */}
          <section>
            <h2 className="text-lg font-black text-slate-900">{t("analytics.overview")}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t("analytics.overviewHint")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label={t("common.total")} value={a.totalReports} />
              <StatCard label={t("common.open")} value={a.openReports} tone="brand" />
              <StatCard label={t("common.resolved")} value={a.resolvedReports} tone="emerald" />
              <StatCard label={t("home.cityResolutionRate")} value={`${a.resolutionRate}%`} tone="emerald" />
              <StatCard label={t("home.wardCoverage")} value={a.activeWardCount} />
              <StatCard label={t("home.communitySupports")} value={a.totalSupport} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <StatCard label={t("analytics.reportsThisWeek")} value={a.latestReports} />
              <StatCard label={t("analytics.resolvedThisWeek")} value={a.resolvedThisWeek} tone="emerald" />
            </div>
          </section>

          {/* Best / worst wards */}
          <section className="grid gap-4 md:grid-cols-2">
            <WardRankPanel
              title={t("home.needsAttention")}
              subtitle={t("home.lowestResolution")}
              icon="🔴"
              wards={filteredWorstWards}
              loading={loading}
              emptyLabel={areaFilterActive ? t("analytics.noSearchResults") : t("home.noDataYet")}
              loadingLabel={t("common.loading")}
              rateTone="brand"
            />
            <WardRankPanel
              title={t("home.topPerformers")}
              subtitle={t("home.highestResolution")}
              icon="🟢"
              wards={filteredBestWards}
              loading={loading}
              emptyLabel={areaFilterActive ? t("analytics.noSearchResults") : t("home.noDataYet")}
              loadingLabel={t("common.loading")}
              rateTone="emerald"
            />
          </section>

          {/* Full ward table */}
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-black text-slate-900">{t("analytics.allWards")}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{t("analytics.allWardsSubtitle")}</p>
            </div>
            <div>
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>{t("home.ward")}</span>
                <span className="text-right">{t("common.total")}</span>
                <span className="text-right">{t("common.open")}</span>
                <span className="text-right">{t("common.resolved")}</span>
                <span className="text-right">{t("home.rate")}</span>
              </div>
              {wardPagination.slice.map((ws) => (
                <Link
                  key={ws.ward.id}
                  href={`/explore-map?wardId=${encodeURIComponent(ws.ward.id)}`}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 border-b border-slate-50 px-5 py-3 text-sm transition-colors last:border-0 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-bold text-slate-900">{ws.ward.wardName}</p>
                    <p className="text-[10px] text-slate-500">
                      {t("home.ward")} {ws.ward.wardNumber} · {ws.ward.zoneName}
                    </p>
                  </div>
                  <span className="text-right font-semibold text-slate-600">{ws.total}</span>
                  <span className={`text-right font-bold ${ws.open > 0 ? "text-brand-600" : "text-slate-400"}`}>
                    {ws.open}
                  </span>
                  <span className={`text-right font-bold ${ws.resolved > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    {ws.resolved}
                  </span>
                  <span
                    className={`min-w-[3rem] rounded-full px-2 py-0.5 text-center text-[11px] font-black ${
                      ws.rate >= 60
                        ? "bg-emerald-100 text-emerald-700"
                        : ws.rate >= 30
                          ? "bg-amber-100 text-amber-800"
                          : "bg-brand-100 text-brand-700"
                    }`}
                  >
                    {ws.rate}%
                  </span>
                </Link>
              ))}
              {filteredWardStats.length === 0 && (
                <p className="px-5 py-6 text-sm text-slate-500">
                  {loading
                    ? t("home.loadingWardData")
                    : areaFilterActive
                      ? t("analytics.noSearchResults")
                      : t("home.noWardReports")}
                </p>
              )}
              <AnalyticsPagination
                page={wardPagination.page}
                totalPages={wardPagination.totalPages}
                rangeStart={wardPagination.rangeStart}
                rangeEnd={wardPagination.rangeEnd}
                total={wardPagination.total}
                onPageChange={wardPagination.setPage}
              />
            </div>
          </SectionCard>

          {/* Category + zone */}
          <section className="grid gap-4 lg:grid-cols-2">
            <BarBreakdown
              title={t("home.issuesByCategory")}
              rows={a.catStats.map((c) => ({
                key: c.cat,
                label: categoryLabel(locale, c.cat),
                total: c.total,
                resolved: c.resolved,
              }))}
              loading={loading}
              emptyLabel={t("home.noDataYet")}
              resolvedLegend={t("home.resolvedLegend")}
              openLegend={t("home.openLegend")}
            />
            <BarBreakdown
              title={t("analytics.byZone")}
              rows={filteredZoneStats.map((z) => ({
                key: z.zone,
                label: z.zone,
                total: z.total,
                resolved: z.resolved,
              }))}
              loading={loading}
              emptyLabel={areaFilterActive ? t("analytics.noSearchResults") : t("home.noDataYet")}
              resolvedLegend={t("home.resolvedLegend")}
              openLegend={t("home.openLegend")}
            />
          </section>

          {/* Assembly constituencies */}
          {(filteredConstituencies.length > 0 || !areaFilterActive) && (
            <SectionCard>
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-black text-slate-900">{t("analytics.byConstituency")}</h2>
                <p className="mt-0.5 text-sm text-slate-500">{t("analytics.byConstituencySubtitle")}</p>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredConstituencies.map((ac) => (
                  <div
                    key={ac.constituency}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{ac.constituency}</p>
                      <p className="text-[10px] text-slate-500">
                        {t("analytics.wardsInAc", { count: ac.wardCount })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="text-brand-600">
                        {ac.open} {t("common.open")}
                      </span>
                      <span className="text-emerald-600">
                        {ac.resolved} {t("common.resolved")}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-black text-slate-700">
                        {ac.rate}%
                      </span>
                    </div>
                  </div>
                ))}
                {filteredConstituencies.length === 0 && areaFilterActive ? (
                  <p className="px-5 py-6 text-sm text-slate-500">{t("analytics.noSearchResults")}</p>
                ) : null}
              </div>
            </SectionCard>
          )}

          {/* Elected by ward */}
          <section>
            <h2 className="text-lg font-black text-slate-900">{t("home.repAccountability")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("home.repAccountabilitySubtitle")}</p>
            <div className="mt-4">
              <WardElectedAccountability groups={filteredWardElected} variant="light" limit={50} />
            </div>
          </section>

          {/* Paginated representatives */}
          <section>
            <h2 className="text-lg font-black text-slate-900">{t("analytics.allRepresentatives")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("analytics.allRepresentativesSubtitle")}</p>
            <div className="mt-4">
              <PaginatedRepAccountability
                rows={a.repAccountability}
                representativeCount={representatives.length}
                localityIndex={wardAreaSearchIndex}
              />
            </div>
          </section>
        </div>
      </PageBody>
    </main>
  );
}

function WardRankPanel({
  title,
  subtitle,
  icon,
  wards,
  loading,
  emptyLabel,
  loadingLabel,
  rateTone,
}: {
  title: string;
  subtitle: string;
  icon: string;
  wards: {
    ward: { id: string; wardName: string; zoneName: string };
    rate: number;
    open: number;
    resolved: number;
    total: number;
  }[];
  loading: boolean;
  emptyLabel: string;
  loadingLabel: string;
  rateTone: "brand" | "emerald";
}) {
  const rateCls = rateTone === "brand" ? "text-brand-600" : "text-emerald-600";
  const barCls = rateTone === "brand" ? "bg-brand-500" : "bg-emerald-500";
  const openCls = rateTone === "brand" ? "text-brand-600" : "text-emerald-600";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base">{icon}</span>
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
        {wards.map((ws) => (
          <Link key={ws.ward.id} href={`/explore-map?wardId=${encodeURIComponent(ws.ward.id)}`} className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">
                {ws.ward.wardName}{" "}
                <span className="text-[10px] font-normal text-slate-500">{ws.ward.zoneName}</span>
              </p>
              <span className={`text-xs font-black ${rateCls}`}>{ws.rate}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${barCls}`} style={{ width: `${ws.rate}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              <span className={`font-semibold ${openCls}`}>{ws.open} open</span> · {ws.resolved} resolved ·{" "}
              {ws.total} total
            </p>
          </Link>
        ))}
        {wards.length === 0 && (
          <p className="text-sm text-slate-500">{loading ? loadingLabel : emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

function BarBreakdown({
  title,
  rows,
  loading,
  emptyLabel,
  resolvedLegend,
  openLegend,
}: {
  title: string;
  rows: { key: string; label: string; total: number; resolved: number }[];
  loading: boolean;
  emptyLabel: string;
  resolvedLegend: string;
  openLegend: string;
}) {
  const maxTotal = Math.max(...rows.map((r) => r.total), 1);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">{title}</h3>
      {rows.length > 0 ? (
        <>
          <div className="mt-4 space-y-3">
            {rows.map((r) => (
              <div key={r.key} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs font-medium text-slate-600 sm:w-36">{r.label}</span>
                <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-brand-300/60"
                    style={{ width: `${(r.total / maxTotal) * 100}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                    style={{ width: `${(r.resolved / maxTotal) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-black text-slate-900">{r.total}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> {resolvedLegend}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-300" /> {openLegend}
            </span>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">{loading ? "…" : emptyLabel}</p>
      )}
    </div>
  );
}
