import { badRequest, created, ok, unauthorized } from "@/lib/http";
import { getBearerToken, getUserFromBearer } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getResponsibilityForCategory } from "@/lib/responsibility";
import { buildIssueTweetText, formatWardLabel } from "@/lib/issue-share";
import type { IssueCategory } from "@/lib/domain";

export async function POST(request: Request) {
  const token = getBearerToken(request);
  const { user, error: authErr } = await getUserFromBearer(token);
  if (!user) return unauthorized(authErr ?? "Sign in required");

  const body = await request.json().catch(() => null);
  const reportId = body?.reportId as string | undefined;
  if (!reportId) return badRequest("reportId is required");

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return ok({ error: "Server is not configured for this action." }, { status: 503 });
  }

  const { data: report, error: repErr } = await admin
    .from("reports")
    .select("id, category, description, display_address, ward_id, support_count, lat, lng")
    .eq("id", reportId)
    .maybeSingle();
  if (repErr) return ok({ error: repErr.message }, { status: 500 });
  if (!report) return ok({ error: "Report not found" }, { status: 404 });

  let wardLabel = "Chennai";
  if (report.ward_id) {
    const { data: w } = await admin.from("wards").select("ward_name, ward_number").eq("id", report.ward_id).maybeSingle();
    if (w?.ward_name != null || w?.ward_number != null) {
      wardLabel = formatWardLabel(w.ward_number, w.ward_name) || wardLabel;
    }
  }

  let representative: { name: string; role: string; area?: string } | null = null;
  if (report.ward_id) {
    const category = String(report.category) as IssueCategory;
    const responsibility = getResponsibilityForCategory(category);
    const primaryRole = responsibility?.primaryRole;
    const { data: reps } = await admin
      .from("representatives")
      .select("name, role, area")
      .eq("ward_id", report.ward_id);
    const match =
      (primaryRole ? reps?.find((r) => r.role === primaryRole) : undefined) ?? reps?.[0] ?? null;
    if (match) {
      representative = {
        name: String(match.name),
        role: String(match.role),
        area: match.area ? String(match.area) : undefined,
      };
    }
  }

  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nammaporuppu.in").replace(/\/$/, "");
  const reportUrl = `${origin}/explore-map?reportId=${report.id}&wardId=${report.ward_id}`;
  const suggested_text = buildIssueTweetText({
    category: String(report.category),
    description: report.description ? String(report.description) : null,
    address: String(report.display_address ?? ""),
    wardLabel,
    cityId: "chennai",
    cityName: "Chennai",
    reportUrl,
    representative,
    supportCount: typeof report.support_count === "number" ? report.support_count : undefined,
    lat: typeof report.lat === "number" ? report.lat : null,
    lng: typeof report.lng === "number" ? report.lng : null,
  });

  const { data: inserted, error: insErr } = await admin
    .from("social_amplify_requests")
    .insert({
      report_id: reportId,
      requested_by: user.id,
      suggested_text,
      status: "pending",
    })
    .select("id")
    .single();

  if (insErr) {
    if (insErr.code === "23505") {
      return ok({ error: "A pending amplification request already exists for this report." }, { status: 409 });
    }
    return ok({ error: insErr.message }, { status: 500 });
  }

  return created({ id: inserted.id });
}
