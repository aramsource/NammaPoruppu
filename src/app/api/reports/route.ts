import { NextRequest } from "next/server";
import { created, ok, badRequest } from "@/lib/http";
import { issueCategories } from "@/lib/domain";
import { getCityById } from "@/lib/cities";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWardNumberFromPoint } from "@/lib/ward-geo-server";

export async function GET(request: NextRequest) {
  const cityId = request.nextUrl.searchParams.get("cityId");
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("reports")
    .select("*")
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false });
  if (cityId) {
    query = query.eq("city_id", cityId);
  }
  const { data, error } = await query;
  if (error) return ok({ error: error.message }, { status: 500 });
  return ok({ data: data ?? [], total: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  const body = await request.json().catch(() => null);

  const category = body?.category as string | undefined;
  const lat = body?.lat as number | undefined;
  const lng = body?.lng as number | undefined;
  const imageUrls = body?.imageUrls as string[] | undefined;
  const cityId = (body?.cityId as string | undefined) ?? "chennai";
  const city = getCityById(cityId);

  if (!category || !issueCategories.includes(category as (typeof issueCategories)[number])) {
    return badRequest("valid category is required");
  }

  if (typeof lat !== "number" || typeof lng !== "number") {
    return badRequest("lat and lng are required");
  }

  if (imageUrls && imageUrls.length > 3) {
    return badRequest("imageUrls can contain at most 3 images");
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!bearerToken) {
      return ok({ error: "Sign in required" }, { status: 401 });
    }
    const { data: userData, error: authError } = await supabase.auth.getUser(bearerToken);
    if (authError || !userData.user) {
      return ok({ error: "Sign in required" }, { status: 401 });
    }
    const mappedWardNo = await resolveWardNumberFromPoint(city.id, lat, lng);
    let wardId: string | null = null;
    let returnWard: { wardId: string; wardName: string; wardNumber: number } | null = null;
    if (mappedWardNo) {
      const { data: ward } = await supabase
        .from("wards")
        .select("id, ward_name, ward_number")
        .eq("city_id", city.id)
        .eq("ward_number", mappedWardNo)
        .maybeSingle();
      wardId = ward?.id ?? null;
      if (ward) {
        returnWard = { wardId: ward.id, wardName: ward.ward_name, wardNumber: ward.ward_number };
      }
    }
    if (!wardId) return badRequest("Unable to map location to a ward");
    const reportRef = `NP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { data, error } = await supabase
      .from("reports")
      .insert({
        report_ref: reportRef,
        city_id: city.id,
        ward_id: wardId,
        category,
        description: body?.description ?? null,
        status: "open",
        display_address: body?.displayAddress ?? `${lat}, ${lng}`,
        street: body?.street ?? null,
        neighbourhood: body?.neighbourhood ?? null,
        postcode: body?.postcode ?? null,
        lat,
        lng,
        accuracy_meters: body?.accuracyMeters ?? null,
        reporter_session_id: body?.reporterSessionId ?? `sess_${Date.now()}`,
        reporter_user_id: userData.user.id,
      })
      .select("id, report_ref")
      .single();
    if (error) throw error;
    return created({
      id: data.id,
      reportRef: data.report_ref,
      wardId,
      wardName: returnWard?.wardName ?? null,
      wardNumber: returnWard?.wardNumber ?? null,
      message: "Report submitted successfully",
    });
  } catch (err: unknown) {
    return ok(
      { error: err instanceof Error ? err.message : "Report create failed" },
      { status: 500 },
    );
  }
}
