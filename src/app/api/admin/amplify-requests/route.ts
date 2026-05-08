import { forbidden, ok, unauthorized } from "@/lib/http";
import { assertAdminUserId, getBearerToken, getUserFromBearer } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type ReportImageRow = { image_url: string; image_kind: string; created_at: string };

function reportImageUrls(reports: { report_images: ReportImageRow[] | null } | null): string[] {
  const imgs = reports?.report_images;
  if (!imgs?.length) return [];
  const reportOnly = imgs
    .filter((i) => i.image_kind === "report")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return reportOnly.map((i) => i.image_url).filter(Boolean);
}

export async function GET(request: Request) {
  const token = getBearerToken(request);
  const { user, error: authErr } = await getUserFromBearer(token);
  if (!user) return unauthorized(authErr ?? "Sign in required");

  try {
    assertAdminUserId(user.id);
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    if (status === 403) return forbidden();
    if (status === 503) {
      return ok({ error: e instanceof Error ? e.message : "Not configured" }, { status: 503 });
    }
    return ok({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return ok({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("social_amplify_requests")
    .select(
      `
      id,
      report_id,
      requested_by,
      status,
      suggested_text,
      twitter_post_id,
      twitter_url,
      created_at,
      reports (
        report_images ( image_url, image_kind, created_at )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return ok({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((row) => {
    const typed = row as Record<string, unknown> & {
      reports: { report_images: ReportImageRow[] | null } | { report_images: ReportImageRow[] | null }[] | null;
    };
    const { reports: reportsRaw, ...rest } = typed;
    const reports = Array.isArray(reportsRaw) ? reportsRaw[0] ?? null : reportsRaw;
    const imageUrls = reportImageUrls(reports);
    return {
      ...rest,
      report_image_urls: imageUrls,
      primary_report_image_url: imageUrls[0] ?? null,
    };
  });

  return ok({ data: rows });
}
