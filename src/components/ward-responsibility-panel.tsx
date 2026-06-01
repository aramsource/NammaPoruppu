"use client";

import { Representative, RepresentativeRole, Ward } from "@/lib/domain";
import { ROLE_ICON, ROLE_LABEL, ROLE_ORDER } from "@/lib/representative-labels";

type WardResponsibilityPanelProps = {
  ward: Ward | null;
  representatives: Representative[];
  primaryRole: RepresentativeRole | null;
  selectedRepresentativeId: string | null;
  onSelectRepresentative: (representativeId: string) => void;
};

export function WardResponsibilityPanel({
  ward,
  representatives,
  primaryRole,
  selectedRepresentativeId,
  onSelectRepresentative,
}: WardResponsibilityPanelProps) {
  if (!ward) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-900">Accountability</h3>
        <p className="mt-2 text-sm text-slate-500">Select a ward to view the responsible officials.</p>
      </section>
    );
  }

  if (!representatives.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-900">Accountability</h3>
        <p className="mt-2 text-sm text-slate-500">No officials on record for this ward.</p>
      </section>
    );
  }

  const sorted = [...representatives].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <h3 className="font-bold text-slate-900">Officials - Ward {ward.wardNumber}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{ward.wardName} · {ward.zoneName}</p>
      </div>

      <div className="divide-y divide-slate-100">
        {sorted.map((rep) => {
          const isSelected = selectedRepresentativeId === rep.id;
          const isPrimary = rep.role === primaryRole;
          const isElected = rep.role === "Councillor" || rep.role === "MLA" || rep.role === "MP";

          return (
            <div
              key={rep.id}
              className={`p-4 transition-colors ${isSelected ? "bg-slate-900" : "hover:bg-slate-50 cursor-pointer"}`}
              onClick={() => onSelectRepresentative(rep.id)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {rep.photoUrl ? (
                    <img
                      src={rep.photoUrl}
                      alt={rep.name}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-200 bg-slate-100"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                      {ROLE_ICON[rep.role]}
                    </div>
                  )}
                  {isPrimary && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white ring-1 ring-white">
                      ★
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-1.5">
                    <p className={`font-semibold leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {rep.name}
                    </p>
                    {rep.party && rep.partyColor && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: rep.partyColor }}
                      >
                        {rep.party}
                      </span>
                    )}
                    {isPrimary && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Primary contact
                      </span>
                    )}
                  </div>

                  <p className={`mt-0.5 text-xs font-medium ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {ROLE_ICON[rep.role]} {ROLE_LABEL[rep.role]}
                  </p>

                  {rep.constituency && (
                    <p className={`mt-0.5 text-xs truncate ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                      {rep.constituency}
                    </p>
                  )}

                  <p className={`mt-1 text-[11px] ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                    🕐 {rep.officeHours}
                  </p>

                  {/* Contact buttons */}
                  <div className="mt-2.5 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${rep.helpline}`}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-white/15 text-white hover:bg-white/25"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                      {rep.helpline}
                    </a>
                    <a
                      href={`mailto:${rep.email}`}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-white/15 text-white hover:bg-white/25"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                      Email
                    </a>
                    {isElected && (
                      <a
                        href={`https://wa.me/91${rep.helpline.replace(/[^0-9]/g, "").slice(-10)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-white/15 text-white hover:bg-white/25"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - GCC helpline */}
      <div className="border-t border-slate-100 bg-brand-50 px-5 py-3">
        <p className="text-xs font-semibold text-brand-800">🆘 GCC 24×7 Helpline</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <a href="tel:1913" className="text-xs font-bold text-brand-700 hover:underline">📞 1913 - Civic complaints</a>
          <span className="text-slate-300">·</span>
          <a href="tel:1916" className="text-xs font-bold text-brand-700 hover:underline">💧 1916 - Water / Sewage</a>
        </div>
      </div>
    </section>
  );
}
