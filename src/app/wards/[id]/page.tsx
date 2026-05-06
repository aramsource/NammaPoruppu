"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { ContactActions } from "@/components/contact-actions";
import { EscalationFlowchart } from "@/components/escalation-flowchart";
import { WardResponsibilityPanel } from "@/components/ward-responsibility-panel";
import { Report, Representative, Ward } from "@/lib/domain";
import {
  getEscalationSteps,
  getResponsibilityForCategory,
} from "@/lib/responsibility";
import { PageBody, PageHero } from "@/components/site-page-shell";
import { supabaseClient } from "@/lib/supabase/client";

const IssueMapView = dynamic(
  () => import("@/components/issue-map-view").then((mod) => mod.IssueMapView),
  { ssr: false },
);

type Params = { params: { id: string } };

export default function WardDashboardPage({ params }: Params) {
  const [liveWard, setLiveWard] = useState<Ward | null>(null);
  const [liveReports, setLiveReports] = useState<Report[] | null>(null);
  const [liveRepresentatives, setLiveRepresentatives] = useState<Representative[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const ward = liveWard;
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [{ data: w, error: wErr }, { data: reps, error: repErr }, { data: reports, error: reportsErr }, { data: images, error: imgErr }] = await Promise.all([
          supabaseClient.from("wards").select("*").eq("id", params.id).maybeSingle(),
          supabaseClient.from("representatives").select("*").eq("ward_id", params.id),
          supabaseClient.from("reports").select("*").eq("ward_id", params.id),
          supabaseClient.from("report_images").select("report_id,image_url,created_at").order("created_at", { ascending: true }),
        ]);
        if (wErr) throw wErr;
        if (repErr) throw repErr;
        if (reportsErr) throw reportsErr;
        if (imgErr) throw imgErr;
        if (mounted && w) {
          setLiveWard({
            id: w.id,
            wardNumber: w.ward_number,
            wardName: w.ward_name,
            zoneName: w.zone_name,
            city: "Chennai",
            assemblyConstituency: w.assembly_constituency ?? "Unknown",
            boundary: [],
          });
        }
        if (mounted && reps) {
          setLiveRepresentatives(
            reps.map((r) => ({
              id: r.id,
              name: r.name,
              role: r.role,
              wardId: r.ward_id,
              area: r.area,
              constituency: r.constituency,
              party: r.party,
              partyColor: r.party_color,
              photoUrl: r.photo_url,
              email: r.email,
              helpline: r.helpline,
              officeHours: r.office_hours,
              preferredChannel: r.preferred_channel,
            })),
          );
        }
        if (mounted && reports) {
          const imageMap = new Map<string, string[]>();
          for (const img of images ?? []) {
            const arr = imageMap.get(img.report_id) ?? [];
            arr.push(img.image_url);
            imageMap.set(img.report_id, arr);
          }
          const wardMeta = w
            ? {
                id: w.id,
                wardName: w.ward_name,
                wardNumber: w.ward_number,
                zoneName: w.zone_name,
                city: "Chennai",
                assemblyConstituency: w.assembly_constituency ?? "Unknown",
              }
            : null;
          if (wardMeta) {
            setLiveReports(
              reports.map((r) => ({
                id: r.id,
                userId: "anon",
                category: r.category,
                description: r.description,
                lat: r.lat,
                lng: r.lng,
                address: r.display_address,
                status: r.status,
                supportCount: r.support_count ?? 0,
                createdAt: r.created_at,
                governance: {
                  wardId: wardMeta.id,
                  wardName: wardMeta.wardName,
                  wardNumber: wardMeta.wardNumber,
                  zoneName: wardMeta.zoneName,
                  city: wardMeta.city,
                  assemblyConstituency: wardMeta.assemblyConstituency,
                },
                imageUrls: imageMap.get(r.id) ?? [],
              })),
            );
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load ward data");
        }
      }
    }
    load();
    return () => { mounted = false; };
  }, [params.id]);
  const reports = useMemo(
    () => liveReports ?? [],
    [liveReports],
  );
  const selectedReport = reports[0] ?? null;
  const responsibility = selectedReport
    ? getResponsibilityForCategory(selectedReport.category)
    : null;
  const representatives = ward ? (liveRepresentatives ?? []) : [];
  const [selectedRepresentativeId, setSelectedRepresentativeId] = useState<string | null>(null);
  const selectedRepresentative =
    representatives.find((rep) => rep.id === selectedRepresentativeId) ??
    representatives.find((rep) => rep.role === responsibility?.primaryRole) ??
    representatives[0] ??
    null;
  const totalSupports = reports.reduce((sum, report) => sum + report.supportCount, 0);

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Ward governance"
        title={ward ? ward.wardName : "Ward"}
        subtitle={
          ward
            ? `Ward ${ward.wardNumber} · ${ward.zoneName} · ${ward.city}`
            : `Loading… (${params.id})`
        }
        tone="brand"
        containerWidth="7xl"
      />
      <PageBody maxWidth="7xl" className="pt-6 md:pt-8">
      {loadError ? (
        <p className="mb-4 text-sm text-brand-600">Failed to load from Supabase: {loadError}</p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="font-semibold">Open Issues</h2>
          <p className="mt-2 text-sm text-slate-600">{reports.length} issue(s) in this ward.</p>
        </article>
        <article className="rounded-2xl border border-amber-100 bg-white p-5">
          <h2 className="font-semibold">Top Categories</h2>
          <p className="mt-2 text-sm text-slate-600">
            {reports.length
              ? reports
                  .slice(0, 3)
                  .map((report) => report.category)
                  .join(", ")
              : "No category data yet"}
          </p>
        </article>
        <article className="rounded-2xl border border-emerald-100 bg-white p-5">
          <h2 className="font-semibold">Primary Responsible</h2>
          <p className="mt-2 text-sm text-slate-600">
            {responsibility?.primaryRole ?? "Not mapped for current issue set"}
          </p>
        </article>
        <article className="rounded-2xl border border-sky-100 bg-white p-5">
          <h2 className="font-semibold">Support Signals</h2>
          <p className="mt-2 text-sm text-slate-600">{totalSupports} total supports</p>
        </article>
      </section>

      {ward ? (
        <section className="mt-6 h-[420px] overflow-hidden rounded-2xl border border-slate-200">
          <IssueMapView
            reports={reports}
            wards={[ward]}
            selectedWardId={ward.id}
            selectedReportId={null}
            onWardSelect={() => {}}
            onIssueClick={() => {}}
          />
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <WardResponsibilityPanel
          ward={ward}
          representatives={representatives}
          primaryRole={responsibility?.primaryRole ?? null}
          selectedRepresentativeId={selectedRepresentative?.id ?? null}
          onSelectRepresentative={setSelectedRepresentativeId}
        />
        <EscalationFlowchart
          roles={responsibility?.escalationOrder ?? []}
          currentRole={responsibility?.primaryRole ?? null}
          steps={getEscalationSteps()}
        />
        <ContactActions
          representative={selectedRepresentative}
          ward={ward}
          report={selectedReport}
        />
      </section>
      </PageBody>
    </main>
  );
}
