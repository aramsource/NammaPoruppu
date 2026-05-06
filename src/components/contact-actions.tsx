import { Representative, Report, Ward } from "@/lib/domain";

type ContactActionsProps = {
  representative: Representative | null;
  ward: Ward | null;
  report: Report | null;
};

export function ContactActions({ representative, ward, report }: ContactActionsProps) {
  if (!representative) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Contact Actions</h3>
        <p className="mt-2 text-sm text-slate-600">
          Select a representative to view email and helpline options.
        </p>
      </section>
    );
  }

  const subject = encodeURIComponent(
    `Civic issue escalation - ${ward?.wardName ?? representative.area}`,
  );
  const body = encodeURIComponent(
    [
      `Hello ${representative.name},`,
      "",
      "I am reporting a civic issue via NammaPoruppu.",
      `Ward: ${ward?.wardName ?? representative.wardId}`,
      report ? `Issue ID: ${report.id}` : "Issue ID: Not selected",
      report ? `Category: ${report.category}` : "Category: Not selected",
      report ? `Location: ${report.address}` : "Location: Not selected",
      "",
      "Please review and help resolve this issue.",
      "",
      "Thank you.",
    ].join("\n"),
  );
  const mailtoHref = `mailto:${representative.email}?subject=${subject}&body=${body}`;
  const telHref = `tel:${representative.helpline}`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">Contact Actions</h3>
      <p className="mt-1 text-sm text-slate-600">
        Reach {representative.role} - {representative.name}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={mailtoHref}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Send Email
        </a>
        <a
          href={telHref}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Call Helpline
        </a>
      </div>
      <div className="mt-3 space-y-1 text-xs text-slate-600">
        <p>Email: {representative.email}</p>
        <p>Helpline: {representative.helpline}</p>
        <p>Office Hours: {representative.officeHours}</p>
        <p>Preferred Channel: {representative.preferredChannel}</p>
      </div>
    </section>
  );
}
