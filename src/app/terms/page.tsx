import { Metadata } from "next";
import { PageBody, PageHero } from "@/components/site-page-shell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Read the NammaPoruppu terms of use for the Chennai civic accountability and issue reporting platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        subtitle="Effective date: April 2025"
        tone="accent"
        containerWidth="3xl"
      />
      <PageBody maxWidth="3xl">
      <div className="space-y-8 rounded-2xl bg-white p-8 ring-1 ring-slate-200">

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">1. Acceptance</h2>
          <p className="text-sm text-slate-600">
            By accessing or using NammaPoruppu, you agree to these Terms of Use. If you do not agree,
            please do not use the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">2. Who Can Use This Platform</h2>
          <p className="text-sm text-slate-600">
            NammaPoruppu is open to any resident who wants to report or track civic issues in their
            city. You must provide a valid email address or phone number to create an account. You
            must be at least 13 years old to use this platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">3. What You Can Report</h2>
          <p className="text-sm text-slate-600">
            This platform is for reporting <strong>genuine public civic issues</strong> such as
            potholes, broken streetlights, garbage, stagnant water, drainage problems, and similar
            matters that affect residents in a locality. Reports should be:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Factual, accurate, and based on a real observation.</li>
            <li>Related to a specific public location (ward or locality).</li>
            <li>Accompanied by photos that clearly show the issue, where possible.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">4. Prohibited Content</h2>
          <p className="text-sm text-slate-600">You must not use this platform to:</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Submit false, misleading, or fabricated reports.</li>
            <li>Post personal information (name, address, phone number) of private individuals.</li>
            <li>Upload photos that contain faces, sensitive personal data, or inappropriate content.</li>
            <li>Harass, defame, or target specific individuals or businesses.</li>
            <li>Spam or submit duplicate reports for the same issue.</li>
            <li>Use automated bots or scripts to submit reports.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">5. Your Content</h2>
          <p className="text-sm text-slate-600">
            You retain ownership of the content you submit (reports, photos). By submitting, you
            grant NammaPoruppu a non-exclusive, royalty-free licence to display, store, and share
            your content as part of the platform&apos;s civic accountability purpose. We may
            reproduce report details in communications with relevant authorities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">6. Public Visibility</h2>
          <p className="text-sm text-slate-600">
            All submitted reports, photos, support counts, and escalation statuses are publicly
            visible by design. Do not include any personal information you are not comfortable
            sharing publicly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">7. Moderation and Takedown</h2>
          <p className="text-sm text-slate-600">
            We reserve the right to remove or hide any report that violates these terms without prior
            notice. If you believe a report has been removed in error, contact us at{" "}
            <a href="mailto:hello@nammaporuppu.in" className="text-brand-700 hover:underline">
              hello@nammaporuppu.in
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">8. No Warranty</h2>
          <p className="text-sm text-slate-600">
            NammaPoruppu is provided &ldquo;as is&rdquo; without any warranty. We do not guarantee
            that reports will result in official action, that the platform will be available at all
            times, or that information on the platform is error-free.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">9. Limitation of Liability</h2>
          <p className="text-sm text-slate-600">
            To the fullest extent permitted by law, Aram Source and NammaPoruppu contributors are
            not liable for any indirect, incidental, or consequential damages arising from your use
            of the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">10. Changes to These Terms</h2>
          <p className="text-sm text-slate-600">
            We may update these terms as the platform grows. Changes will be posted here with an
            updated effective date. Continued use after changes means you accept the new terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">11. Contact</h2>
          <p className="text-sm text-slate-600">
            Questions about these terms? Reach us at{" "}
            <a href="mailto:hello@nammaporuppu.in" className="text-brand-700 hover:underline">
              hello@nammaporuppu.in
            </a>
            .
          </p>
        </section>
      </div>
      </PageBody>
    </main>
  );
}
