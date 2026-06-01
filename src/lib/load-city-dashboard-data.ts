import type { Report, Representative, Ward } from "@/lib/domain";
import { mapRepresentativeRow } from "@/lib/representative-accountability";
import { supabaseClient } from "@/lib/supabase/client";
import {
  buildWardAreaSearchIndex,
  type WardLocalityRow,
} from "@/lib/ward-locality-search";

type WardApiRow = {
  id: string;
  wardNumber: number;
  wardName: string;
  zoneName: string;
  city: string;
  assemblyConstituency: string;
};

export type CityDashboardData = {
  wards: Ward[];
  reports: Report[];
  representatives: Representative[];
  /** Locality names per ward — same source as explore-map search */
  wardAreaSearchIndex: Record<string, string>;
};

export async function loadCityDashboardData(cityId: string): Promise<CityDashboardData> {
  const [reportsRes, imagesRes, wardsApiRes, localitiesRes] = await Promise.all([
    supabaseClient
      .from("reports")
      .select("*")
      .eq("city_id", cityId)
      .neq("status", "withdrawn")
      .order("created_at", { ascending: false })
      .limit(500),
    supabaseClient
      .from("report_images")
      .select("report_id,image_url,created_at")
      .order("created_at", { ascending: true }),
    fetch(`/api/wards?cityId=${encodeURIComponent(cityId)}`, { cache: "no-store" }),
    supabaseClient
      .from("ward_localities")
      .select("ward_id, locality_name, is_verified, place_type")
      .eq("city_id", cityId),
  ]);

  if (reportsRes.error) throw reportsRes.error;
  if (imagesRes.error) throw imagesRes.error;
  if (localitiesRes.error) throw localitiesRes.error;
  if (!wardsApiRes.ok) throw new Error(`Failed to load wards (${wardsApiRes.status})`);

  const wardsPayload = (await wardsApiRes.json()) as { data?: WardApiRow[]; error?: string };
  if (wardsPayload.error) throw new Error(wardsPayload.error);

  const wards: Ward[] = (wardsPayload.data ?? []).map((w) => ({
    id: w.id,
    wardNumber: w.wardNumber,
    wardName: w.wardName,
    zoneName: w.zoneName,
    city: w.city,
    assemblyConstituency: w.assemblyConstituency,
    boundary: [],
  }));

  const wardById = new Map(wards.map((w) => [w.id, w]));
  const imageMap = new Map<string, string[]>();
  for (const img of imagesRes.data ?? []) {
    const reportId = String(img.report_id ?? "");
    const imageUrl = String(img.image_url ?? "");
    if (!reportId || !imageUrl) continue;
    const arr = imageMap.get(reportId) ?? [];
    arr.push(imageUrl);
    imageMap.set(reportId, arr);
  }

  const reportNeighbourhoodsByWard = new Map<string, string[]>();
  const reports: Report[] = (reportsRes.data ?? [])
    .map((r) => {
      const ward = wardById.get(String(r.ward_id));
      if (!ward) return null;
      const neighbourhood = String(
        (r as { neighbourhood?: string | null }).neighbourhood ??
          r.display_address?.split(",")[0] ??
          "",
      ).trim();
      if (neighbourhood && ward.id) {
        const list = reportNeighbourhoodsByWard.get(ward.id) ?? [];
        list.push(neighbourhood);
        reportNeighbourhoodsByWard.set(ward.id, list);
      }
      return {
        id: String(r.id),
        userId: "anon",
        category: r.category as Report["category"],
        description: (r.description as string | null) ?? null,
        lat: Number(r.lat),
        lng: Number(r.lng),
        address: String(r.display_address ?? ""),
        status: r.status as Report["status"],
        supportCount: Number(r.support_count ?? 0),
        createdAt: String(r.created_at),
        governance: {
          wardId: ward.id,
          wardName: ward.wardName,
          wardNumber: ward.wardNumber,
          zoneName: ward.zoneName,
          city: ward.city,
          assemblyConstituency: ward.assemblyConstituency,
        },
        imageUrls: imageMap.get(String(r.id)) ?? [],
      } as Report;
    })
    .filter(Boolean) as Report[];

  const wardAreaSearchIndex = buildWardAreaSearchIndex(
    (localitiesRes.data ?? []) as WardLocalityRow[],
    reportNeighbourhoodsByWard,
  );

  const wardIds = wards.map((w) => w.id);
  let representatives: Representative[] = [];
  if (wardIds.length > 0) {
    const { data: repsData, error: repsErr } = await supabaseClient
      .from("representatives")
      .select("*")
      .in("ward_id", wardIds);
    if (repsErr) throw repsErr;
    representatives = (repsData ?? []).map(mapRepresentativeRow);
  }

  return { wards, reports, representatives, wardAreaSearchIndex };
}
