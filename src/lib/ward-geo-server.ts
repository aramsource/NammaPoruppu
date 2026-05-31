import { readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_CITY, getCityById } from "@/lib/cities";
import { wardIdFromNumber } from "@/lib/ward-geo-client";

export type WardIndexRow = {
  id: string;
  wardNumber: number;
  wardName: string;
  zoneName: string;
  city: string;
  assemblyConstituency: string;
};

type GeoWardFeature = {
  type: "Feature";
  properties?: {
    Ward_No?: number | string;
    Zone_Name?: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

type GeoWardCollection = {
  type: "FeatureCollection";
  features: GeoWardFeature[];
};

const geoCache = new Map<string, GeoWardCollection>();
const indexCache = new Map<string, WardIndexRow[]>();

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function pointInRing(lat: number, lng: number, ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInFeature(lat: number, lng: number, feature: GeoWardFeature) {
  if (feature.geometry.type === "Polygon") {
    const rings = feature.geometry.coordinates as number[][][];
    return rings.some((ring) => pointInRing(lat, lng, ring));
  }
  const polygons = feature.geometry.coordinates as number[][][][];
  return polygons.some((poly) => poly.some((ring) => pointInRing(lat, lng, ring)));
}

function wardGeoJsonFilePath(cityId: string) {
  return path.join(process.cwd(), "public", "data", `${cityId}-wards.geojson`);
}

export async function getWardGeoJson(cityId: string = DEFAULT_CITY.id) {
  const cached = geoCache.get(cityId);
  if (cached) return cached;
  const fp = wardGeoJsonFilePath(cityId);
  const raw = await readFile(fp, "utf-8");
  const geo = JSON.parse(raw) as GeoWardCollection;
  geoCache.set(cityId, geo);
  return geo;
}

export async function getWardIndex(cityId: string = DEFAULT_CITY.id): Promise<WardIndexRow[]> {
  const cached = indexCache.get(cityId);
  if (cached) return cached;
  const city = getCityById(cityId);
  const geo = await getWardGeoJson(cityId);
  const byWardNo = new Map<number, WardIndexRow>();

  for (const feature of geo.features ?? []) {
    const wardNumber = Number(feature.properties?.Ward_No ?? 0);
    if (!Number.isFinite(wardNumber) || wardNumber <= 0) continue;
    if (byWardNo.has(wardNumber)) continue;
    const zoneRaw = feature.properties?.Zone_Name ?? "Unknown";
    byWardNo.set(wardNumber, {
      id: wardIdFromNumber(cityId, wardNumber),
      wardNumber,
      wardName: `Ward ${wardNumber}`,
      zoneName: titleCase(zoneRaw),
      city: city.name,
      assemblyConstituency: "Unknown",
    });
  }

  const rows = [...byWardNo.values()].sort((a, b) => a.wardNumber - b.wardNumber);
  indexCache.set(cityId, rows);
  return rows;
}

/** @deprecated Use getWardIndex("chennai") */
export async function getChennaiWardIndex() {
  return getWardIndex("chennai");
}

export async function resolveWardNumberFromPoint(cityId: string, lat: number, lng: number) {
  try {
    const geo = await getWardGeoJson(cityId);
    const match = geo.features.find((f) => pointInFeature(lat, lng, f));
    if (!match) return null;
    const wardNumber = Number(match.properties?.Ward_No ?? 0);
    return Number.isFinite(wardNumber) && wardNumber > 0 ? wardNumber : null;
  } catch {
    return null;
  }
}
