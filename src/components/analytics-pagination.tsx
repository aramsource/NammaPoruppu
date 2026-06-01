"use client";

import { useTranslation } from "@/context/language-context";

type Props = {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function AnalyticsPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  onPageChange,
}: Props) {
  const { t } = useTranslation();
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        {t("analytics.showingRange", { start: rangeStart, end: rangeEnd, total })}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("analytics.prevPage")}
        </button>
        <span className="text-xs font-semibold text-slate-600">
          {t("analytics.pageOf", { page, total: totalPages })}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("analytics.nextPage")}
        </button>
      </div>
    </div>
  );
}
