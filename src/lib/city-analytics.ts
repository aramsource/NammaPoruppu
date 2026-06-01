import { issueCategories, type IssueCategory, type Report, type Representative, type Ward } from "@/lib/domain";
import {
  buildWardElectedGroups,
  computeRepresentativeAccountability,
  type RepresentativeAccountabilityRow,
  type WardElectedGroup,
} from "@/lib/representative-accountability";

export type WardStat = {
  ward: Ward;
  total: number;
  resolved: number;
  open: number;
  rate: number;
};

export type CategoryStat = {
  cat: IssueCategory;
  total: number;
  resolved: number;
  open: number;
};

export type ZoneStat = {
  zone: string;
  total: number;
  resolved: number;
  open: number;
  rate: number;
};

export type ConstituencyStat = {
  constituency: string;
  total: number;
  resolved: number;
  open: number;
  rate: number;
  wardCount: number;
};

export type CityAnalytics = {
  totalReports: number;
  resolvedReports: number;
  openReports: number;
  totalSupport: number;
  resolutionRate: number;
  latestReports: number;
  resolvedThisWeek: number;
  latestDataAt: string | null;
  activeWardCount: number;
  wardStats: WardStat[];
  activeWardStats: WardStat[];
  bestWards: WardStat[];
  worstWards: WardStat[];
  catStats: CategoryStat[];
  zoneStats: ZoneStat[];
  constituencyStats: ConstituencyStat[];
  wardElectedGroups: WardElectedGroup[];
  repAccountability: RepresentativeAccountabilityRow[];
};

export function computeCityAnalytics(
  reports: Report[],
  wards: Ward[],
  representatives: Representative[],
): CityAnalytics {
  const totalReports = reports.length;
  const resolvedReports = reports.filter((r) => r.status === "resolved").length;
  const openReports = totalReports - resolvedReports;
  const totalSupport = reports.reduce((s, r) => s + r.supportCount, 0);
  const resolutionRate = Math.round((resolvedReports / Math.max(totalReports, 1)) * 100);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const latestReports = reports.filter((r) => new Date(r.createdAt).getTime() >= oneWeekAgo).length;
  const resolvedThisWeek = reports.filter(
    (r) => r.status === "resolved" && new Date(r.createdAt).getTime() >= oneWeekAgo,
  ).length;
  const latestDataAt = reports.length
    ? new Date(Math.max(...reports.map((r) => new Date(r.createdAt).getTime()))).toLocaleString(
        "en-IN",
        { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" },
      )
    : null;

  const wardStats: WardStat[] = wards
    .map((ward) => {
      const wardReports = reports.filter((r) => r.governance.wardId === ward.id);
      const total = wardReports.length;
      const resolved = wardReports.filter((r) => r.status === "resolved").length;
      const open = total - resolved;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      return { ward, total, resolved, open, rate };
    })
    .sort((a, b) => b.total - a.total);

  const activeWardStats = wardStats.filter((w) => w.total > 0);
  const bestWards = [...activeWardStats].sort((a, b) => b.rate - a.rate).slice(0, 5);
  const worstWards = [...activeWardStats].sort((a, b) => a.rate - b.rate).slice(0, 5);

  const catStats: CategoryStat[] = issueCategories
    .map((cat) => {
      const catReports = reports.filter((r) => r.category === cat);
      const resolved = catReports.filter((r) => r.status === "resolved").length;
      return { cat, total: catReports.length, resolved, open: catReports.length - resolved };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const zoneMap = new Map<string, { total: number; resolved: number }>();
  for (const report of reports) {
    const zone = report.governance.zoneName;
    const cur = zoneMap.get(zone) ?? { total: 0, resolved: 0 };
    cur.total += 1;
    if (report.status === "resolved") cur.resolved += 1;
    zoneMap.set(zone, cur);
  }
  const zoneStats: ZoneStat[] = [...zoneMap.entries()]
    .map(([zone, { total, resolved }]) => ({
      zone,
      total,
      resolved,
      open: total - resolved,
      rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const acMap = new Map<string, { total: number; resolved: number; wards: Set<string> }>();
  for (const report of reports) {
    const ac = report.governance.assemblyConstituency;
    const cur = acMap.get(ac) ?? { total: 0, resolved: 0, wards: new Set<string>() };
    cur.total += 1;
    if (report.status === "resolved") cur.resolved += 1;
    cur.wards.add(report.governance.wardId);
    acMap.set(ac, cur);
  }
  const constituencyStats: ConstituencyStat[] = [...acMap.entries()]
    .map(([constituency, { total, resolved, wards: wardSet }]) => ({
      constituency,
      total,
      resolved,
      open: total - resolved,
      rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      wardCount: wardSet.size,
    }))
    .sort((a, b) => b.total - a.total);

  const wardById = new Map(wards.map((w) => [w.id, w]));
  const wardElectedGroups = buildWardElectedGroups(representatives, wardById, reports);
  const repAccountability = computeRepresentativeAccountability(representatives, wardById, reports);

  return {
    totalReports,
    resolvedReports,
    openReports,
    totalSupport,
    resolutionRate,
    latestReports,
    resolvedThisWeek,
    latestDataAt,
    activeWardCount: activeWardStats.length,
    wardStats,
    activeWardStats,
    bestWards,
    worstWards,
    catStats,
    zoneStats,
    constituencyStats,
    wardElectedGroups,
    repAccountability,
  };
}
