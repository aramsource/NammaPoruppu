import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

function getUrlAndAnon() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anon) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anon };
}

export async function getUserFromBearer(accessToken: string | null) {
  if (!accessToken) return { user: null as null, error: "Missing bearer token" };
  const { url, anon } = getUrlAndAnon();
  const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return { user: null as null, error: error?.message ?? "Invalid session" };
  return { user: data.user, error: null as null };
}

export function getBearerToken(request: Request) {
  const h = request.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  return h.slice(7).trim();
}

export function assertAdminUserId(userId: string) {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowed.length) {
    const err = new Error("ADMIN_USER_IDS is not configured");
    (err as Error & { status?: number }).status = 503;
    throw err;
  }
  if (!allowed.includes(userId)) {
    const err = new Error("Forbidden");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}
