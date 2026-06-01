"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "@/context/language-context";
import { categoryLabel } from "@/lib/i18n";
import type { RepresentativeAccountabilityRow } from "@/lib/representative-accountability";
import { isElectedRole, ROLE_ICON, ROLE_LABEL } from "@/lib/representative-labels";

type Filter = "all" | "elected" | "officials";

type Props = {
  rows: RepresentativeAccountabilityRow[];
  /** When zero, show seed/setup message instead of the table */
  representativeCount?: number;
  /** Hide rows with zero assigned issues */
  onlyWithIssues?: boolean;
  variant?: "dark" | "light";
  limit?: number;
  wardId?: string;
};

export function RepresentativeAccountabilitySection({
  rows,
  representativeCount,
  onlyWithIssues = false,
  variant = "dark",
  limit = 12,
  wardId,
}: Props) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = onlyWithIssues ? rows.filter((r) => r.total > 0) : rows;
    const wardAc = wardId
      ? rows.find((r) => r.ward.id === wardId)?.ward.assemblyConstituency
      : undefined;
    if (wardId) {
      list = list.filter(
        (r) =>
          r.ward.id === wardId ||
          (r.representative.role === "MLA" &&
            wardAc != null &&
            r.ward.assemblyConstituency === wardAc),
      );
    }
    if (filter === "elected") list = list.filter((r) => isElectedRole(r.representative.role));
    if (filter === "officials") list = list.filter((r) => !isElectedRole(r.representative.role));
    return list;
  }, [rows, filter, wardId, onlyWithIssues]);

  const displayed = useMemo(() => {
    if (filter !== "all" || wardId) return filtered.slice(0, limit);

    const councillors = filtered
      .filter((r) => r.representative.role === "Councillor")
      .slice(0, Math.max(8, Math.floor(limit * 0.55)));
    const mlas = filtered
      .filter((r) => r.representative.role === "MLA")
      .slice(0, Math.max(6, Math.floor(limit * 0.45)));
    const mps = filtered.filter((r) => r.representative.role === "MP");
    const officials = filtered.filter(
      (r) => !isElectedRole(r.representative.role),
    );
    const picked = new Set([...councillors, ...mlas, ...mps, ...officials].map((r) => r.representative.id));
    const rest = filtered.filter((r) => !picked.has(r.representative.id));
    return [...councillors, ...mlas, ...mps, ...officials, ...rest].slice(0, limit);
  }, [filtered, filter, limit, wardId]);

  const isDark = variant === "dark";
  const shell = isDark ? "bg-white/5 ring-white/10" : "bg-white ring-slate-200";
  const head = isDark ? "text-slate-500 border-white/10" : "text-slate-500 border-slate-100";
  const rowHover = isDark ? "hover:bg-white/5 border-white/5" : "hover:bg-slate-50 border-slate-100";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-500" : "text-slate-500";

  const hasRepRecords = (representativeCount ?? rows.length) > 0;

  if (!hasRepRecords) {
    return (
      <div className={`rounded-2xl p-5 ring-1 ${shell}`}>
        <p className={`text-sm ${textMuted}`}>{t("accountability.noRepresentatives")}</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={`rounded-2xl p-5 ring-1 ${shell}`}>
        <p className={`text-sm ${textMuted}`}>{t("accountability.noRowsForFilter")}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl ring-1 ${shell}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${head}`}>
        <div>
          <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {t("accountability.repTitle")}
          </h3>
          <p className={`mt-0.5 text-xs ${textMuted}`}>{t("accountability.repSubtitle")}</p>
        </div>
        <div className="flex rounded-full bg-black/10 p-0.5 ring-1 ring-inset ring-white/10">
          {(["all", "elected", "officials"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                filter === f
                  ? isDark
                    ? "bg-white text-slate-900"
                    : "bg-slate-900 text-white"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
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

      <div className={`hidden sm:grid grid-cols-[minmax(0,1.4fr)_auto_auto_auto_auto_auto] gap-x-3 border-b px-5 py-2 text-[10px] font-bold uppercase tracking-wider ${head}`}>
        <span>{t("accountability.colRepresentative")}</span>
        <span className="text-right">{t("accountability.colOpen")}</span>
        <span className="text-right">{t("accountability.colOverdue")}</span>
        <span className="text-right">{t("common.resolved")}</span>
        <span className="text-right">{t("home.rate")}</span>
        <span className="text-right">{t("accountability.colSla")}</span>
      </div>

      <div className="divide-y divide-transparent">
        {displayed.map((row) => {
          const { representative: rep, ward } = row;
          const exploreHref =
            rep.role === "MLA"
              ? `/explore-map`
              : `/explore-map?wardId=${encodeURIComponent(ward.id)}`;
          const wardHref = `/wards/${encodeURIComponent(ward.id)}`;
          const rowKey =
            rep.role === "MLA"
              ? `mla-${row.scopeLabel ?? ward.assemblyConstituency}`
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
              className={`block border-b px-5 py-4 transition last:border-0 cursor-pointer ${rowHover}`}
            >
              <div className="flex gap-3 sm:hidden">
                <RepAvatar rep={rep} />
                <div className="min-w-0 flex-1">
                  <RepHeader
                    rep={rep}
                    ward={ward}
                    scopeLabel={row.scopeLabel}
                    textPrimary={textPrimary}
                    textMuted={textMuted}
                  />
                  <RepMetrics row={row} locale={locale} t={t} compact />
                </div>
              </div>
              <div className="hidden sm:grid grid-cols-[minmax(0,1.4fr)_auto_auto_auto_auto_auto] items-center gap-x-3">
                <div className="flex min-w-0 items-center gap-3">
                  <RepAvatar rep={rep} small />
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-bold ${textPrimary}`}>{rep.name}</p>
                    <p className={`truncate text-[11px] ${textMuted}`}>
                      {ROLE_ICON[rep.role]} {ROLE_LABEL[rep.role]}
                      {row.scopeLabel ? ` · ${row.scopeLabel}` : ` · ${ward.wardName}`}
                    </p>
                  </div>
                </div>
                <MetricCell value={row.open} tone={row.open > 0 ? "warn" : "muted"} isDark={isDark} />
                <MetricCell value={row.overdueOpen} tone={row.overdueOpen > 0 ? "bad" : "muted"} isDark={isDark} />
                <MetricCell value={row.resolved} tone="good" isDark={isDark} />
                <MetricCell value={`${row.resolutionRate}%`} tone="neutral" isDark={isDark} />
                <span className={`text-right text-[11px] font-medium ${textMuted}`}>
                  {row.responseTargetHours}h
                </span>
              </div>
              {row.topCategory ? (
                <p className={`mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] ${textMuted} sm:mt-1`}>
                  <span>
                    {t("accountability.topIssue")}: {categoryLabel(locale, row.topCategory)}
                    {row.avgResolutionDays != null
                      ? ` · ${t("accountability.avgResolve", { days: row.avgResolutionDays })}`
                      : null}
                  </span>
                  <span aria-hidden>·</span>
                  <Link
                    href={wardHref}
                    className="font-semibold underline decoration-dotted"
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

      {displayed.length === 0 ? (
        <p className={`px-5 py-6 text-sm ${textMuted}`}>
          {onlyWithIssues && hasRepRecords
            ? t("accountability.noIssuesYet")
            : t("accountability.noRowsForFilter")}
        </p>
      ) : null}

      <p className={`border-t px-5 py-3 text-[10px] leading-relaxed ${textMuted} ${head}`}>
        {t("accountability.footnote")}
      </p>
    </div>
  );
}

function RepAvatar({ rep, small }: { rep: RepresentativeAccountabilityRow["representative"]; small?: boolean }) {
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
  textPrimary,
  textMuted,
}: {
  rep: RepresentativeAccountabilityRow["representative"];
  ward: RepresentativeAccountabilityRow["ward"];
  scopeLabel?: string | null;
  textPrimary: string;
  textMuted: string;
}) {
  return (
    <>
      <p className={`font-bold leading-tight ${textPrimary}`}>{rep.name}</p>
      <p className={`text-[11px] ${textMuted}`}>
        {ROLE_LABEL[rep.role]}
        {rep.party ? ` · ${rep.party}` : ""}
      </p>
      <p className={`text-[10px] ${textMuted}`}>
        {scopeLabel ?? `${ward.wardName} · ${ward.zoneName}`}
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
    <div className={`mt-2 flex flex-wrap gap-2 ${compact ? "" : ""}`}>
      <Badge label={t("accountability.colOpen")} value={String(row.open)} variant={row.open > 0 ? "warn" : "muted"} />
      <Badge
        label={t("accountability.colOverdue")}
        value={String(row.overdueOpen)}
        variant={row.overdueOpen > 0 ? "bad" : "muted"}
      />
      <Badge label={t("common.resolved")} value={String(row.resolved)} variant="good" />
      <Badge label={t("home.rate")} value={`${row.resolutionRate}%`} variant="neutral" />
    </div>
  );
}

function Badge({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "warn" | "bad" | "good" | "muted" | "neutral";
}) {
  const styles = {
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-red-100 text-red-800",
    good: "bg-emerald-100 text-emerald-800",
    muted: "bg-slate-100 text-slate-600",
    neutral: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[variant]}`}>
      <span className="font-medium opacity-70">{label}</span> {value}
    </span>
  );
}

function MetricCell({
  value,
  tone,
  isDark,
}: {
  value: string | number;
  tone: "warn" | "bad" | "good" | "muted" | "neutral";
  isDark: boolean;
}) {
  const colors = {
    warn: isDark ? "text-amber-400" : "text-amber-700",
    bad: isDark ? "text-red-400" : "text-red-700",
    good: isDark ? "text-emerald-400" : "text-emerald-700",
    muted: isDark ? "text-slate-500" : "text-slate-400",
    neutral: isDark ? "text-slate-300" : "text-slate-700",
  };
  return <span className={`text-right text-sm font-black ${colors[tone]}`}>{value}</span>;
}
