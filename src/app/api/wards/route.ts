import { ok } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getChennaiWardIndex } from "@/lib/chennai-ward-index";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("wards")
    .select("*")
    .order("ward_number", { ascending: true });
  if (error) return ok({ error: error.message }, { status: 500 });
  const geoWardIndex = await getChennaiWardIndex();
  const mergedByWardNo = new Map(geoWardIndex.map((w) => [w.wardNumber, w]));
  for (const row of data ?? []) {
    mergedByWardNo.set(row.ward_number, {
      id: row.id,
      wardNumber: row.ward_number,
      wardName: row.ward_name,
      zoneName: row.zone_name,
      city: "Chennai",
      assemblyConstituency: row.assembly_constituency ?? "Unknown",
    });
  }
  const merged = [...mergedByWardNo.values()].sort((a, b) => a.wardNumber - b.wardNumber);
  return ok({
    data: merged,
    total: merged.length,
  });
}
