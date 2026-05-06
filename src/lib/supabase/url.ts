export function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  const normalized = trimmed.replace(/\/rest\/v1$/i, "");
  try {
    const parsed = new URL(normalized);
    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error("Supabase URL must be http or https");
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL. Expected like https://<project-ref>.supabase.co, received: ${rawUrl}`,
    );
  }
}
