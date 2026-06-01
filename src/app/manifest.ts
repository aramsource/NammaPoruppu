import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NammaPoruppu — Civic accountability",
    short_name: "NammaPoruppu",
    description:
      "Report civic issues in your city, gain community support, and hold local officials accountable.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#c41e3a",
    orientation: "portrait-primary",
    categories: ["government", "utilities"],
    icons: [
      {
        src: "/logo/navLogo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/navLogo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
