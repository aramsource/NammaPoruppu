import { badRequest, forbidden, ok, unauthorized } from "@/lib/http";
import { assertAdminUserId, getBearerToken, getUserFromBearer } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

function isValidXStatusUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "x.com" && host !== "twitter.com") return false;
    return /\/status\/\d+/.test(u.pathname);
  } catch {
    return false;
  }
}

function statusIdFromUrl(url: string): string | null {
  const m = url.trim().match(/\/status\/(\d+)/);
  return m?.[1] ?? null;
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
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

  const body = await request.json().catch(() => null);
  const twitter_url = typeof body?.twitter_url === "string" ? body.twitter_url.trim() : "";
  if (!twitter_url) return badRequest("twitter_url is required");
  if (!isValidXStatusUrl(twitter_url)) {
    return badRequest("twitter_url must be an X or Twitter post URL containing /status/<id>");
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return ok({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured." }, { status: 503 });
  }

  const { data: row } = await admin.from("social_amplify_requests").select("id, status").eq("id", id).maybeSingle();
  if (!row) return ok({ error: "Request not found" }, { status: 404 });
  if (row.status !== "pending") return badRequest("Only pending requests can be marked posted");

  const twitter_post_id = statusIdFromUrl(twitter_url);

  const { error } = await admin
    .from("social_amplify_requests")
    .update({
      status: "posted",
      twitter_url,
      twitter_post_id: twitter_post_id,
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return ok({ error: error.message }, { status: 500 });
  return ok({ ok: true, twitter_url, twitter_post_id });
}
