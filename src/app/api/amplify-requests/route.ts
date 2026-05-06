import { badRequest, created, ok, unauthorized } from "@/lib/http";
import { getBearerToken, getUserFromBearer } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function buildSuggestedTweet(input: {
  category: string;
  wardLabel: string;
  address: string;
  reportUrl: string;
}) {
  const typeTag = input.category.replace(/[^a-zA-Z0-9]/g, "") || "CivicIssue";
  const tags = `#NammaPoruppu #Chennai #${typeTag}`;
  let line = `Civic issue (${input.category}) in ${input.wardLabel}, Chennai: ${input.address}. View & support: ${input.reportUrl} ${tags}`;
  if (line.length > 275) line = `${line.slice(0, 272)}…`;
  return line;
}

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
    .select("id, category, display_address, ward_id")
    .eq("id", reportId)
    .maybeSingle();
  if (repErr) return ok({ error: repErr.message }, { status: 500 });
  if (!report) return ok({ error: "Report not found" }, { status: 404 });

  let wardLabel = "Chennai";
  if (report.ward_id) {
    const { data: w } = await admin.from("wards").select("ward_name, ward_number").eq("id", report.ward_id).maybeSingle();
    if (w?.ward_name != null && w.ward_number != null) {
      wardLabel = `Ward ${w.ward_number} · ${w.ward_name}`;
    } else if (w?.ward_name) {
      wardLabel = w.ward_name;
    }
  }

  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nammaporuppu.in").replace(/\/$/, "");
  const reportUrl = `${origin}/explore-map?reportId=${report.id}&wardId=${report.ward_id}`;
  const suggested_text = buildSuggestedTweet({
    category: String(report.category),
    wardLabel,
    address: String(report.display_address ?? ""),
    reportUrl,
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
