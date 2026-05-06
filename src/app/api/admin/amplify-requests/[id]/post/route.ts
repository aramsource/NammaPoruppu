import { badRequest, forbidden, ok, unauthorized } from "@/lib/http";
import { assertAdminUserId, getBearerToken, getUserFromBearer } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { postTweetV2OAuth1 } from "@/lib/twitter-post-oauth1";

type Params = { params: Promise<{ id: string }> };

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

  const ck = process.env.TWITTER_API_KEY;
  const cs = process.env.TWITTER_API_SECRET;
  const at = process.env.TWITTER_ACCESS_TOKEN;
  const ats = process.env.TWITTER_ACCESS_SECRET;
  if (!ck || !cs || !at || !ats) {
    return ok(
      { error: "Missing Twitter OAuth 1.0a env vars: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET" },
      { status: 501 },
    );
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return ok({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured." }, { status: 503 });
  }

  const { data: row, error: rowErr } = await admin
    .from("social_amplify_requests")
    .select("id, status, suggested_text")
    .eq("id", id)
    .maybeSingle();

  if (rowErr) return ok({ error: rowErr.message }, { status: 500 });
  if (!row) return ok({ error: "Request not found" }, { status: 404 });
  if (row.status !== "pending") return badRequest("Only pending requests can be posted");

  const tweet = await postTweetV2OAuth1({
    consumerKey: ck,
    consumerSecret: cs,
    accessToken: at,
    accessTokenSecret: ats,
    text: row.suggested_text,
  });

  if (!tweet.ok) {
    return ok({ error: `Twitter API error (${tweet.status}): ${tweet.body}` }, { status: 502 });
  }

  const handle = (process.env.OFFICIAL_X_HANDLE ?? "nammaporuppu").replace(/^@/, "");
  const twitter_url = `https://x.com/${handle}/status/${tweet.id}`;

  const { error: upErr } = await admin
    .from("social_amplify_requests")
    .update({
      status: "posted",
      twitter_post_id: tweet.id,
      twitter_url,
    })
    .eq("id", id)
    .eq("status", "pending");

  if (upErr) return ok({ error: upErr.message }, { status: 500 });
  return ok({ twitter_url, twitter_post_id: tweet.id });
}
