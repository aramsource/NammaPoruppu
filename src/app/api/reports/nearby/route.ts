import { NextRequest } from "next/server";
import { ok, badRequest } from "@/lib/http";
import { issueCategories } from "@/lib/domain";
import { CITIES } from "@/lib/cities";
import { haversineMeters } from "@/lib/geo-distance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_RADIUS_M = 150;
const DEFAULT_LIMIT = 5;
const MAX_CANDIDATES = 400;

export type NearbyReport = {
  id: string;
  reportRef: string | null;
  category: string;
  description: string | null;
  lat: number;
  lng: number;
  displayAddress: string;
  status: string;
  supportCount: number;
  createdAt: string;
  distanceM: number;
};

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const cityId = sp.get("cityId");
  const category = sp.get("category");
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  const radiusM = Number(sp.get("radiusM") ?? DEFAULT_RADIUS_M);
  const limit = Math.min(Math.max(Number(sp.get("limit") ?? DEFAULT_LIMIT), 1), 10);

  if (!cityId || !CITIES.some((c) => c.id === cityId)) {
    return badRequest("Valid cityId is required");
  }
  if (!category || !(issueCategories as readonly string[]).includes(category)) {
    return badRequest("Valid category is required");
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return badRequest("Valid lat and lng are required");
  }
  if (!Number.isFinite(radiusM) || radiusM <= 0 || radiusM > 2000) {
    return badRequest("radiusM must be between 1 and 2000");
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, report_ref, category, description, lat, lng, display_address, status, support_count, created_at",
    )
    .eq("city_id", cityId)
    .eq("category", category)
    .in("status", ["open", "pending_verification"])
    .order("created_at", { ascending: false })
    .limit(MAX_CANDIDATES);

  if (error) return ok({ error: error.message }, { status: 500 });

  const nearby: NearbyReport[] = (data ?? [])
    .map((row) => {
      const distanceM = haversineMeters(lat, lng, row.lat, row.lng);
      return {
        id: row.id,
        reportRef: row.report_ref,
        category: row.category,
        description: row.description,
        lat: row.lat,
        lng: row.lng,
        displayAddress: row.display_address,
        status: row.status,
        supportCount: row.support_count ?? 0,
        createdAt: row.created_at,
        distanceM,
      };
    })
    .filter((r) => r.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);

  return ok({
    data: nearby,
    radiusM,
    total: nearby.length,
  });
}
