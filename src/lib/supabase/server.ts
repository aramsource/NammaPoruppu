import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

function requiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Supabase env var: ${name}`);
  }
  return value;
}

const url = normalizeSupabaseUrl(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"));
const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createSupabaseServerClient() {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Use ONLY in trusted server routes/actions.
export function createSupabaseAdminClient() {
  return createClient(url, serviceRoleKey ?? requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
