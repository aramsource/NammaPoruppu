/** OAuth redirect target; must match Supabase Auth → URL Configuration redirect allow list. */
export function getAuthCallbackUrl() {
  if (typeof window === "undefined") {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    return site ? `${site}/auth/callback` : "/auth/callback";
  }
  return `${window.location.origin}/auth/callback`;
}
