import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { created, ok, badRequest } from "@/lib/http";
import { issueCategories } from "@/lib/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type GeoWardFeature = {
  type: "Feature";
  properties: { Ward_No?: number | string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};
type GeoWardCollection = { type: "FeatureCollection"; features: GeoWardFeature[] };

let geoCache: GeoWardCollection | null = null;

async function getWardGeoJson() {
  if (geoCache) return geoCache;
  const fp = path.join(process.cwd(), "public", "data", "chennai-wards.geojson");
  const raw = await readFile(fp, "utf-8");
  geoCache = JSON.parse(raw) as GeoWardCollection;
  return geoCache;
}

function pointInRing(lat: number, lng: number, ring: number[][]) {
  // ring points are [lng, lat]
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
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

async function resolveWardIdFromPoint(lat: number, lng: number) {
  try {
    const geo = await getWardGeoJson();
    const match = geo.features.find((f) => pointInFeature(lat, lng, f));
    if (!match) return null;
    return Number(match.properties?.Ward_No ?? 0);
  } catch {
    return null;
  }
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false });
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
    const mappedWardNo = await resolveWardIdFromPoint(lat, lng);
    let wardId: string | null = null;
    let returnWard: { wardId: string; wardName: string; wardNumber: number } | null = null;
    if (mappedWardNo) {
      const { data: ward } = await supabase
        .from("wards")
        .select("id, ward_name, ward_number")
        .eq("city_id", body?.cityId ?? "chennai")
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
        city_id: body?.cityId ?? "chennai",
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
