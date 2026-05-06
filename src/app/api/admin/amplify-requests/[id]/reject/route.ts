import { badRequest, forbidden, ok, unauthorized } from "@/lib/http";
import { assertAdminUserId, getBearerToken, getUserFromBearer } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return ok({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const admin_note = typeof body?.admin_note === "string" ? body.admin_note.slice(0, 2000) : null;

  const { data: row } = await admin.from("social_amplify_requests").select("id, status").eq("id", id).maybeSingle();
  if (!row) return ok({ error: "Request not found" }, { status: 404 });
  if (row.status !== "pending") return badRequest("Only pending requests can be rejected");

  const { error } = await admin
    .from("social_amplify_requests")
    .update({ status: "rejected", admin_note })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return ok({ error: error.message }, { status: 500 });
  return ok({ ok: true });
}
