import type { Ward } from "@/lib/domain";

export type WardLocalityRow = {
  ward_id: string;
  locality_name: string;
  is_verified?: boolean | null;
  place_type?: string | null;
};

function localityPlaceRank(placeType: string | null | undefined) {
  switch ((placeType ?? "").toLowerCase()) {
    case "suburb":
      return 0;
    case "neighbourhood":
      return 1;
    case "quarter":
      return 2;
    case "village":
      return 3;
    case "hamlet":
      return 4;
    default:
      return 9;
  }
}

/** Same index as explore-map: locality names (+ report neighbourhoods) per ward, lowercased. */
export function buildWardAreaSearchIndex(
  localities: WardLocalityRow[],
  reportNeighbourhoodsByWard: Map<string, string[]>,
): Record<string, string> {
  const searchIndex: Record<string, string> = {};
  const byWard = new Map<
    string,
    Array<{ localityName: string; isVerified: boolean; placeType: string | null }>
  >();

  for (const row of localities) {
    const localityName = (row.locality_name ?? "").trim();
    if (!localityName || !row.ward_id) continue;
    const list = byWard.get(row.ward_id) ?? [];
    list.push({
      localityName,
      isVerified: Boolean(row.is_verified),
      placeType: row.place_type ?? null,
    });
    byWard.set(row.ward_id, list);
  }

  for (const [wardId, list] of byWard.entries()) {
    const deduped = [...new Map(list.map((l) => [l.localityName.toLowerCase(), l])).values()];
    deduped.sort((a, b) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      const rankDiff = localityPlaceRank(a.placeType) - localityPlaceRank(b.placeType);
      if (rankDiff !== 0) return rankDiff;
      return a.localityName.localeCompare(b.localityName);
    });
    searchIndex[wardId] = deduped.map((l) => l.localityName.toLowerCase()).join(" ");
  }

  for (const [wardId, areas] of reportNeighbourhoodsByWard.entries()) {
    const extra = areas.map((a) => a.toLowerCase()).join(" ");
    if (!extra) continue;
    searchIndex[wardId] = searchIndex[wardId] ? `${searchIndex[wardId]} ${extra}` : extra;
  }

  return searchIndex;
}

export function wardLocalityText(
  wardId: string,
  index: Record<string, string>,
): string {
  return index[wardId] ?? "";
}

export function wardMatchesExploreStyleSearch(
  query: string,
  ward: Ward,
  index: Record<string, string>,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const area = wardLocalityText(ward.id, index);
  return (
    ward.wardName.toLowerCase().includes(q) ||
    String(ward.wardNumber).includes(q) ||
    ward.zoneName.toLowerCase().includes(q) ||
    ward.assemblyConstituency.toLowerCase().includes(q) ||
    area.includes(q)
  );
}
