import type { Report, Representative } from "@/lib/domain";
import type { RepresentativeAccountabilityRow } from "@/lib/representative-accountability";
import { ROLE_LABEL } from "@/lib/representative-labels";

function csvCell(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(cells: (string | number | null | undefined)[]): string {
  return cells.map(csvCell).join(",");
}

function downloadCsvLines(filename: string, lines: string[]) {
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function datedFilename(cityId: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `nammaporuppu-${cityId}-data-${date}.csv`;
}

const ISSUE_HEADERS = [
  "report_id",
  "category",
  "status",
  "ward_id",
  "ward_number",
  "ward_name",
  "zone",
  "assembly_constituency",
  "address",
  "lat",
  "lng",
  "support_count",
  "created_at",
] as const;

const REP_HEADERS = [
  "representative_id",
  "name",
  "role",
  "party",
  "ward_id",
  "ward_name",
  "zone",
  "assembly_constituency",
  "area",
  "constituency",
  "email",
  "helpline",
  "office_hours",
  "preferred_channel",
  "scope_label",
  "total_issues",
  "open",
  "resolved",
  "overdue_open",
  "resolution_rate_pct",
  "top_category",
  "avg_resolution_days",
] as const;

/** Single CSV: issues block, then representatives (profile + accountability). */
export function exportCityDataCsv(
  cityId: string,
  reports: Report[],
  representatives: Representative[],
  accountabilityRows: RepresentativeAccountabilityRow[],
) {
  const accByRepId = new Map(accountabilityRows.map((row) => [row.representative.id, row]));

  const lines: string[] = [
    csvRow(["section", "Issues"]),
    csvRow([...ISSUE_HEADERS]),
    ...reports.map((r) =>
      csvRow([
        r.id,
        r.category,
        r.status,
        r.governance.wardId,
        r.governance.wardNumber,
        r.governance.wardName,
        r.governance.zoneName,
        r.governance.assemblyConstituency,
        r.address,
        r.lat,
        r.lng,
        r.supportCount,
        r.createdAt,
      ]),
    ),
    "",
    csvRow(["section", "Representatives"]),
    csvRow([...REP_HEADERS]),
    ...representatives.map((rep) => {
      const row = accByRepId.get(rep.id);
      const ward = row?.ward;
      return csvRow([
        rep.id,
        rep.name,
        ROLE_LABEL[rep.role],
        rep.party ?? "",
        rep.wardId,
        ward?.wardName ?? "",
        ward?.zoneName ?? "",
        ward?.assemblyConstituency ?? rep.constituency ?? "",
        rep.area,
        rep.constituency ?? "",
        rep.email,
        rep.helpline,
        rep.officeHours,
        rep.preferredChannel,
        row?.scopeLabel ?? "",
        row?.total ?? "",
        row?.open ?? "",
        row?.resolved ?? "",
        row?.overdueOpen ?? "",
        row?.resolutionRate ?? "",
        row?.topCategory ?? "",
        row?.avgResolutionDays ?? "",
      ]);
    }),
  ];

  downloadCsvLines(datedFilename(cityId), lines);
}
