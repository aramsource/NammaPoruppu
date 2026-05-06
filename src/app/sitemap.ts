import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nammaporuppu.in";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${siteUrl}/explore-map`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${siteUrl}/report-issue`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${siteUrl}/data-sources`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let wardRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = createSupabaseServerClient();
    const { data: wards } = await supabase.from("wards").select("id, updated_at");
    if (wards) {
      wardRoutes = wards.map((w) => ({
        url: `${siteUrl}/wards/${w.id}`,
        lastModified: w.updated_at ? new Date(w.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Silently skip ward routes if Supabase is unavailable at build time
  }

  return [...staticRoutes, ...wardRoutes];
}
