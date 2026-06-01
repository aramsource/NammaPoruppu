import type { Ward } from "@/lib/domain";
import type {
  RepresentativeAccountabilityRow,
  WardElectedGroup,
} from "@/lib/representative-accountability";
import { ROLE_LABEL } from "@/lib/representative-labels";
import { wardMatchesExploreStyleSearch } from "@/lib/ward-locality-search";

export function normalizeAreaQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesAreaQuery(
  query: string,
  fields: (string | number | null | undefined)[],
): boolean {
  const q = normalizeAreaQuery(query);
  if (!q) return true;
  return fields.some((f) => String(f ?? "").toLowerCase().includes(q));
}

export function wardAreaFields(ward: Ward): (string | number)[] {
  return [ward.wardName, ward.zoneName, ward.wardNumber, ward.assemblyConstituency];
}

export function wardStatMatchesQuery(
  query: string,
  ward: Ward,
  localityIndex: Record<string, string> = {},
): boolean {
  if (wardMatchesExploreStyleSearch(query, ward, localityIndex)) return true;
  return matchesAreaQuery(query, wardAreaFields(ward));
}

export function repRowMatchesQuery(
  query: string,
  row: RepresentativeAccountabilityRow,
  localityIndex: Record<string, string> = {},
): boolean {
  if (wardStatMatchesQuery(query, row.ward, localityIndex)) return true;
  const { representative: rep } = row;
  return matchesAreaQuery(query, [
    rep.name,
    ROLE_LABEL[rep.role],
    rep.role,
    rep.area,
    rep.constituency,
    rep.party,
    row.scopeLabel,
  ]);
}

export function wardElectedGroupMatchesQuery(
  query: string,
  group: WardElectedGroup,
  localityIndex: Record<string, string> = {},
): boolean {
  if (wardStatMatchesQuery(query, group.ward, localityIndex)) return true;
  if (group.councillor && repRowMatchesQuery(query, group.councillor, localityIndex)) return true;
  if (group.mla && repRowMatchesQuery(query, group.mla, localityIndex)) return true;
  return false;
}
