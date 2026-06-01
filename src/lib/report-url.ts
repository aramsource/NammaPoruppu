import { issueCategories, type IssueCategory } from "@/lib/domain";

export function isIssueCategory(value: string): value is IssueCategory {
  return (issueCategories as readonly string[]).includes(value);
}

export function buildReportIssueUrl(params: {
  lat?: number;
  lng?: number;
  category?: string;
}) {
  const sp = new URLSearchParams();
  if (params.lat != null && params.lng != null && Number.isFinite(params.lat) && Number.isFinite(params.lng)) {
    sp.set("lat", String(params.lat));
    sp.set("lng", String(params.lng));
  }
  if (params.category && isIssueCategory(params.category)) {
    sp.set("category", params.category);
  }
  const q = sp.toString();
  return `/report-issue${q ? `?${q}` : ""}`;
}
