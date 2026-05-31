import { Metadata } from "next";
import { PageBody, PageHero } from "@/components/site-page-shell";

export const metadata: Metadata = {
  title: "Data Sources",
  description: "Learn about the data sources used by NammaPoruppu to map civic issues and ward boundaries across Tamil Nadu cities.",
};

export default function DataSourcesPage() {
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Transparency"
        title="Data sources"
        subtitle="Public datasets and systems that power maps and ward data on NammaPoruppu."
        tone="accent"
        containerWidth="3xl"
      />
      <PageBody maxWidth="3xl">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <p className="text-sm text-slate-600">
          Major sources we rely on:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>OpenStreetMap (locality and geospatial reference data).</li>
          <li>
            Greater Chennai Corporation ward boundaries and ward metadata (Chennai).
          </li>
          <li>
            Coimbatore and Madurai municipal ward boundaries (2024 delimitation) from{" "}
            <a
              href="https://data.opencity.in/"
              target="_blank"
              rel="noreferrer"
              className="text-brand-700 hover:underline"
            >
              OpenCity.in
            </a>{" "}
            (source: livingatlas.esri.in, public domain).
          </li>
          <li>User-submitted civic reports, photos, and support signals.</li>
        </ul>
      </div>
      </PageBody>
    </main>
  );
}
