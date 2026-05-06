import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nammaporuppu.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth", "/api/", "/my-reports", "/saved-areas"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
