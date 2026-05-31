import { NextRequest } from "next/server";
import { ok } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCityById } from "@/lib/cities";
import { getWardIndex } from "@/lib/ward-geo-server";

export async function GET(request: NextRequest) {
  const cityId = request.nextUrl.searchParams.get("cityId") ?? "chennai";
  const city = getCityById(cityId);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("wards")
    .select("*")
    .eq("city_id", city.id)
    .order("ward_number", { ascending: true });
  if (error) return ok({ error: error.message }, { status: 500 });

  const geoWardIndex = await getWardIndex(city.id);
  const mergedByWardNo = new Map(geoWardIndex.map((w) => [w.wardNumber, w]));
  for (const row of data ?? []) {
    mergedByWardNo.set(row.ward_number, {
      id: row.id,
      wardNumber: row.ward_number,
      wardName: row.ward_name,
      zoneName: row.zone_name,
      city: city.name,
      assemblyConstituency: row.assembly_constituency ?? "Unknown",
    });
  }
  const merged = [...mergedByWardNo.values()].sort((a, b) => a.wardNumber - b.wardNumber);
  return ok({
    data: merged,
    total: merged.length,
    cityId: city.id,
  });
}
