import { escalationSteps } from "@/lib/accountability-config";
import type { Report, Representative, RepresentativeRole, Ward } from "@/lib/domain";
import { getResponsibilityForCategory } from "@/lib/responsibility";
import { ROLE_ORDER } from "@/lib/representative-labels";

export type RepresentativeAccountabilityRow = {
  representative: Representative;
  ward: Ward;
  total: number;
  open: number;
  resolved: number;
  pendingVerification: number;
  resolutionRate: number;
  overdueOpen: number;
  responseTargetHours: number;
  avgResolutionDays: number | null;
  topCategory: string | null;
  /** MLA / MP: constituency-wide label instead of a single ward */
  scopeLabel?: string | null;
  wardCount?: number;
};

type MutableBucket = {
  representative: Representative;
  ward: Ward;
  total: number;
  open: number;
  resolved: number;
  pendingVerification: number;
  overdueOpen: number;
  responseTargetHours: number;
  resolutionMs: number[];
  categoryCounts: Map<string, number>;
};

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function resolveRepForReport(
  wardId: string,
  primaryRole: RepresentativeRole,
  repByWardRole: Map<string, Representative>,
  repsByWard: Map<string, Representative[]>,
): Representative | null {
  const direct = repByWardRole.get(`${wardId}:${primaryRole}`);
  if (direct) return direct;

  const fallbackRoles: RepresentativeRole[] = [
    "Councillor",
    "WardEngineer",
    "SanitaryInspector",
    "ZonalOfficer",
    "MLA",
    "MP",
  ];
  for (const role of fallbackRoles) {
    const rep = repByWardRole.get(`${wardId}:${role}`);
    if (rep) return rep;
  }

  const wardReps = repsByWard.get(wardId);
  return wardReps?.[0] ?? null;
}

function emptyBucket(rep: Representative, ward: Ward): MutableBucket {
  return {
    representative: rep,
    ward,
    total: 0,
    open: 0,
    resolved: 0,
    pendingVerification: 0,
    overdueOpen: 0,
    responseTargetHours: escalationSteps[rep.role]?.responseTargetHours ?? 48,
    resolutionMs: [],
    categoryCounts: new Map(),
  };
}

function applyReportToBucket(report: Report, bucket: MutableBucket) {
  bucket.total += 1;
  bucket.categoryCounts.set(report.category, (bucket.categoryCounts.get(report.category) ?? 0) + 1);

  if (report.status === "resolved") {
    bucket.resolved += 1;
    const ms = Date.now() - new Date(report.createdAt).getTime();
    if (Number.isFinite(ms) && ms >= 0) bucket.resolutionMs.push(ms);
  } else if (report.status === "pending_verification") {
    bucket.pendingVerification += 1;
    bucket.open += 1;
  } else if (report.status === "open") {
    bucket.open += 1;
    if (hoursSince(report.createdAt) > bucket.responseTargetHours) {
      bucket.overdueOpen += 1;
    }
  }
}

function bucketToRow(
  b: MutableBucket,
  extra?: { scopeLabel?: string | null; wardCount?: number },
): RepresentativeAccountabilityRow {
  const topCategory =
    [...b.categoryCounts.entries()].sort((a, c) => c[1] - a[1])[0]?.[0] ?? null;
  const avgResolutionDays =
    b.resolutionMs.length > 0
      ? Math.round(
          b.resolutionMs.reduce((s, v) => s + v, 0) / b.resolutionMs.length / (1000 * 60 * 60 * 24),
        )
      : null;

  return {
    representative: b.representative,
    ward: b.ward,
    total: b.total,
    open: b.open,
    resolved: b.resolved,
    pendingVerification: b.pendingVerification,
    resolutionRate: b.total > 0 ? Math.round((b.resolved / b.total) * 100) : 0,
    overdueOpen: b.overdueOpen,
    responseTargetHours: b.responseTargetHours,
    avgResolutionDays,
    topCategory,
    scopeLabel: extra?.scopeLabel ?? null,
    wardCount: extra?.wardCount,
  };
}

/**
 * Attribute each report to the ward official matching the category's primary role
 * (with councillor fallback when engineers/inspectors are not seeded), include all
 * representatives, and compute resolution / overdue metrics.
 */
export function computeRepresentativeAccountability(
  representatives: Representative[],
  wardsById: Map<string, Ward>,
  reports: Report[],
): RepresentativeAccountabilityRow[] {
  const repByWardRole = new Map<string, Representative>();
  const repsByWard = new Map<string, Representative[]>();
  for (const rep of representatives) {
    repByWardRole.set(`${rep.wardId}:${rep.role}`, rep);
    const list = repsByWard.get(rep.wardId) ?? [];
    list.push(rep);
    repsByWard.set(rep.wardId, list);
  }

  const buckets = new Map<string, MutableBucket>();
  const mlaByAc = new Map<
    string,
    { rep: Representative; ward: Ward; wardIds: Set<string> }
  >();

  for (const rep of representatives) {
    const ward = wardsById.get(rep.wardId);
    if (!ward) continue;

    if (rep.role === "MLA") {
      const ac = ward.assemblyConstituency;
      if (!mlaByAc.has(ac)) {
        mlaByAc.set(ac, { rep, ward, wardIds: new Set() });
      }
      mlaByAc.get(ac)!.wardIds.add(ward.id);
      continue;
    }

    buckets.set(rep.id, emptyBucket(rep, ward));
  }

  const mlaBuckets = new Map<string, MutableBucket>();
  for (const [ac, meta] of mlaByAc) {
    mlaBuckets.set(ac, emptyBucket(meta.rep, meta.ward));
  }

  function ensureBucket(rep: Representative, ward: Ward): MutableBucket {
    const key = rep.id;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        representative: rep,
        ward,
        total: 0,
        open: 0,
        resolved: 0,
        pendingVerification: 0,
        overdueOpen: 0,
        responseTargetHours: escalationSteps[rep.role]?.responseTargetHours ?? 48,
        resolutionMs: [],
        categoryCounts: new Map(),
      };
      buckets.set(key, bucket);
    }
    return bucket;
  }

  for (const report of reports) {
    if (report.status === "withdrawn") continue;
    const ward = wardsById.get(report.governance.wardId);
    if (!ward) continue;

    const responsibility = getResponsibilityForCategory(report.category);
    if (!responsibility) continue;

    const rep = resolveRepForReport(
      ward.id,
      responsibility.primaryRole,
      repByWardRole,
      repsByWard,
    );
    if (!rep) continue;

    const bucket = ensureBucket(rep, ward);
    applyReportToBucket(report, bucket);

    const mlaMeta = mlaByAc.get(ward.assemblyConstituency);
    if (mlaMeta) {
      const mlaBucket = mlaBuckets.get(ward.assemblyConstituency);
      if (mlaBucket) applyReportToBucket(report, mlaBucket);
    }
  }

  const wardRows = [...buckets.values()].map((b) => bucketToRow(b));
  const mlaRows = [...mlaByAc.entries()].map(([ac, meta]) => {
    const b = mlaBuckets.get(ac)!;
    const label = meta.rep.constituency ?? ac;
    return bucketToRow(b, {
      scopeLabel: `${label} · ${meta.wardIds.size} wards`,
      wardCount: meta.wardIds.size,
    });
  });

  const rows = [...wardRows, ...mlaRows];

  return rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.open !== a.open) return b.open - a.open;
    const roleDiff =
      ROLE_ORDER.indexOf(a.representative.role) - ROLE_ORDER.indexOf(b.representative.role);
    if (roleDiff !== 0) return roleDiff;
    return a.representative.name.localeCompare(b.representative.name);
  });
}

/** One ward card: councillor + MLA for that ward's assembly constituency. */
export type WardElectedGroup = {
  ward: Ward;
  wardOpen: number;
  wardTotal: number;
  councillor: RepresentativeAccountabilityRow | null;
  mla: RepresentativeAccountabilityRow | null;
};

function constituencyKeys(...values: (string | null | undefined)[]): string[] {
  const keys = new Set<string>();
  for (const value of values) {
    const key = (value ?? "").trim().toLowerCase();
    if (key) keys.add(key);
  }
  return [...keys];
}

function mlaScopeLabel(
  rep: Representative,
  anchorWard: Ward,
  wardsById: Map<string, Ward>,
): string {
  const ac = anchorWard.assemblyConstituency;
  const wardCount = [...wardsById.values()].filter((w) => w.assemblyConstituency === ac).length;
  return `${rep.constituency ?? ac} · ${wardCount} wards`;
}

function rowForRepresentative(
  rep: Representative,
  ward: Ward,
  wardsById: Map<string, Ward>,
): RepresentativeAccountabilityRow {
  const extra =
    rep.role === "MLA"
      ? { scopeLabel: mlaScopeLabel(rep, ward, wardsById), wardCount: undefined }
      : undefined;
  return bucketToRow(emptyBucket(rep, ward), extra);
}

export function buildWardElectedGroups(
  representatives: Representative[],
  wardsById: Map<string, Ward>,
  reports: Report[],
): WardElectedGroup[] {
  const rows = computeRepresentativeAccountability(representatives, wardsById, reports);

  const councillorByWardId = new Map<string, RepresentativeAccountabilityRow>();
  const mlaByAcKey = new Map<string, RepresentativeAccountabilityRow>();
  for (const row of rows) {
    if (row.representative.role === "Councillor") {
      councillorByWardId.set(row.ward.id, row);
    }
    if (row.representative.role === "MLA") {
      for (const key of constituencyKeys(
        row.ward.assemblyConstituency,
        row.representative.constituency,
      )) {
        mlaByAcKey.set(key, row);
      }
    }
  }

  for (const rep of representatives) {
    if (rep.role !== "MLA") continue;
    const anchorWard = wardsById.get(rep.wardId);
    if (!anchorWard) continue;
    const keys = constituencyKeys(anchorWard.assemblyConstituency, rep.constituency);
    const hasRow = keys.some((k) => mlaByAcKey.has(k));
    if (hasRow) continue;
    const fallback = rowForRepresentative(rep, anchorWard, wardsById);
    for (const key of keys) mlaByAcKey.set(key, fallback);
  }

  function resolveCouncillor(wardId: string): RepresentativeAccountabilityRow | null {
    const row = councillorByWardId.get(wardId);
    if (row) return row;
    const rep = representatives.find((r) => r.wardId === wardId && r.role === "Councillor");
    const ward = wardsById.get(wardId);
    if (!rep || !ward) return null;
    return rowForRepresentative(rep, ward, wardsById);
  }

  function resolveMla(ward: Ward): RepresentativeAccountabilityRow | null {
    for (const key of constituencyKeys(ward.assemblyConstituency)) {
      const row = mlaByAcKey.get(key);
      if (row) return row;
    }
    const rep = representatives.find((r) => {
      if (r.role !== "MLA") return false;
      const anchor = wardsById.get(r.wardId);
      if (!anchor) return false;
      return constituencyKeys(anchor.assemblyConstituency, r.constituency).some((k) =>
        constituencyKeys(ward.assemblyConstituency).includes(k),
      );
    });
    if (!rep) return null;
    const anchorWard = wardsById.get(rep.wardId) ?? ward;
    return rowForRepresentative(rep, anchorWard, wardsById);
  }

  const wardCounts = new Map<string, { open: number; total: number }>();
  for (const report of reports) {
    if (report.status === "withdrawn") continue;
    const wardId = report.governance.wardId;
    const cur = wardCounts.get(wardId) ?? { open: 0, total: 0 };
    cur.total += 1;
    if (report.status !== "resolved") cur.open += 1;
    wardCounts.set(wardId, cur);
  }

  const groups: WardElectedGroup[] = [];
  for (const [wardId, counts] of wardCounts) {
    const ward = wardsById.get(wardId);
    if (!ward) continue;

    const councillor = resolveCouncillor(wardId);
    const mla = resolveMla(ward);
    if (!counts.total && !councillor && !mla) continue;

    groups.push({
      ward,
      wardOpen: counts.open,
      wardTotal: counts.total,
      councillor,
      mla,
    });
  }

  return groups.sort((a, b) => b.wardOpen - a.wardOpen || b.wardTotal - a.wardTotal);
}

export function mapRepresentativeRow(r: {
  id: string;
  name: string;
  role: string;
  ward_id: string;
  area: string;
  constituency?: string | null;
  party?: string | null;
  party_color?: string | null;
  photo_url?: string | null;
  email: string;
  helpline: string;
  office_hours: string;
  preferred_channel: string;
}): Representative {
  return {
    id: r.id,
    name: r.name,
    role: r.role as RepresentativeRole,
    wardId: r.ward_id,
    area: r.area,
    constituency: r.constituency ?? undefined,
    party: r.party ?? undefined,
    partyColor: r.party_color ?? undefined,
    photoUrl: r.photo_url ?? undefined,
    email: r.email,
    helpline: r.helpline,
    officeHours: r.office_hours,
    preferredChannel: r.preferred_channel as Representative["preferredChannel"],
  };
}
