import { NextRequest } from "next/server";
import { ok } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (!query) {
    return ok({ data: { reports: [], wards: [] } });
  }

  const supabase = createSupabaseServerClient();
  const [{ data: reports, error: repErr }, { data: wards, error: wardErr }, { data: localities, error: locErr }] = await Promise.all([
    supabase.from("reports").select("id, category, description, display_address").limit(200),
    supabase.from("wards").select("id, ward_name, ward_number, zone_name, city_id").limit(200),
    supabase.from("ward_localities").select("ward_id, locality_name").limit(5000),
  ]);
  if (repErr) return ok({ error: repErr.message }, { status: 500 });
  if (wardErr) return ok({ error: wardErr.message }, { status: 500 });
  if (locErr) return ok({ error: locErr.message }, { status: 500 });

  const reportMatches = (reports ?? []).filter((report) =>
    [report.display_address, report.category, report.description ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  const localitiesByWard = new Map<string, string[]>();
  for (const row of localities ?? []) {
    const locality = (row.locality_name ?? "").trim();
    if (!row.ward_id || !locality) continue;
    const list = localitiesByWard.get(row.ward_id) ?? [];
    list.push(locality);
    localitiesByWard.set(row.ward_id, list);
  }

  const wardMatches = (wards ?? []).filter((ward) => {
    const localityText = (localitiesByWard.get(ward.id) ?? []).join(" ");
    return [ward.ward_name, String(ward.ward_number), ward.zone_name, ward.city_id, localityText]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return ok({
    data: {
      reports: reportMatches,
      wards: wardMatches,
    },
  });
}
