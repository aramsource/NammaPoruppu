"use client";

import Link from "next/link";
import { AnalyticsPagination } from "@/components/analytics-pagination";
import { useTranslation } from "@/context/language-context";
import { categoryLabel } from "@/lib/i18n";
import type { RepresentativeAccountabilityRow, WardElectedGroup } from "@/lib/representative-accountability";
import { primaryLocalityLabel } from "@/lib/ward-locality-search";
import { ROLE_ICON, ROLE_LABEL } from "@/lib/representative-labels";

type Props = {
  groups: WardElectedGroup[];
  wardAreaHints?: Record<string, string>;
  variant?: "dark" | "light";
  wardId?: string;
  /** Max cards when pagination is not used (e.g. home page) */
  limit?: number;
  /** When set, show pagination footer (groups should already be sliced) */
  pagination?: {
    page: number;
    totalPages: number;
    rangeStart: number;
    rangeEnd: number;
    total: number;
    onPageChange: (page: number) => void;
  };
};

export function WardElectedAccountability({
  groups,
  wardAreaHints = {},
  variant = "dark",
  wardId,
  limit,
  pagination,
}: Props) {
  const { t, locale } = useTranslation();
  const isDark = variant === "dark";
  const shell = isDark ? "bg-white/5 ring-white/10" : "bg-white ring-slate-200";
  const footnoteMuted = isDark ? "text-slate-500" : "text-slate-500";
  const cardBg = "bg-white shadow-sm ring-1 ring-slate-200";
  const cardTitle = "text-slate-900";
  const cardMuted = "text-slate-500";

  let filtered = wardId ? groups.filter((g) => g.ward.id === wardId) : groups;
  if (!pagination && limit != null) filtered = filtered.slice(0, limit);

  if (filtered.length === 0) {
    return (
      <div className={`rounded-2xl p-5 ring-1 ${shell}`}>
        <p className={`text-sm ${isDark ? "text-slate-400" : cardMuted}`}>{t("accountability.noIssuesYet")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((group) => {
        const href = `/explore-map?wardId=${encodeURIComponent(group.ward.id)}`;
        const locality = primaryLocalityLabel(group.ward, wardAreaHints[group.ward.id]);
        return (
          <Link
            key={group.ward.id}
            href={href}
            className={`block rounded-2xl p-4 transition hover:shadow-md ${cardBg}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className={`text-sm font-black ${cardTitle}`}>
                  {group.ward.wardName}
                  <span className={`ml-2 text-[11px] font-semibold ${cardMuted}`}>
                    {t("home.ward")} {group.ward.wardNumber} · {group.ward.zoneName}
                  </span>
                </p>
                {locality ? (
                  <p className={`mt-0.5 text-[11px] font-medium text-brand-700`}>
                    {t("analytics.localityLabel", { name: locality })}
                  </p>
                ) : null}
                <p className={`mt-0.5 text-[11px] ${cardMuted}`}>
                  {group.ward.assemblyConstituency} · {group.wardOpen} {t("common.open")} / {group.wardTotal}{" "}
                  {t("common.total")}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {group.councillor ? (
                <ElectedTile row={group.councillor} locale={locale} t={t} />
              ) : null}
              {group.mla ? (
                <ElectedTile row={group.mla} locale={locale} t={t} mlaForWard />
              ) : null}
            </div>
          </Link>
        );
      })}

      {pagination ? (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
          <AnalyticsPagination {...pagination} />
        </div>
      ) : null}

      <p className={`text-[10px] leading-relaxed ${footnoteMuted}`}>{t("accountability.footnote")}</p>
    </div>
  );
}

function ElectedTile({
  row,
  locale,
  t,
  mlaForWard,
}: {
  row: RepresentativeAccountabilityRow;
  locale: "en" | "ta";
  t: (key: string, vars?: Record<string, string | number>) => string;
  mlaForWard?: boolean;
}) {
  const { representative: rep, ward } = row;
  const sub = "text-slate-500";
  const title = "text-slate-900";
  const box = "bg-slate-50 ring-1 ring-slate-100";

  return (
    <div
      className={`rounded-xl p-3 ${box}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div className="flex items-start gap-2.5">
        {rep.photoUrl ? (
          <img src={rep.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200/80 text-lg">
            {ROLE_ICON[rep.role]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold leading-tight ${title}`}>{rep.name}</p>
          <p className={`text-[10px] ${sub}`}>
            {ROLE_LABEL[rep.role]}
            {rep.party ? ` · ${rep.party}` : ""}
          </p>
          {mlaForWard && row.scopeLabel ? (
            <p className={`text-[10px] ${sub}`}>{row.scopeLabel}</p>
          ) : (
            <p className={`text-[10px] ${sub}`}>{ward.zoneName}</p>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatPill label={t("accountability.colOpen")} value={row.open} warn={row.open > 0} />
        <StatPill label={t("accountability.colOverdue")} value={row.overdueOpen} bad={row.overdueOpen > 0} />
        <StatPill label={t("home.rate")} value={`${row.resolutionRate}%`} />
      </div>
      {row.topCategory ? (
        <p className={`mt-1.5 text-[10px] ${sub}`}>
          {t("accountability.topIssue")}: {categoryLabel(locale, row.topCategory)}
        </p>
      ) : null}
    </div>
  );
}

function StatPill({
  label,
  value,
  warn,
  bad,
}: {
  label: string;
  value: string | number;
  warn?: boolean;
  bad?: boolean;
}) {
  const cls = bad
    ? "bg-red-100 text-red-800"
    : warn
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>
      <span className="font-medium opacity-70">{label}</span> {value}
    </span>
  );
}
