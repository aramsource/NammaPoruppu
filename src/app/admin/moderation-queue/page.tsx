import { PageBody, PageHero } from "@/components/site-page-shell";

export default function ModerationQueuePage() {
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Admin"
        title="Moderation queue"
        subtitle="Abuse reports, spam detection, and issue hide/remove actions."
        tone="dark"
        containerWidth="5xl"
      />
      <PageBody maxWidth="5xl">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Queue UI will appear here.</p>
        </div>
      </PageBody>
    </main>
  );
}
