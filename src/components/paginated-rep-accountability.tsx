"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnalyticsPagination } from "@/components/analytics-pagination";
import { useTranslation } from "@/context/language-context";
import { categoryLabel } from "@/lib/i18n";
import { repRowMatchesQuery } from "@/lib/analytics-search";
import type { RepresentativeAccountabilityRow } from "@/lib/representative-accountability";
import {
  isElectedRole,
  ROLE_ICON,
  ROLE_LABEL,
  STAFF_REPRESENTATIVES_ENABLED,
} from "@/lib/representative-labels";

type Filter = "all" | "elected" | "officials";

const PAGE_SIZE = 12;

type Props = {
  rows: RepresentativeAccountabilityRow[];
  representativeCount?: number;
  localityIndex?: Record<string, string>;
  /** Page-level search (hides per-table search when set) */
  searchQuery?: string;
};

export function PaginatedRepAccountability({
  rows,
  representativeCount,
  localityIndex = {},
  searchQuery,
}: Props) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const query = searchQuery ?? "";

  const filtered = useMemo(() => {
    let list = rows;
    if (STAFF_REPRESENTATIVES_ENABLED) {
      if (filter === "elected") list = list.filter((r) => isElectedRole(r.representative.role));
      if (filter === "officials") list = list.filter((r) => !isElectedRole(r.representative.role));
    }
    if (query.trim()) list = list.filter((r) => repRowMatchesQuery(query, r, localityIndex));
    return list;
  }, [rows, filter, query, localityIndex]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  const hasRepRecords = (representativeCount ?? rows.length) > 0;

  if (!hasRepRecords) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">{t("accountability.noRepresentatives")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      {STAFF_REPRESENTATIVES_ENABLED ? (
        <div className="border-b border-slate-100 p-4">
          <div className="flex rounded-full bg-slate-100 p-0.5">
            {(["all", "elected", "officials"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                  filter === f ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f === "all"
                  ? t("accountability.filterAll")
                  : f === "elected"
                    ? t("accountability.filterElected")
                    : t("accountability.filterOfficials")}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="hidden sm:grid grid-cols-[minmax(0,1.4fr)_auto_auto_auto_auto_auto] gap-x-3 border-b border-slate-100 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <span>{t("accountability.colRepresentative")}</span>
        <span className="text-right">{t("accountability.colOpen")}</span>
        <span className="text-right">{t("accountability.colOverdue")}</span>
        <span className="text-right">{t("common.resolved")}</span>
        <span className="text-right">{t("home.rate")}</span>
        <span className="text-right">{t("accountability.colSla")}</span>
      </div>

      <div className="divide-y divide-slate-50">
        {pageRows.map((row) => {
          const { representative: rep, ward } = row;
          const exploreHref =
            rep.role === "MLA" ? `/explore-map` : `/explore-map?wardId=${encodeURIComponent(ward.id)}`;
          const wardHref = `/wards/${encodeURIComponent(ward.id)}`;
          const rowKey =
            rep.role === "MLA"
              ? `mla-${row.scopeLabel ?? ward.assemblyConstituency}-${rep.id}`
              : rep.id;

          return (
            <div
              key={rowKey}
              role="link"
              tabIndex={0}
              onClick={() => router.push(exploreHref)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(exploreHref);
                }
              }}
              className="block cursor-pointer border-b border-slate-50 px-5 py-4 transition last:border-0 hover:bg-slate-50"
            >
              <div className="flex gap-3 sm:hidden">
                <RepAvatar rep={rep} />
                <div className="min-w-0 flex-1">
                  <RepHeader rep={rep} ward={ward} scopeLabel={row.scopeLabel} />
                  <RepMetrics row={row} locale={locale} t={t} compact />
                </div>
              </div>
              <div className="hidden sm:grid grid-cols-[minmax(0,1.4fr)_auto_auto_auto_auto_auto] items-center gap-x-3">
                <div className="flex min-w-0 items-center gap-3">
                  <RepAvatar rep={rep} small />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{rep.name}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {ROLE_ICON[rep.role]} {ROLE_LABEL[rep.role]}
                      {row.scopeLabel ? ` · ${row.scopeLabel}` : ` · ${ward.wardName}`}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {ward.zoneName}
                      {rep.area ? ` · ${rep.area}` : ""}
                    </p>
                  </div>
                </div>
                <MetricCell value={row.open} warn={row.open > 0} />
                <MetricCell value={row.overdueOpen} bad={row.overdueOpen > 0} />
                <MetricCell value={row.resolved} good />
                <MetricCell value={`${row.resolutionRate}%`} />
                <span className="text-right text-[11px] text-slate-500">{row.responseTargetHours}h</span>
              </div>
              {row.topCategory ? (
                <p className="mt-2 flex flex-wrap items-center gap-x-1 text-[10px] text-slate-500 sm:mt-1">
                  <span>
                    {t("accountability.topIssue")}: {categoryLabel(locale, row.topCategory)}
                  </span>
                  <span aria-hidden>·</span>
                  <Link
                    href={wardHref}
                    className="font-semibold text-brand-700 underline decoration-dotted"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("accountability.wardDashboard")}
                  </Link>
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">{t("analytics.noSearchResults")}</p>
      ) : null}

      <AnalyticsPagination
        page={safePage}
        totalPages={totalPages}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        total={filtered.length}
        onPageChange={setPage}
      />

      <p className="border-t border-slate-100 px-5 py-3 text-[10px] leading-relaxed text-slate-500">
        {t("accountability.footnote")}
      </p>
    </div>
  );
}

function RepAvatar({
  rep,
  small,
}: {
  rep: RepresentativeAccountabilityRow["representative"];
  small?: boolean;
}) {
  const size = small ? "h-9 w-9" : "h-11 w-11";
  if (rep.photoUrl) {
    return <img src={rep.photoUrl} alt="" className={`${size} shrink-0 rounded-xl object-cover ring-1 ring-slate-200`} />;
  }
  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg`}>
      {ROLE_ICON[rep.role]}
    </div>
  );
}

function RepHeader({
  rep,
  ward,
  scopeLabel,
}: {
  rep: RepresentativeAccountabilityRow["representative"];
  ward: RepresentativeAccountabilityRow["ward"];
  scopeLabel?: string | null;
}) {
  return (
    <>
      <p className="font-bold leading-tight text-slate-900">{rep.name}</p>
      <p className="text-[11px] text-slate-500">
        {ROLE_LABEL[rep.role]}
        {rep.party ? ` · ${rep.party}` : ""}
      </p>
      <p className="text-[10px] text-slate-500">
        {scopeLabel ?? `${ward.wardName} · ${ward.zoneName}`}
        {rep.area ? ` · ${rep.area}` : ""}
      </p>
    </>
  );
}

function RepMetrics({
  row,
  locale,
  t,
  compact,
}: {
  row: RepresentativeAccountabilityRow;
  locale: "en" | "ta";
  t: (key: string, vars?: Record<string, string | number>) => string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-2"}`}>
      <Badge label={t("accountability.colOpen")} value={String(row.open)} warn={row.open > 0} />
      <Badge label={t("accountability.colOverdue")} value={String(row.overdueOpen)} bad={row.overdueOpen > 0} />
      <Badge label={t("common.resolved")} value={String(row.resolved)} good />
      <Badge label={t("home.rate")} value={`${row.resolutionRate}%`} />
    </div>
  );
}

function Badge({
  label,
  value,
  warn,
  bad,
  good,
}: {
  label: string;
  value: string;
  warn?: boolean;
  bad?: boolean;
  good?: boolean;
}) {
  const cls = bad
    ? "bg-red-100 text-red-800"
    : warn
      ? "bg-amber-100 text-amber-800"
      : good
        ? "bg-emerald-100 text-emerald-800"
        : "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>
      <span className="font-medium opacity-70">{label}</span> {value}
    </span>
  );
}

function MetricCell({
  value,
  warn,
  bad,
  good,
}: {
  value: string | number;
  warn?: boolean;
  bad?: boolean;
  good?: boolean;
}) {
  const cls = bad
    ? "text-red-700 font-bold"
    : warn
      ? "text-amber-700 font-bold"
      : good
        ? "text-emerald-700 font-bold"
        : "text-slate-600 font-semibold";
  return <span className={`text-right text-sm ${cls}`}>{value}</span>;
}
