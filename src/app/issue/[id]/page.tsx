import { Metadata } from "next";
import Link from "next/link";
import { PageBody, PageHero } from "@/components/site-page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = createSupabaseServerClient();
    const { data: report } = await supabase
      .from("reports")
      .select("category, display_address, description")
      .eq("id", id)
      .maybeSingle();
    if (report) {
      const title = `${report.category} in ${report.display_address ?? "Chennai"}`;
      const description =
        report.description ??
        `A ${report.category} issue reported in ${report.display_address ?? "Chennai"}. View details, support this issue, and track resolution.`;
      return {
        title,
        description,
        openGraph: { title, description },
        twitter: { title, description },
      };
    }
  } catch {
    // Fall through to defaults
  }
  return { title: "Issue Detail" };
}

export default async function IssueDetailPage({ params }: Params) {
  const { id } = await params;

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Issue"
        title="Issue detail"
        subtitle={`Placeholder view for report ${id}. Full detail page is on the roadmap.`}
        tone="dark"
        containerWidth="3xl"
        actions={
          <Link
            href="/explore-map"
            className="inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Open map
          </Link>
        }
      />
      <PageBody maxWidth="3xl">
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="font-black text-slate-900">MVP fields planned</h2>
          <p className="mt-2 text-sm text-slate-600">
            Photos, category, description, address, pending days, support count, ward info,
            nearby issues, and share URL.
          </p>
          <p className="mt-3 font-mono text-xs text-slate-400">ID: {id}</p>
        </section>
      </PageBody>
    </main>
  );
}
