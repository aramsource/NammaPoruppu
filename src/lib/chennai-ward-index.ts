import { readFile } from "node:fs/promises";
import path from "node:path";

export type ChennaiWardIndexRow = {
  id: string;
  wardNumber: number;
  wardName: string;
  zoneName: string;
  city: "Chennai";
  assemblyConstituency: string;
};

type GeoWardFeature = {
  type: "Feature";
  properties?: {
    Ward_No?: number | string;
    Zone_Name?: string;
  };
};

type GeoWardCollection = {
  type: "FeatureCollection";
  features: GeoWardFeature[];
};

let wardIndexCache: ChennaiWardIndexRow[] | null = null;

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function wardIdFromNumber(wardNumber: number) {
  return `ward-${String(wardNumber).padStart(3, "0")}`;
}

export async function getChennaiWardIndex() {
  if (wardIndexCache) return wardIndexCache;
  const fp = path.join(process.cwd(), "public", "data", "chennai-wards.geojson");
  const raw = await readFile(fp, "utf-8");
  const geo = JSON.parse(raw) as GeoWardCollection;
  const byWardNo = new Map<number, ChennaiWardIndexRow>();

  for (const feature of geo.features ?? []) {
    const wardNumber = Number(feature.properties?.Ward_No ?? 0);
    if (!Number.isFinite(wardNumber) || wardNumber <= 0) continue;
    if (byWardNo.has(wardNumber)) continue;
    const zoneRaw = feature.properties?.Zone_Name ?? "Unknown";
    byWardNo.set(wardNumber, {
      id: wardIdFromNumber(wardNumber),
      wardNumber,
      wardName: `Ward ${wardNumber}`,
      zoneName: titleCase(zoneRaw),
      city: "Chennai",
      assemblyConstituency: "Unknown",
    });
  }

  wardIndexCache = [...byWardNo.values()].sort((a, b) => a.wardNumber - b.wardNumber);
  return wardIndexCache;
}
