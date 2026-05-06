import { Metadata } from "next";
import { PageBody, PageHero } from "@/components/site-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the NammaPoruppu privacy policy to understand how we handle your data on the Chennai civic accountability platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Effective date: April 2025"
        tone="accent"
        containerWidth="3xl"
      />
      <PageBody maxWidth="3xl">
      <div className="space-y-8 rounded-2xl bg-white p-8 ring-1 ring-slate-200">

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">1. What We Collect</h2>
          <p className="text-sm text-slate-600">
            When you use NammaPoruppu, we may collect the following information:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              <strong>Account information</strong> - your email address or phone number, used only for
              authentication via Supabase.
            </li>
            <li>
              <strong>Civic reports</strong> - the title, description, category, location (ward /
              locality), and photos you submit when reporting an issue.
            </li>
            <li>
              <strong>Support signals</strong> - records of reports you have upvoted to indicate
              community support.
            </li>
            <li>
              <strong>Escalation records</strong> - if you escalate a report, the escalation reason
              and timestamp are stored.
            </li>
            <li>
              <strong>Usage data</strong> - basic server logs (IP address, browser type) retained by
              our hosting infrastructure for security and debugging purposes.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">2. How We Use Your Data</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>To display civic reports publicly on the platform so the community and officials can act on them.</li>
            <li>To send you a one-time sign-in link or OTP for authentication - we do not send marketing emails.</li>
            <li>To show support counts, escalation status, and resolve proofs to promote accountability.</li>
            <li>To moderate content and remove reports that violate our Terms of Use.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">3. Data Storage and Security</h2>
          <p className="text-sm text-slate-600">
            All data is stored in{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-brand-700 hover:underline"
            >
              Supabase
            </a>
            , a hosted PostgreSQL platform with row-level security enabled. Report photos are stored
            in Supabase Storage. We use HTTPS for all data in transit. We do not sell or share your
            personal data with third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">4. Public vs. Private Data</h2>
          <p className="text-sm text-slate-600">
            Civic reports, photos, support counts, and escalation statuses are <strong>publicly visible</strong> to
            anyone visiting the platform - this is intentional for civic accountability.
            Your email address or phone number is <strong>never</strong> displayed publicly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">5. Cookies and Local Storage</h2>
          <p className="text-sm text-slate-600">
            We use browser local storage to remember your selected city preference. Supabase uses
            a session cookie to keep you logged in. We do not use third-party tracking or advertising
            cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">6. Your Rights</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>You can request deletion of your account and associated data at any time.</li>
            <li>You can delete your own escalation records directly from the platform.</li>
            <li>
              For data requests or corrections, email us at{" "}
              <a href="mailto:hello@nammaporuppu.in" className="text-brand-700 hover:underline">
                hello@nammaporuppu.in
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">7. Changes to This Policy</h2>
          <p className="text-sm text-slate-600">
            We may update this policy as the platform evolves. Changes will be reflected here with an
            updated effective date. Continued use of the platform after changes constitutes acceptance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-800">8. Contact</h2>
          <p className="text-sm text-slate-600">
            Questions about this policy? Reach us at{" "}
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
