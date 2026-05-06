import { EscalationStep, RepresentativeRole } from "@/lib/domain";

type EscalationFlowchartProps = {
  roles: RepresentativeRole[];
  currentRole: RepresentativeRole | null;
  steps: Record<RepresentativeRole, EscalationStep>;
};

export function EscalationFlowchart({
  roles,
  currentRole,
  steps,
}: EscalationFlowchartProps) {
  if (!roles.length) {
    return (
      <section className="rounded-xl border bg-white p-4">
        <h3 className="font-semibold text-slate-900">Escalation Flow</h3>
        <p className="mt-2 text-sm text-slate-600">
          No escalation flow configured for this category.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">Escalation Flow</h3>
      <div className="mt-4 space-y-0">
        {roles.map((role, index) => {
          const step = steps[role];
          const isCurrent = role === currentRole;
          return (
            <div key={role} className="flex gap-3">
              <div className="flex w-8 flex-col items-center">
                <span
                  className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {index + 1}
                </span>
                {index < roles.length - 1 ? (
                  <span className="mt-1 h-12 w-px bg-slate-300" aria-hidden />
                ) : null}
              </div>
              <article
                className={`mb-2 flex-1 rounded-xl border px-3 py-2 text-xs ${
                  isCurrent
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <p className="font-semibold">{role}</p>
                <p>{step.stepTitle}</p>
                <p className="mt-1">Target: {step.responseTargetHours}h</p>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
