"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/context/language-context";
import { categoryLabel } from "@/lib/i18n";
import { formatDistanceMeters } from "@/lib/geo-distance";
import type { NearbyReport } from "@/app/api/reports/nearby/route";

type Props = {
  cityId: string;
  lat: number;
  lng: number;
  category: string;
  radiusM?: number;
};

export function SimilarIssuesNearby({ cityId, lat, lng, category, radiusM = 150 }: Props) {
  const { t, locale } = useTranslation();
  const [items, setItems] = useState<NearbyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setChecked(false);
        try {
          const sp = new URLSearchParams({
            cityId,
            lat: String(lat),
            lng: String(lng),
            category,
            radiusM: String(radiusM),
            limit: "5",
          });
          const res = await fetch(`/api/reports/nearby?${sp}`);
          const json = (await res.json()) as { data?: NearbyReport[] };
          if (!cancelled) {
            setItems(json.data ?? []);
            setChecked(true);
          }
        } catch {
          if (!cancelled) {
            setItems([]);
            setChecked(true);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cityId, lat, lng, category, radiusM]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
        {t("similar.loading")}
      </div>
    );
  }

  if (!checked) return null;

  if (items.length === 0) {
    return (
      <p className="text-center text-[11px] text-slate-400">
        {t("similar.none", { radius: radiusM })}
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 ring-1 ring-amber-100">
      <p className="text-sm font-bold text-amber-950">{t("similar.title")}</p>
      <p className="mt-1 text-xs text-amber-900/80">
        {t("similar.subtitle", {
          count: items.length,
          category: categoryLabel(locale, category),
          radius: radiusM,
        })}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-amber-100"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">
                  {item.reportRef ?? item.id.slice(0, 8)}
                  <span className="ml-2 font-normal text-slate-500">
                    {formatDistanceMeters(item.distanceM)} {t("similar.away")}
                  </span>
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-600">
                  {item.displayAddress}
                </p>
                {item.description ? (
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                ↑ {item.supportCount}
              </span>
            </div>
            <Link
              href={`/explore-map?reportId=${encodeURIComponent(item.id)}`}
              className="mt-2 inline-flex text-[11px] font-bold text-brand-700 underline decoration-brand-300 underline-offset-2"
            >
              {t("similar.viewOnMap")}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-amber-900/70">{t("similar.hint")}</p>
    </div>
  );
}
