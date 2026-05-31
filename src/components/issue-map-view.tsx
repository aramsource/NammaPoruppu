"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
import { Report, Ward } from "@/lib/domain";
import { City, DEFAULT_CITY } from "@/lib/cities";
import { wardGeoJsonPublicPath } from "@/lib/ward-geo-client";
import { useTranslation } from "@/context/language-context";

type IssueMapViewProps = {
  reports: Report[];
  wards: Ward[];
  selectedWardId: string | null;
  selectedReportId: string | null;
  resolvedWardIds?: Set<string>;
  wardAreaById?: Record<string, string>;
  city?: City;
  /** Clicking a ward bubble/polygon - just highlights, no drawer */
  onWardSelect: (wardId: string) => void;
  /** Clicking an individual issue dot - opens the drawer */
  onIssueClick: (reportId: string, wardId: string) => void;
};

type GeoWardFeature = {
  type: "Feature";
  properties: { Ward_No?: number | string; Zone_Name?: string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};
type GeoWardCollection = { type: "FeatureCollection"; features: GeoWardFeature[] };

type WardShape = {
  wardId: string;
  wardName: string;
  wardNumber: number;
  zoneName: string;
  rings: [number, number][][];
  center: [number, number];
  count: number;
  isMatched: boolean;
};

/** Relative bubble scale: bigger and denser like civic heat maps. */
function bubbleSize(count: number, maxCount: number): number {
  const min = 30;
  const max = 64;
  const safeMax = Math.max(maxCount, 1);
  const ratio = Math.min(count / safeMax, 1);
  // sqrt keeps low counts visible while still rewarding larger counts.
  return Math.round(min + (max - min) * Math.sqrt(ratio));
}

function createCountIcon(count: number, maxCount: number, active: boolean, resolved: boolean) {
  const size = bubbleSize(count, maxCount);
  const fs = size >= 58 ? 20 : size >= 48 ? 16 : size >= 40 ? 14 : 12;
  const intensity = Math.min(count / Math.max(maxCount, 1), 1);
  let bg = "#f97316";
  if (resolved) {
    bg = active ? "#059669" : "#10b981";
  } else if (active) {
    bg = "#7f1d1d";
  } else if (intensity >= 0.75) {
    bg = "#641220";
  } else if (intensity >= 0.5) {
    bg = "#7f1d1d";
  } else if (intensity >= 0.3) {
    bg = "#9f1239";
  } else if (intensity >= 0.15) {
    bg = "#ef4444";
  }
  return L.divIcon({
    html: `<div style="background:${bg};color:#fff;width:${size}px;height:${size}px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:800;border:4px solid #fff;cursor:pointer;box-shadow:0 10px 22px rgba(15,23,42,0.24)">${count}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createIssueDot(status: string, selected: boolean) {
  const color = status === "resolved" ? "#10b981" : status === "pending_verification" ? "#f59e0b" : "#ef4444";
  const size = selected ? 32 : 24;
  const innerSize = selected ? 20 : 14;
  const outline = selected ? `3px solid ${color}` : "none";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;cursor:pointer"><div style="background:${color};width:${innerSize}px;height:${innerSize}px;border-radius:9999px;border:3px solid #fff;outline:${outline};outline-offset:${selected ? "2px" : "0"};box-shadow:0 8px 16px rgba(15,23,42,0.22)"></div></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Heat-map fill. Every ward gets at least a visible pink tint. */
function heatFill(count: number, maxCount: number, isSelected: boolean, isResolved: boolean, isHovered: boolean) {
  if (isResolved) {
    return {
      fill: "#bbf7d0",
      stroke: isSelected ? "#047857" : "#4ade80",
      fillOpacity: isSelected ? 0.55 : isHovered ? 0.42 : 0.3,
      weight: isSelected ? 3 : isHovered ? 2.2 : 1.5,
    };
  }
  if (count === 0) {
    return {
      fill: "#fce7e7",
      stroke: isSelected ? "#b91c1c" : "#f9a8a8",
      fillOpacity: isSelected ? 0.4 : isHovered ? 0.28 : 0.18,
      weight: isSelected ? 2.8 : isHovered ? 1.8 : 1,
    };
  }
  const r = Math.min(count / Math.max(maxCount, 1), 1);
  const fills = ["#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444"];
  const strokes = ["#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c"];
  const idx = Math.min(Math.floor(r * fills.length), fills.length - 1);
  return {
    fill: fills[idx],
    stroke: isSelected ? "#7f1d1d" : strokes[idx],
    fillOpacity: isSelected ? 0.62 : isHovered ? Math.min(0.7, 0.3 + r * 0.32) : 0.22 + r * 0.28,
    weight: isSelected ? 3 : isHovered ? 2.1 : 1.2,
  };
}

function getFeatureRings(f: GeoWardFeature): [number, number][][] {
  if (f.geometry.type === "Polygon") {
    return (f.geometry.coordinates as number[][][]).map((r) => r.map(([lng, lat]) => [lat, lng] as [number, number]));
  }
  return (f.geometry.coordinates as number[][][][]).flatMap((p) =>
    p.map((r) => r.map(([lng, lat]) => [lat, lng] as [number, number])),
  );
}

function getCenterFromRings(rings: [number, number][][]): [number, number] | null {
  const pts = rings.flat();
  if (!pts.length) return null;
  const [sumLat, sumLng] = pts.reduce(([la, lo], [lat, lng]) => [la + lat, lo + lng], [0, 0]);
  return [sumLat / pts.length, sumLng / pts.length];
}

function MapController({ selectedWardShape }: { selectedWardShape: WardShape | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedWardShape) return;
    const allPts = selectedWardShape.rings.flat();
    if (!allPts.length) return;
    const lats = allPts.map(([lat]) => lat);
    const lngs = allPts.map(([, lng]) => lng);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    map.flyToBounds(bounds, { paddingTopLeft: [16, 120], paddingBottomRight: [16, 40], maxZoom: 15, duration: 0.7 });
  }, [map, selectedWardShape]);
  return null;
}

function CityViewController({ city }: { city: City }) {
  const map = useMap();
  useEffect(() => {
    const [[swLat, swLng], [neLat, neLng]] = city.bounds;
    const bounds = L.latLngBounds([swLat, swLng], [neLat, neLng]);
    map.setMaxBounds(bounds);
    map.setMinZoom(city.minZoom);
    map.flyToBounds(bounds, {
      paddingTopLeft: [16, 120],
      paddingBottomRight: [16, 40],
      maxZoom: city.defaultZoom,
      duration: 0.8,
    });
  }, [map, city]);
  return null;
}

function MapZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-44 z-[700] flex flex-col gap-2 md:top-40">
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white ring-1 ring-white/15 transition hover:bg-slate-800 active:scale-[0.98]"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.25v13.5M5.25 12h13.5" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white ring-1 ring-white/15 transition hover:bg-slate-800 active:scale-[0.98]"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12h13.5" />
        </svg>
      </button>
    </div>
  );
}

export function IssueMapView({
  reports,
  wards,
  selectedWardId,
  selectedReportId,
  resolvedWardIds = new Set(),
  wardAreaById = {},
  city = DEFAULT_CITY,
  onWardSelect,
  onIssueClick,
}: IssueMapViewProps) {
  const { t } = useTranslation();
  const [geoWards, setGeoWards] = useState<GeoWardFeature[]>([]);
  const [hoverWardId, setHoverWardId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(wardGeoJsonPublicPath(city.id))
      .then((r) => r.json())
      .then((d: GeoWardCollection) => { if (mounted && d?.features?.length) setGeoWards(d.features); })
      .catch(() => setGeoWards([]));
    return () => { mounted = false; };
  }, [city.id]);

  const countByWard = useMemo(() => {
    const m = new Map<string, number>();
    reports.forEach((r) => m.set(r.governance.wardId, (m.get(r.governance.wardId) ?? 0) + 1));
    return m;
  }, [reports]);

  const allWardShapes = useMemo((): WardShape[] =>
    geoWards.flatMap((feat) => {
      const wardNo = Number(feat.properties?.Ward_No ?? 0);
      const match = wards.find((w) => w.wardNumber === wardNo);
      const rings = getFeatureRings(feat);
      const center = getCenterFromRings(rings);
      if (!center) return [];
      return [{
        wardId: match?.id ?? `geo-${wardNo}`,
        wardName: match?.wardName ?? `Ward ${wardNo}`,
        wardNumber: wardNo,
        zoneName: match?.zoneName ?? String(feat.properties?.Zone_Name ?? ""),
        rings,
        center,
        count: match ? (countByWard.get(match.id) ?? 0) : 0,
        isMatched: Boolean(match),
      }];
    }),
  [geoWards, wards, countByWard]);

  const maxCount = useMemo(() => Math.max(1, ...allWardShapes.map((w) => w.count)), [allWardShapes]);
  const selectedWardShape = allWardShapes.find((w) => w.wardId === selectedWardId) ?? null;
  const focusedWardShape = allWardShapes.find((w) => w.wardId === (hoverWardId ?? selectedWardId)) ?? selectedWardShape;
  const focusedWardArea = focusedWardShape ? (wardAreaById[focusedWardShape.wardId] ?? "") : "";
  const activeIssues = reports.filter((r) => r.status === "open").length;

  return (
    <div className="relative h-full w-full bg-slate-50">
      {/* Stats - top left (matches home hero stats strip tone) */}
      <div className="pointer-events-none absolute left-4 top-32 z-[500] rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2.5 shadow-lg backdrop-blur-sm md:top-28">
        <div className="flex items-baseline gap-5 text-xs">
          <p>
            <span className="text-xl font-black text-brand-400">{activeIssues}</span>{" "}
            <span className="font-semibold uppercase tracking-wider text-white/45">{t("map.openCount")}</span>
          </p>
          <p>
            <span className="text-xl font-black text-white">{reports.length}</span>{" "}
            <span className="font-semibold uppercase tracking-wider text-white/45">{t("map.reportCount")}</span>
          </p>
        </div>
      </div>

      {/* Selected ward info - bottom left */}
      {focusedWardShape && (
        <div className="pointer-events-none absolute bottom-20 left-4 z-[500] max-w-[48vw] rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-lg backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            {hoverWardId ? t("explore.hoveringWard") : t("explore.selectedWard")}
          </p>
          <p className="text-sm font-black leading-tight text-white">
            {focusedWardShape.wardName}
            {focusedWardShape.zoneName ? ` · ${focusedWardShape.zoneName}` : ""}
          </p>
          {focusedWardArea ? <p className="mt-0.5 text-xs text-white/55">{focusedWardArea}</p> : null}
          <p className={`mt-1 text-sm font-bold ${focusedWardShape.count > 0 ? "text-brand-400" : "text-white/40"}`}>
            {focusedWardShape.count} {focusedWardShape.count !== 1 ? t("common.issues") : t("common.issue")}
          </p>
          {focusedWardShape.count > 0 && (
            <p className="mt-0.5 text-[10px] text-slate-400">{t("explore.tapIssueDot")}</p>
          )}
        </div>
      )}

      <MapContainer
        center={city.center}
        zoom={city.defaultZoom}
        minZoom={city.minZoom}
        maxZoom={18}
        maxBounds={city.bounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer attribution="" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <CityViewController city={city} />
        <MapController selectedWardShape={selectedWardShape} />
        <MapZoomButtons />

        {/* All ward polygons - heat map fill with hover highlight */}
        {allWardShapes.map((ward) => {
          const isSelected = ward.wardId === selectedWardId;
          const isHovered = ward.wardId === hoverWardId;
          const isResolved = resolvedWardIds.has(ward.wardId);
          const { fill, stroke, fillOpacity, weight } = heatFill(ward.count, maxCount, isSelected, isResolved, isHovered);
          return ward.rings.map((ring, ri) => (
            <Polygon
              key={`${ward.wardId}-${ri}`}
              positions={ring}
              pathOptions={{ color: stroke, fillColor: fill, fillOpacity, weight, opacity: 1 }}
              eventHandlers={{
                click: () => onWardSelect(ward.wardId),
                mousemove: () => setHoverWardId(ward.wardId),
                mouseover: (e) => {
                  setHoverWardId(ward.wardId);
                  e.target.setStyle({ fillOpacity: Math.min(0.75, fillOpacity + 0.28), weight: weight + 1.5, color: isResolved ? "#059669" : "#991b1b" });
                  e.target.bringToFront();
                },
                mouseout: (e) => {
                  setHoverWardId((prev) => (prev === ward.wardId ? null : prev));
                  e.target.setStyle({ fillOpacity, weight, color: stroke });
                },
              }}
            />
          ));
        })}

        {/* Count bubbles - shown for ALL wards with issues EXCEPT the selected one */}
        {allWardShapes.filter((w) => w.count > 0 && w.wardId !== selectedWardId).map((ward) => (
          <Marker
            key={`bubble-${ward.wardId}`}
            position={ward.center}
            icon={createCountIcon(ward.count, maxCount, false, resolvedWardIds.has(ward.wardId))}
            eventHandlers={{ click: () => onWardSelect(ward.wardId) }}
          >
            <Popup>
              <p className="font-semibold">{ward.wardName}</p>
              {ward.zoneName ? <p className="text-xs text-gray-500">{ward.zoneName}</p> : null}
              <p className="text-xs text-gray-500">{ward.count} issues · tap to explore</p>
            </Popup>
          </Marker>
        ))}

        {/* Individual issue dots - shown ONLY for the selected ward */}
        {reports
          .filter((r) => r.governance.wardId === selectedWardId)
          .map((r) => (
            <Marker
              key={`dot-${r.id}`}
              position={[r.lat, r.lng]}
              icon={createIssueDot(r.status, r.id === selectedReportId)}
              eventHandlers={{ click: () => onIssueClick(r.id, r.governance.wardId) }}
            >
              <Popup>
                <p className="font-semibold text-sm">{r.category}</p>
                <p className="text-xs text-gray-500">{r.address}</p>
                <p className="text-[10px] text-gray-400 mt-1">Tap to view details</p>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
