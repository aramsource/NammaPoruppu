import { PageBody, PageHero } from "@/components/site-page-shell";

export default function SavedAreasPage() {
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Coming soon"
        title="Saved areas"
        subtitle="Bookmark localities and watch nearby issues, on the roadmap for a future release."
        tone="dark"
        containerWidth="3xl"
      />
      <PageBody maxWidth="3xl">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">
            We&apos;re building this so you can follow the streets and neighbourhoods you care about most.
          </p>
        </div>
      </PageBody>
    </main>
  );
}
