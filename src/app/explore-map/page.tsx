"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useMemo, useState, useEffect } from "react";
import { EscalationFlowchart } from "@/components/escalation-flowchart";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { issueCategories, ReportStatus, Report, Representative, Ward } from "@/lib/domain";
import { getEscalationSteps, getResponsibilityForCategory } from "@/lib/responsibility";
import { useCity } from "@/context/city-context";
import { useTranslation } from "@/context/language-context";
import { categoryLabel, statusLabel } from "@/lib/i18n";
import { useAuth } from "@/context/auth-context";
import { supabaseClient } from "@/lib/supabase/client";
import { getContactForCategory, getContactsForCity } from "@/lib/civic-contacts";

const IssueMapView = dynamic(
  () => import("@/components/issue-map-view").then((m) => m.IssueMapView),
  { ssr: false },
);

const CAT_COLORS: Record<string, string> = {
  Pothole: "bg-orange-100 text-orange-700",
  Garbage: "bg-green-100 text-green-800",
  "Broken Footpath": "bg-yellow-100 text-yellow-800",
  "Dust Pollution": "bg-stone-100 text-stone-700",
  Waterlogging: "bg-blue-100 text-blue-700",
  "Sewage Leak": "bg-purple-100 text-purple-700",
  "Streetlight Issue": "bg-amber-100 text-amber-700",
  Encroachment: "bg-red-100 text-red-700",
  Drainage: "bg-teal-100 text-teal-800",
  Other: "bg-slate-100 text-slate-700",
};

const PARTY_COLORS: Record<string, string> = {
  DMK: "bg-red-50 text-red-700 border border-red-200",
  AIADMK: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  BJP: "bg-orange-50 text-orange-700 border border-orange-200",
  INC: "bg-blue-50 text-blue-700 border border-blue-200",
  Independent: "bg-slate-50 text-slate-600 border border-slate-200",
  "CPI(M)": "bg-rose-50 text-rose-700 border border-rose-200",
  CPI: "bg-rose-50 text-rose-800 border border-rose-200",
  VCK: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  MDMK: "bg-red-50 text-red-800 border border-red-200",
  IUML: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  AMMK: "bg-purple-50 text-purple-700 border border-purple-200",
  TVK: "bg-amber-50 text-amber-800 border border-amber-200",
  NTK: "bg-slate-800 text-white border border-slate-700",
};

type DrawerTab = "issue" | "accountability" | "contact";
type EscalationInfo = {
  id: string;
  status: "open" | "acknowledged" | "closed" | string;
  reason: string | null;
  escalationLevel: number | null;
  createdAt: string;
  updatedAt: string;
  escalatorUserId: string | null;
};

const LEGACY_ESCALATION_REASON = "Escalated by reporter from My Reports";

function getEscalationReasonLabel(reason: string | null | undefined) {
  const clean = (reason ?? "").trim();
  if (!clean || clean === LEGACY_ESCALATION_REASON) {
    return "Issue is still unresolved and needs higher-level attention.";
  }
  return clean;
}

function normalizeAreaToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function localityPlaceRank(placeType: string | null | undefined) {
  switch ((placeType ?? "").toLowerCase()) {
    case "suburb":
      return 0;
    case "neighbourhood":
      return 1;
    case "quarter":
      return 2;
    case "village":
      return 3;
    case "hamlet":
      return 4;
    default:
      return 9;
  }
}

/** For twitter intent `hashtags=` — comma-separated, no # prefix. */
function shareHashtagsForCategory(category: string, cityName: string) {
  const typeTag = category.replace(/[^a-zA-Z0-9]/g, "") || "CivicIssue";
  const cityTag = cityName.replace(/[^a-zA-Z0-9]/g, "") || "TamilNadu";
  return `NammaPoruppu,${cityTag},${typeTag}`;
}

export default function ExploreMapPage() {
  const { city } = useCity();
  const { t, locale } = useTranslation();
  const { user, session } = useAuth();
  const escalationSteps = useMemo(() => getEscalationSteps(), []);
  const [liveReports, setLiveReports] = useState<Report[] | null>(null);
  const [liveRepresentatives, setLiveRepresentatives] = useState<Representative[] | null>(null);
  const [liveWards, setLiveWards] = useState<Ward[] | null>(null);
  const [wardAreaHints, setWardAreaHints] = useState<Record<string, string>>({});
  const [wardAreaSearchIndex, setWardAreaSearchIndex] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");

  // ── Filters ──
  const [selCategory, setSelCategory] = useState<string>("all");
  const [selStatus, setSelStatus] = useState<ReportStatus | "all">("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [wardSearchOpen, setWardSearchOpen] = useState(false);
  const [wardSearchQuery, setWardSearchQuery] = useState("");
  const wardSearchRef = useRef<HTMLInputElement>(null);

  const activeFilterCount = (selCategory !== "all" ? 1 : 0) + (selStatus !== "all" ? 1 : 0);

  // ── Map selection ──
  const [activeWardId, setActiveWardId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // ── Drawer ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("issue");

  // ── Issue state ──
  const [upvotes, setUpvotes] = useState<Record<string, boolean>>({});
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, ReportStatus>>({});
  const [proofImages, setProofImages] = useState<Record<string, string>>({});
  const [escalationsByReportId, setEscalationsByReportId] = useState<Record<string, EscalationInfo>>({});
  const [deletingEscalationReportId, setDeletingEscalationReportId] = useState<string | null>(null);
  const [confirmDeleteEscalation, setConfirmDeleteEscalation] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [resolveFlowOpen, setResolveFlowOpen] = useState(false);
  const [resolveUploading, setResolveUploading] = useState(false);
  const [resolveUploadProgress, setResolveUploadProgress] = useState(0);
  const [resolveUploadError, setResolveUploadError] = useState("");
  const [supportError, setSupportError] = useState("");
  const [selRepId, setSelRepId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [amplifyQueueBusy, setAmplifyQueueBusy] = useState(false);
  /** Expanded media viewer inside the same drawer (no popup overlay). */
  const [expandedMedia, setExpandedMedia] = useState<{ type: "before" | "after" | null; index: number }>({
    type: null,
    index: 0,
  });
  const expandedSwipeStartXRef = useRef<number | null>(null);

  function pushToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportsSource = liveReports ?? [];
  const representativesSource = liveRepresentatives ?? [];
  const wardsSource = liveWards ?? [];

  useEffect(() => {
    setActiveWardId(null);
    setSelectedReportId(null);
    setDrawerOpen(false);
    setLiveReports(null);
    setLiveWards(null);
    setLiveRepresentatives(null);
  }, [city.id]);

  useEffect(() => {
    let mounted = true;
    async function loadSupabaseData() {
      try {
        const [reportsRes, repsRes, reportImagesRes, wardsApiRes, localitiesRes, escalationsRes] = await Promise.all([
          supabaseClient
            .from("reports")
            .select("id, category, description, lat, lng, display_address, neighbourhood, status, support_count, created_at, ward_id, reporter_user_id, reporter_session_id")
            .eq("city_id", city.id)
            .neq("status", "withdrawn"),
          supabaseClient
            .from("representatives")
            .select("id, ward_id, name, role, area, constituency, party, party_color, photo_url, email, helpline, office_hours, preferred_channel"),
          supabaseClient
            .from("report_images")
            .select("report_id, image_url, image_kind, created_at")
            .order("created_at", { ascending: true }),
          fetch(`/api/wards?cityId=${encodeURIComponent(city.id)}`, { cache: "no-store" }),
          supabaseClient
            .from("ward_localities")
            .select("ward_id, locality_name, is_verified, place_type")
            .eq("city_id", city.id),
          supabaseClient
            .from("report_escalations")
            .select("id, report_id, status, reason, escalation_level, created_at, updated_at, escalator_user_id")
            .order("created_at", { ascending: false }),
        ]);
        if (reportsRes.error) throw reportsRes.error;
        if (repsRes.error) throw repsRes.error;
        if (reportImagesRes.error) throw reportImagesRes.error;
        if (escalationsRes.error) throw escalationsRes.error;
        if (!wardsApiRes.ok) {
          throw new Error(`Failed to load wards (${wardsApiRes.status})`);
        }
        const wardsApiPayload = (await wardsApiRes.json()) as { data?: Ward[]; error?: string };
        if (wardsApiPayload.error) throw new Error(wardsApiPayload.error);
        const wards: Ward[] = wardsApiPayload.data ?? [];
        const wardMap = new Map(wards.map((w) => [w.id, w]));
        const wardIds = new Set(wards.map((w) => w.id));
        if (mounted) setLiveWards(wards);

        if (mounted && reportsRes.data) {
          const escalationMap: Record<string, EscalationInfo> = {};
          for (const row of escalationsRes.data ?? []) {
            if (!escalationMap[row.report_id]) {
              escalationMap[row.report_id] = {
                status: row.status,
                reason: row.reason ?? null,
                escalationLevel: row.escalation_level ?? null,
                createdAt: row.created_at,
                updatedAt: row.updated_at ?? row.created_at,
                id: row.id,
                escalatorUserId: row.escalator_user_id ?? null,
              };
            }
          }
          setEscalationsByReportId(escalationMap);
          const beforeImageMap = new Map<string, string[]>();
          const proofImageMap = new Map<string, string>();
          const areaCountsByWard = new Map<string, Map<string, number>>();
          for (const img of reportImagesRes.data ?? []) {
            const kind = (img.image_kind ?? "").toLowerCase();
            if (kind === "resolve_proof") {
              proofImageMap.set(img.report_id, img.image_url);
              continue;
            }
            const arr = beforeImageMap.get(img.report_id) ?? [];
            arr.push(img.image_url);
            beforeImageMap.set(img.report_id, arr);
          }
          setProofImages(Object.fromEntries(proofImageMap.entries()));
          const hints: Record<string, string> = {};
          const searchIndex: Record<string, string> = {};
          if (!localitiesRes.error && localitiesRes.data?.length) {
            const byWard = new Map<string, Array<{ localityName: string; isVerified: boolean; placeType: string | null }>>();
            for (const row of localitiesRes.data) {
              const localityName = (row.locality_name ?? "").trim();
              if (!localityName || !row.ward_id) continue;
              const list = byWard.get(row.ward_id) ?? [];
              list.push({
                localityName,
                isVerified: Boolean(row.is_verified),
                placeType: row.place_type,
              });
              byWard.set(row.ward_id, list);
            }
            for (const [wardId, list] of byWard.entries()) {
              const deduped = [...new Map(list.map((l) => [normalizeAreaToken(l.localityName), l])).values()];
              deduped.sort((a, b) => {
                if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
                const rankDiff = localityPlaceRank(a.placeType) - localityPlaceRank(b.placeType);
                if (rankDiff !== 0) return rankDiff;
                return a.localityName.localeCompare(b.localityName);
              });
              if (deduped[0]) hints[wardId] = deduped[0].localityName;
              searchIndex[wardId] = deduped.map((l) => l.localityName.toLowerCase()).join(" ");
            }
          }

          for (const row of reportsRes.data) {
            const area = (row.neighbourhood ?? row.display_address?.split(",")[0] ?? "").trim();
            if (!area || !row.ward_id) continue;
            const counts = areaCountsByWard.get(row.ward_id) ?? new Map<string, number>();
            counts.set(area, (counts.get(area) ?? 0) + 1);
            areaCountsByWard.set(row.ward_id, counts);
          }
          for (const [wardId, counts] of areaCountsByWard.entries()) {
            if (hints[wardId]) continue;
            const topArea = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
            if (topArea) hints[wardId] = topArea;
            if (!searchIndex[wardId]) searchIndex[wardId] = [...counts.keys()].join(" ").toLowerCase();
          }
          setWardAreaHints(hints);
          setWardAreaSearchIndex(searchIndex);
          const mapped = reportsRes.data
            .map((r) => {
              const ward = wardMap.get(r.ward_id);
              if (!ward) return null;
              return {
                id: r.id,
                userId: "anon",
                reporterUserId: r.reporter_user_id ?? null,
                reporterSessionId: r.reporter_session_id ?? null,
                category: r.category as Report["category"],
                description: r.description,
                lat: r.lat,
                lng: r.lng,
                address: r.display_address,
                status: r.status as ReportStatus,
                supportCount: r.support_count ?? 0,
                createdAt: r.created_at,
                governance: {
                  wardId: ward.id,
                  wardName: ward.wardName,
                  wardNumber: ward.wardNumber,
                  zoneName: ward.zoneName,
                  city: ward.city,
                  assemblyConstituency: ward.assemblyConstituency,
                },
                imageUrls: beforeImageMap.get(r.id) ?? [],
              } as Report;
            })
            .filter(Boolean) as Report[];
          setLiveReports(mapped);
        }

        if (mounted && repsRes.data) {
          const reps: Representative[] = repsRes.data
            .filter((r) => wardIds.has(r.ward_id))
            .map((r) => ({
            id: r.id,
            wardId: r.ward_id,
            name: r.name,
            role: r.role as Representative["role"],
            area: r.area,
            constituency: r.constituency,
            party: r.party,
            partyColor: r.party_color,
            photoUrl: r.photo_url,
            email: r.email,
            helpline: r.helpline,
            officeHours: r.office_hours,
            preferredChannel: r.preferred_channel as Representative["preferredChannel"],
          }));
          setLiveRepresentatives(reps);
        }
      } catch (err: unknown) {
        if (mounted) setLoadError(err instanceof Error ? err.message : "Failed to load map data");
      }
    }
    loadSupabaseData();
    return () => { mounted = false; };
  }, [city.id]);

  // ── Helpers ──
  const getStatus = (id: string, fallback: ReportStatus) => resolvedOverrides[id] ?? fallback;
  const wardById = useMemo(
    () => new Map(wardsSource.map((w) => [w.id, w])),
    [wardsSource],
  );
  const reportCountByWardId = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of reportsSource) m.set(r.governance.wardId, (m.get(r.governance.wardId) ?? 0) + 1);
    return m;
  }, [reportsSource]);

  const filteredReports = useMemo(
    () =>
      reportsSource.filter((r) => {
        if (selCategory !== "all" && r.category !== selCategory) return false;
        if (selStatus !== "all" && getStatus(r.id, r.status) !== selStatus) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportsSource, resolvedOverrides, selCategory, selStatus],
  );

  const resolvedWardIds = useMemo(() => {
    const grouped = new Map<string, { total: number; resolved: number }>();
    for (const r of reportsSource) {
      const cur = grouped.get(r.governance.wardId) ?? { total: 0, resolved: 0 };
      cur.total += 1;
      if ((resolvedOverrides[r.id] ?? r.status) === "resolved") cur.resolved += 1;
      grouped.set(r.governance.wardId, cur);
    }
    const set = new Set<string>();
    for (const [wardId, stat] of grouped.entries()) {
      if (stat.total > 0 && stat.total === stat.resolved) set.add(wardId);
    }
    return set;
  }, [reportsSource, resolvedOverrides]);

  const selectedReport = useMemo(
    () => filteredReports.find((r) => r.id === selectedReportId) ?? null,
    [filteredReports, selectedReportId],
  );

  const wardReports = useMemo(
    () => filteredReports.filter((r) => r.governance.wardId === activeWardId),
    [filteredReports, activeWardId],
  );

  const selectedWard = useMemo(
    () => (activeWardId ? wardById.get(activeWardId) ?? null : null),
    [activeWardId, wardById],
  );
  const selectedWardArea = useMemo(() => {
    if (!selectedWard) return "";
    const raw = wardAreaHints[selectedWard.id] ?? "";
    if (!raw) return "";
    const area = normalizeAreaToken(raw);
    const wardName = normalizeAreaToken(selectedWard.wardName);
    const zoneName = normalizeAreaToken(selectedWard.zoneName);
    if (!area || area === wardName || area === zoneName) return "";
    if (wardName.includes(area) || area.includes(wardName)) return "";
    if (zoneName.includes(area) || area.includes(zoneName)) return "";
    return raw;
  }, [selectedWard, wardAreaHints]);

  const filteredWardOptions = useMemo(() => {
    const q = wardSearchQuery.trim().toLowerCase();
    return q
      ? wardsSource.filter((w) => {
          const area = wardAreaSearchIndex[w.id] ?? wardAreaHints[w.id]?.toLowerCase() ?? "";
          return (
            w.wardName.toLowerCase().includes(q) ||
            String(w.wardNumber).includes(q) ||
            w.zoneName.toLowerCase().includes(q) ||
            area.includes(q)
          );
        })
      : wardsSource;
  }, [wardSearchQuery, wardsSource, wardAreaHints, wardAreaSearchIndex]);

  function handleWardSearchSelect(wardId: string) {
    setWardSearchOpen(false);
    setWardSearchQuery("");
    handleWardSelect(wardId);
  }

  const responsibility = selectedReport ? getResponsibilityForCategory(selectedReport.category) : null;
  const representatives = activeWardId ? representativesSource.filter((r) => r.wardId === activeWardId) : [];
  const primaryRep = representatives.find((r) => r.role === responsibility?.primaryRole) ?? representatives[0];
  const selectedRep = representatives.find((r) => r.id === selRepId) ?? primaryRep ?? null;
  const electedReps = representatives.filter(
    (r) => r.role === "Councillor" || r.role === "MLA" || r.role === "MP",
  );
  const officials = representatives.filter(
    (r) => r.role !== "Councillor" && r.role !== "MLA" && r.role !== "MP",
  );
  const hasRepresentativeData = representatives.length > 0;

  const currentStatus = selectedReport ? getStatus(selectedReport.id, selectedReport.status) : "open";
  const isResolved = currentStatus === "resolved";
  const isPendingVerification = currentStatus === "pending_verification";
  const currentSessionId = useMemo(() => {
    if (typeof window === "undefined") return "server";
    const existing = localStorage.getItem("np_session_id");
    if (existing) return existing;
    const generated = `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    localStorage.setItem("np_session_id", generated);
    return generated;
  }, []);
  const isReporterForSelected = Boolean(
    selectedReport &&
      (
        (user && selectedReport.reporterUserId === user.id) ||
        (selectedReport.reporterSessionId && selectedReport.reporterSessionId === currentSessionId)
      ),
  );
  const pendingDays = selectedReport
    ? Math.max(1, Math.ceil((Date.now() - new Date(selectedReport.createdAt).getTime()) / 86400000))
    : 0;
  const totalSupport = (selectedReport?.supportCount ?? 0) + (upvotes[selectedReport?.id ?? ""] ? 1 : 0);
  const beforeImages = useMemo(() => {
    const raw = selectedReport?.imageUrls ?? [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const url of raw) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
    return out;
  }, [selectedReport?.id, selectedReport?.imageUrls]);
  const afterImageSrc =
    selectedReport && (isPendingVerification || isResolved)
      ? (proofImages[selectedReport.id] ?? "")
      : "";
  const selectedEscalation = selectedReport ? escalationsByReportId[selectedReport.id] ?? null : null;
  const canDeleteSelectedEscalation = Boolean(
    selectedReport &&
      selectedEscalation &&
      user &&
      selectedEscalation.escalatorUserId === user.id,
  );
  const getSessionId = () => {
    if (typeof window === "undefined") return "server";
    const existing = localStorage.getItem("np_session_id");
    if (existing) return existing;
    const generated = `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    localStorage.setItem("np_session_id", generated);
    return generated;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get("reportId");
    const wardId = params.get("wardId");
    if (!reportId || reportsSource.length === 0) return;
    const target = reportsSource.find((r) => r.id === reportId);
    if (!target) return;
    setActiveWardId(wardId || target.governance.wardId);
    setSelectedReportId(target.id);
    setDrawerTab("issue");
    setDrawerOpen(true);
  }, [reportsSource]);

  useEffect(() => {
    setExpandedMedia({ type: null, index: 0 });
  }, [selectedReportId]);

  // ── Handlers ──
  function handleWardSelect(wardId: string) {
    setActiveWardId(wardId || null);
    setSelectedReportId(null);
    setDrawerOpen(false);
  }

  function handleIssueClick(reportId: string, wardId: string) {
    setActiveWardId(wardId);
    setSelectedReportId(reportId);
    setSelRepId(null);
    setResolveFlowOpen(false);
    setDrawerTab("issue");
    setDrawerOpen(true);
  }

  async function handleUpvote() {
    if (!selectedReport || upvotes[selectedReport.id]) return;
    if (!user) {
      setSupportError("Sign in required to support this issue.");
      return;
    }
    setSupportError("");
    setUpvotes((p) => ({ ...p, [selectedReport.id]: true }));
    try {
      const { error } = await supabaseClient.from("report_supports").insert({
        report_id: selectedReport.id,
        supporter_session_id: getSessionId(),
        supporter_user_id: user.id,
      });
      if (error) throw error;
    } catch {
      setSupportError("You may have already supported this issue.");
      setUpvotes((p) => ({ ...p, [selectedReport.id]: false }));
    }
  }

  function handleResolveClick() {
    if (!selectedReport || isResolved || isPendingVerification) return;
    setResolveUploadError("");
    setResolveUploadProgress(0);
    setResolveFlowOpen(true);
    setTimeout(() => fileInputRef.current?.click(), 50);
  }

  async function handleProofFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedReport) return;
    const reportId = selectedReport.id;
    const previousProofImage = proofImages[reportId] ?? "";
    setResolveUploading(true);
    setResolveUploadProgress(10);
    setResolveUploadError("");
    const url = URL.createObjectURL(file);
    setProofImages((p) => ({ ...p, [reportId]: url }));
    setResolvedOverrides((p) => ({ ...p, [reportId]: "pending_verification" }));
    setResolveFlowOpen(false);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `resolve-proofs/${reportId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabaseClient.storage
        .from("report-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      setResolveUploadProgress(60);
      const { data: pub } = supabaseClient.storage.from("report-images").getPublicUrl(path);
      const proofUrl = pub.publicUrl;
      await supabaseClient.from("resolve_proofs").insert({
        report_id: reportId,
        proof_image_url: proofUrl,
        note: "Marked resolved from map",
        lat: selectedReport.lat,
        lng: selectedReport.lng,
        accuracy_meters: null,
        verifier_session_id: getSessionId(),
      });
      setResolveUploadProgress(85);
      await supabaseClient.from("report_images").insert({
        report_id: reportId,
        image_url: proofUrl,
        image_kind: "resolve_proof",
      });
      const { error: statusErr } = await supabaseClient
        .from("reports")
        .update({ status: "pending_verification" })
        .eq("id", reportId);
      if (statusErr) throw statusErr;
      setLiveReports((prev) =>
        prev ? prev.map((report) => (report.id === reportId ? { ...report, status: "pending_verification" } : report)) : prev,
      );
      setResolveUploadProgress(100);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: string }).message)
          : "";
      if (msg.toLowerCase().includes("bucket")) {
        setResolveUploadError("Storage bucket not ready. Run supabase/004_seed_all_chennai_wards.sql.");
      } else if (msg.toLowerCase().includes("size") || msg.toLowerCase().includes("too large")) {
        setResolveUploadError("Proof image is too large.");
      } else {
        setResolveUploadError("Could not upload proof image. Please retry.");
      }
      setResolvedOverrides((p) => ({ ...p, [reportId]: "open" }));
      setProofImages((p) => ({ ...p, [reportId]: previousProofImage }));
      setResolveUploadProgress(0);
    } finally {
      setResolveUploading(false);
    }
    e.target.value = "";
  }

  async function handleVerifyResolved() {
    if (!selectedReport || !isPendingVerification) return;
    if (!user) {
      setResolveUploadError("Sign in required to verify resolution.");
      return;
    }
    if (!isReporterForSelected) {
      setResolveUploadError("Only the original reporter can verify this resolution.");
      return;
    }
    setResolveUploadError("");
    const reportId = selectedReport.id;
    setResolvedOverrides((p) => ({ ...p, [reportId]: "resolved" }));
    try {
      const { error } = await supabaseClient
        .from("reports")
        .update({ status: "resolved" })
        .eq("id", reportId);
      if (error) throw error;
      setLiveReports((prev) =>
        prev ? prev.map((report) => (report.id === reportId ? { ...report, status: "resolved" } : report)) : prev,
      );
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: string }).message)
          : "Could not verify resolution.";
      setResolvedOverrides((p) => ({ ...p, [reportId]: "pending_verification" }));
      setResolveUploadError(msg);
    }
  }

  async function handleRejectResolved() {
    if (!selectedReport || !isPendingVerification) return;
    if (!user) {
      setResolveUploadError("Sign in required to reject resolution.");
      return;
    }
    if (!isReporterForSelected) {
      setResolveUploadError("Only the original reporter can reject this resolution.");
      return;
    }
    setResolveUploadError("");
    const reportId = selectedReport.id;
    setResolvedOverrides((p) => ({ ...p, [reportId]: "open" }));
    try {
      const { error } = await supabaseClient
        .from("reports")
        .update({ status: "open" })
        .eq("id", reportId);
      if (error) throw error;
      setLiveReports((prev) =>
        prev ? prev.map((report) => (report.id === reportId ? { ...report, status: "open" } : report)) : prev,
      );
      pushToast("success", "Marked as unresolved.");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: string }).message)
          : "Could not reject resolution.";
      setResolvedOverrides((p) => ({ ...p, [reportId]: "pending_verification" }));
      setResolveUploadError(msg);
    }
  }

  async function handleDeleteSelectedEscalation() {
    if (!selectedReport || !selectedEscalation || !user) return;
    if (selectedEscalation.escalatorUserId !== user.id) {
      pushToast("error", "Only the user who escalated can hard-delete this escalation.");
      return;
    }
    setDeletingEscalationReportId(selectedReport.id);
    try {
      const { error } = await supabaseClient
        .from("report_escalations")
        .delete()
        .eq("id", selectedEscalation.id)
        .eq("escalator_user_id", user.id);
      if (error) throw error;
      setEscalationsByReportId((prev) => {
        const next = { ...prev };
        delete next[selectedReport.id];
        return next;
      });
      setConfirmDeleteEscalation(false);
      pushToast("success", "Escalation removed.");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: string }).message)
          : "Could not delete escalation.";
      pushToast("error", msg);
    } finally {
      setDeletingEscalationReportId(null);
    }
  }

  return (
    <main className="relative h-[calc(100dvh-64px)] w-full overflow-hidden">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProofFile} />

      {/* ── Filter bar (accent hero, matches home) ── */}
      <header className="absolute left-0 right-0 top-0 z-[900] border-b border-white/10 bg-accent-600 shadow-lg">
        <div className="px-3 pb-2 pt-3 md:px-4 md:pb-3 md:pt-4">
          <div className="mb-2 flex flex-wrap items-center gap-2 md:gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
              {city.name} · {t("city.live")}
            </div>
            <h1 className="text-base font-black tracking-tight text-white md:text-lg">{t("explore.title")}</h1>
          </div>
        {/* Row 1: Filters button (mobile) + Ward search (mobile inline) + Desktop chips */}
        <div className="flex items-center gap-2">
          {/* Mobile: Filters button */}
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="relative flex shrink-0 items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-xs font-bold text-white ring-1 ring-white/25 transition hover:bg-white/25 active:bg-white/20 md:hidden"
          >
            <svg className="h-3.5 w-3.5 text-white/80" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            {t("explore.filters")}
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white ring-2 ring-accent-600">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop: full scrollable chip row */}
          <div className="hidden items-center gap-2 overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden md:flex">
            <div className="flex shrink-0 gap-1 rounded-full bg-black/25 p-1 ring-1 ring-white/15">
              <button
                type="button"
                onClick={() => setSelCategory("all")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${selCategory === "all" ? "bg-white text-accent-700 shadow-sm" : "text-white/90 hover:bg-white/10"}`}
              >
                {t("common.all")}
              </button>
              {issueCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelCategory(cat === selCategory ? "all" : cat)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${selCategory === cat ? "bg-white text-accent-700 shadow-sm" : "text-white/90 hover:bg-white/10"}`}
                >
                  {categoryLabel(locale, cat)}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 gap-1 rounded-full bg-black/25 p-1 ring-1 ring-white/15">
              {(["all", "open", "pending_verification", "resolved"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${
                    selStatus === s
                      ? s === "open"
                        ? "bg-brand-500 text-white shadow-sm"
                        : s === "pending_verification"
                          ? "bg-amber-500 text-white shadow-sm"
                          : s === "resolved"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white text-accent-700 shadow-sm"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {s === "all"
                    ? t("common.all")
                    : s === "pending_verification"
                      ? t("common.pending")
                      : statusLabel(locale, s)}
                </button>
              ))}
            </div>
          </div>

          {/* Ward search - flex-1 on mobile (fills space next to Filters), flex-none on desktop (sits right after chips) */}
          <div className="relative z-[10] flex-1 md:flex-none">
            <div className={`flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 ring-1 transition ${wardSearchOpen ? "ring-white/40" : "ring-white/20"}`}>
              <svg className="h-3.5 w-3.5 shrink-0 text-white/60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197" />
              </svg>
              <input
                ref={wardSearchRef}
                type="text"
                placeholder="Search ward"
                value={wardSearchQuery}
                onChange={(e) => { setWardSearchQuery(e.target.value); setWardSearchOpen(true); }}
                onFocus={() => setWardSearchOpen(true)}
                onBlur={() => setTimeout(() => setWardSearchOpen(false), 150)}
                suppressHydrationWarning
                style={{ fontSize: "12px" }}
                className={`bg-transparent font-semibold text-white outline-none placeholder:text-white/45 transition-all ${wardSearchOpen ? "w-36" : activeWardId ? "w-0 opacity-0" : "w-24"}`}
              />
              {activeWardId && !wardSearchOpen && (
                <span
                  className="max-w-[120px] truncate text-xs font-bold text-white"
                  title={`${selectedWard?.wardName ?? ""} · ${selectedWard?.zoneName ?? ""}${selectedWardArea ? ` · ${selectedWardArea}` : ""}`}
                >
                  {selectedWard?.wardName}
                  <span className="font-semibold text-white/65"> · {selectedWard?.zoneName}</span>
                  {selectedWardArea ? <span className="font-semibold text-white/65"> · {selectedWardArea}</span> : null}
                </span>
              )}
              {(activeWardId || wardSearchQuery) && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setWardSearchQuery(""); handleWardSelect(""); }}
                  className="ml-0.5 shrink-0 text-white/55 hover:text-white"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {wardSearchOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-[999] w-[min(18rem,calc(100vw-1rem))] overflow-hidden rounded-2xl bg-white ring-2 ring-slate-200">
                <ul className="max-h-60 overflow-y-auto py-1">
                  {filteredWardOptions.length === 0 && (
                    <li className="px-4 py-3 text-center text-sm text-slate-400">No wards found</li>
                  )}
                  {filteredWardOptions.map((w) => {
                    const count = reportCountByWardId.get(w.id) ?? 0;
                    const isActive = activeWardId === w.id;
                    return (
                      <li key={w.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setWardSearchQuery(""); handleWardSearchSelect(w.id); }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${isActive ? "bg-brand-50" : ""}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-brand-500" : "bg-slate-200"}`} />
                            <span>
                              <span className={`block font-semibold ${isActive ? "text-brand-700" : "text-slate-800"}`}>{w.wardName}</span>
                              <span className="text-xs text-slate-400">
                                Ward #{w.wardNumber} · {w.zoneName}
                                {(() => {
                                  const raw = wardAreaHints[w.id];
                                  if (!raw) return "";
                                  const area = normalizeAreaToken(raw);
                                  const wardName = normalizeAreaToken(w.wardName);
                                  const zoneName = normalizeAreaToken(w.zoneName);
                                  if (!area || area === wardName || area === zoneName) return "";
                                  if (wardName.includes(area) || area.includes(wardName)) return "";
                                  if (zoneName.includes(area) || area.includes(zoneName)) return "";
                                  return ` · ${raw}`;
                                })()}
                              </span>
                            </span>
                          </span>
                          <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${count > 0 ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400"}`}>
                            {count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400">
                  {wardsSource.length} wards · type to filter
                </div>
              </div>
            )}
          </div>
        </div>
        {loadError ? (
          <p className="mt-2 rounded-lg border border-amber-400/35 bg-amber-500/15 px-2.5 py-1.5 text-xs font-medium text-amber-100">
            Live data unavailable: {loadError}
          </p>
        ) : null}

        {/* Mobile: active filter pills - second row */}
        <div className="mt-2 flex flex-wrap gap-1.5 md:hidden">
          {selCategory !== "all" && (
            <span className="flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/20">
              {selCategory}
              <button type="button" onClick={() => setSelCategory("all")} className="ml-0.5 opacity-70 hover:opacity-100">✕</button>
            </span>
          )}
          {selStatus !== "all" && (
            <span className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/20 ${selStatus === "open" ? "bg-brand-500" : selStatus === "pending_verification" ? "bg-amber-500" : "bg-emerald-600"}`}>
              {selStatus === "pending_verification" ? t("common.pending") : statusLabel(locale, selStatus)}
              <button type="button" onClick={() => setSelStatus("all")} className="ml-0.5 opacity-70 hover:opacity-100">✕</button>
            </span>
          )}
        </div>
        </div>
      </header>

      {/* ── Mobile filter bottom sheet ── */}
      {filterSheetOpen && (
        <>
          <div className="fixed inset-0 z-[900] bg-black/40 md:hidden" onClick={() => setFilterSheetOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[910] rounded-t-3xl border-t border-slate-200 bg-white px-5 pb-8 pt-4 md:hidden">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setSelCategory("all"); setSelStatus("all"); }}
                  className="text-xs font-semibold text-brand-600"
                >
                  Clear all
                </button>
              )}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Category</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["all", ...issueCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelCategory(cat)}
                  className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                    selCategory === cat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {cat === "all" ? "All categories" : cat}
                </button>
              ))}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
            <div className="mt-2 flex gap-2">
              {(["all", "open", "pending_verification", "resolved"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelStatus(s)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-semibold capitalize transition ${
                    selStatus === s
                      ? s === "open"
                        ? "bg-brand-500 text-white"
                        : s === "pending_verification"
                          ? "bg-amber-500 text-white"
                          : s === "resolved"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {s === "all"
                    ? t("common.all")
                    : s === "pending_verification"
                      ? t("common.pending")
                      : statusLabel(locale, s)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFilterSheetOpen(false)}
              className="mt-5 w-full rounded-full bg-brand-600 py-3 text-sm font-black text-white transition hover:bg-brand-700 active:scale-[0.98]"
            >
              Show results
            </button>
          </div>
        </>
      )}

      {/* ── Map ── */}
      <IssueMapView
        reports={filteredReports}
        wards={wardsSource}
        selectedWardId={activeWardId}
        selectedReportId={selectedReportId}
        resolvedWardIds={resolvedWardIds}
        wardAreaById={wardAreaHints}
        city={city}
        onWardSelect={handleWardSelect}
        onIssueClick={handleIssueClick}
      />

      {/* ── FAB ── */}
      <Link
        href="/report-issue"
        className="absolute bottom-6 right-6 z-[800] flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-brand-700 active:scale-[0.98]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {t("explore.reportIssueFab")}
      </Link>

      {/* ── Vaul Drawer ── */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      >
        <DrawerContent className="bg-accent-600 md:!left-0 md:!right-0 md:!mx-auto md:!mb-3 md:!w-full md:!max-w-[980px] md:rounded-3xl">
          {/* ── Header (accent hero, matches home) ── */}
          <DrawerHeader className="border-b border-white/10 bg-accent-600 pb-4 pt-2 text-white">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  {selectedWard ? `Ward ${selectedWard.wardNumber} · ${selectedWard.zoneName}` : "Issue"}
                </p>
                <DrawerTitle className="text-lg font-black leading-tight text-white md:text-xl">
                  {selectedWard ? `${selectedWard.wardName} · ${selectedWard.zoneName}` : "Issue Details"}
                </DrawerTitle>
                {selectedWardArea ? <p className="mt-0.5 text-xs font-medium text-white/85">{selectedWardArea}</p> : null}
                {selectedReport && (
                  <DrawerDescription className="mt-0.5 break-words text-sm font-medium text-white/90">
                    {selectedReport.address}
                  </DrawerDescription>
                )}
              </div>
              <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${
                isResolved
                  ? "bg-emerald-300 text-emerald-950"
                  : isPendingVerification
                    ? "bg-amber-300 text-amber-950"
                    : "bg-white/25 text-white ring-1 ring-white/30"
              }`}>
                {isResolved ? "✓ Resolved" : isPendingVerification ? "Pending Verification" : "Open"}
              </span>
            </div>

            {/* Tabs */}
            <div className="mt-3 flex rounded-xl bg-black/25 p-1 ring-1 ring-white/15">
              {(["issue", "accountability", "contact"] as DrawerTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDrawerTab(tab)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold capitalize transition ${
                    drawerTab === tab
                      ? "bg-white font-black text-accent-700 shadow-sm"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </DrawerHeader>

          {/* ── Body ── */}
          <div className="overflow-y-auto rounded-t-3xl bg-white" style={{ maxHeight: "calc(88dvh - 160px)" }}>

            {/* ── ISSUE TAB ── */}
            {drawerTab === "issue" && selectedReport && (
              <div className="px-4 py-4 md:grid md:grid-cols-5 md:gap-5">
                <div className="space-y-4 md:col-span-3">

                {/* Before / After */}
                <div>
                  <div className="mb-2 flex items-center justify-between px-0.5">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-600">
                      <span className="h-2 w-2 rounded-full bg-brand-500" /> Before
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> After
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className={`relative flex gap-2 ${expandedMedia.type ? "flex-col" : ""}`}>
                      <button
                        type="button"
                        onClick={() => {
                          if (beforeImages.length === 0) return;
                          setExpandedMedia((prev) =>
                            prev.type === "before" ? { type: null, index: 0 } : { type: "before", index: 0 },
                          );
                        }}
                        disabled={beforeImages.length === 0}
                        className={`group relative min-w-0 overflow-hidden rounded-2xl border-2 border-brand-100 bg-slate-100 text-left ring-1 ring-slate-100 transition hover:ring-2 hover:ring-accent-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:pointer-events-none disabled:opacity-80 ${
                          expandedMedia.type === "before" ? "h-[260px] w-full" : expandedMedia.type ? "hidden" : "h-[150px] flex-1"
                        }`}
                        onTouchStart={(e) => {
                          if (expandedMedia.type !== "before") return;
                          expandedSwipeStartXRef.current = e.changedTouches[0]?.clientX ?? null;
                        }}
                        onTouchEnd={(e) => {
                          if (expandedMedia.type !== "before" || beforeImages.length <= 1) return;
                          const startX = expandedSwipeStartXRef.current;
                          const endX = e.changedTouches[0]?.clientX ?? null;
                          expandedSwipeStartXRef.current = null;
                          if (startX === null || endX === null) return;
                          const dx = endX - startX;
                          if (Math.abs(dx) < 35) return;
                          if (dx < 0) {
                            setExpandedMedia((s) => ({ ...s, index: (s.index + 1) % beforeImages.length }));
                          } else {
                            setExpandedMedia((s) => ({ ...s, index: (s.index - 1 + beforeImages.length) % beforeImages.length }));
                          }
                        }}
                      >
                        {beforeImages.length > 0 ? (
                          <>
                            <img
                              src={expandedMedia.type === "before" ? (beforeImages[expandedMedia.index] ?? beforeImages[0]) : beforeImages[0]}
                              alt={`Before photo ${expandedMedia.type === "before" ? expandedMedia.index + 1 : 1} of ${beforeImages.length}`}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                              draggable={false}
                            />
                            {expandedMedia.type === "before" && beforeImages.length > 1 ? (
                              <>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedMedia((s) => ({
                                      ...s,
                                      index: (s.index - 1 + beforeImages.length) % beforeImages.length,
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setExpandedMedia((s) => ({
                                        ...s,
                                        index: (s.index - 1 + beforeImages.length) % beforeImages.length,
                                      }));
                                    }
                                  }}
                                  className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white shadow-lg ring-1 ring-white/25 transition hover:bg-black/75 md:block"
                                  aria-label="Previous before image"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                  </svg>
                                </span>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedMedia((s) => ({
                                      ...s,
                                      index: (s.index + 1) % beforeImages.length,
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setExpandedMedia((s) => ({
                                        ...s,
                                        index: (s.index + 1) % beforeImages.length,
                                      }));
                                    }
                                  }}
                                  className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white shadow-lg ring-1 ring-white/25 transition hover:bg-black/75 md:block"
                                  aria-label="Next before image"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                  </svg>
                                </span>
                              </>
                            ) : null}
                            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
                            {beforeImages.length > 1 ? (
                              <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-slate-900/90 px-2 py-1 text-[11px] font-black tabular-nums text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                                {expandedMedia.type === "before" ? expandedMedia.index + 1 : 1}/{beforeImages.length}
                              </span>
                            ) : null}
                            {expandedMedia.type === "before" ? (
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setExpandedMedia({ type: null, index: 0 });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedMedia({ type: null, index: 0 });
                                  }
                                }}
                                className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white"
                                aria-label="Collapse before preview"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                            <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-[10px] text-slate-400">No photo yet</p>
                          </div>
                        )}
                      </button>
                      <div className={`pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 ${expandedMedia.type ? "hidden" : ""}`}>
                        {isResolved ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-md">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white shadow-md ring-1 ring-slate-200">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!afterImageSrc) return;
                          setExpandedMedia((prev) => (prev.type === "after" ? { type: null, index: 0 } : { type: "after", index: 0 }));
                        }}
                        className={`relative min-w-0 overflow-hidden rounded-2xl border-2 border-emerald-100 bg-slate-100 ring-1 ring-slate-100 ${
                          expandedMedia.type === "after" ? "h-[260px] w-full" : expandedMedia.type ? "hidden" : "h-[150px] flex-1"
                        }`}
                        disabled={!afterImageSrc}
                      >
                        {afterImageSrc ? (
                          <>
                            <img src={afterImageSrc} alt="After" className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            {expandedMedia.type === "after" ? (
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setExpandedMedia({ type: null, index: 0 });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedMedia({ type: null, index: 0 });
                                  }
                                }}
                                className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white"
                                aria-label="Collapse after preview"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                            <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-[10px] text-slate-400">No photo yet</p>
                          </div>
                        )}
                      </button>
                    </div>
                    {beforeImages.length > 1 ? (
                      <p className="text-center text-[11px] font-bold text-accent-600">
                        {expandedMedia.type === "before"
                          ? "Swipe left/right on expanded Before image"
                          : `${beforeImages.length} photos, tap Before to expand`}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Resolved banner */}
                {isResolved && (
                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Issue resolved</p>
                      <p className="text-xs text-emerald-600">Open for {pendingDays} day{pendingDays !== 1 ? "s" : ""} · Verified by citizen</p>
                    </div>
                  </div>
                )}

                {/* Pending verification banner */}
                {isPendingVerification && (
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">!</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-800">Marked resolved (awaiting verification)</p>
                      <p className="text-xs text-amber-700">
                        {isReporterForSelected
                          ? "Proof uploaded. Please verify or reject this update."
                          : "Proof uploaded. Awaiting original reporter verification."}
                      </p>
                    </div>
                    {isReporterForSelected ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRejectResolved}
                          className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyResolved}
                          className="rounded-full bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-500"
                        >
                          Verify now
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Category + description */}
                <div className="flex items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 ring-1 ring-slate-100">
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${CAT_COLORS[selectedReport.category] ?? "bg-slate-100 text-slate-700"}`}>
                    {selectedReport.category}
                  </span>
                  <p className="text-sm font-medium leading-snug text-slate-700">{selectedReport.description}</p>
                </div>

                {/* Metrics, home-style stat cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-brand-50 py-3 text-center ring-1 ring-brand-100">
                    <p className="text-2xl font-black text-brand-600">{totalSupport}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Supports</p>
                  </div>
                  <div className="rounded-2xl bg-accent-50 py-3 text-center ring-1 ring-accent-100">
                    <p className="text-2xl font-black text-accent-600">{pendingDays}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Days</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 py-3 text-center ring-1 ring-emerald-100">
                    <p className="text-2xl font-black text-emerald-700">{wardReports.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">In ward</p>
                  </div>
                </div>

                {selectedEscalation && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700">Escalation</p>
                    <p className="mt-1 text-sm font-bold text-amber-900">
                      Level {selectedEscalation.escalationLevel ?? 1} · {selectedEscalation.status}
                    </p>
                    <p className="mt-1 text-xs text-amber-800">
                      Raised: {new Date(selectedEscalation.createdAt).toLocaleString()}
                    </p>
                    {selectedEscalation.reason ? (
                      <p className="mt-1 text-xs text-amber-800">Reason: {getEscalationReasonLabel(selectedEscalation.reason)}</p>
                    ) : null}
                    {canDeleteSelectedEscalation && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteEscalation(true)}
                        disabled={deletingEscalationReportId === selectedReport?.id}
                        className="mt-2 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                      >
                        {deletingEscalationReportId === selectedReport?.id ? "Removing..." : "Remove Escalation (Hard Delete)"}
                      </button>
                    )}
                  </div>
                )}

                {/* Resolve hint */}
                {resolveFlowOpen && (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <div className="flex-1 text-xs text-emerald-800">
                      <p className="font-semibold">Choose an &ldquo;after&rdquo; proof photo</p>
                      <p className="text-emerald-600">This marks the issue as pending verification</p>
                    </div>
                    <button type="button" onClick={() => setResolveFlowOpen(false)} className="text-emerald-400 hover:text-emerald-700">✕</button>
                  </div>
                )}
                {resolveUploading && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">Uploading proof image...</span>
                      <span className="text-slate-500">{resolveUploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${resolveUploadProgress}%` }} />
                    </div>
                  </div>
                )}
                {resolveUploadError && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-xs font-semibold text-brand-700">
                    {resolveUploadError}
                  </div>
                )}
                {supportError && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                    {supportError}
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex gap-2">
                    {user ? (
                      <button
                        type="button"
                        onClick={handleUpvote}
                        disabled={Boolean(upvotes[selectedReport.id])}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition active:scale-[0.98] ${upvotes[selectedReport.id] ? "bg-emerald-500 text-white" : "bg-brand-600 text-white hover:bg-brand-700"}`}
                      >
                        {upvotes[selectedReport.id] ? "✓ Supported" : "▲ Support"}
                      </button>
                    ) : (
                      <Link
                        href="/auth"
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-sm font-black text-white transition hover:bg-brand-700 active:scale-[0.98]"
                      >
                        Sign in to support
                      </Link>
                    )}
                    {!isResolved && !isPendingVerification && (
                      <button
                        type="button"
                        onClick={handleResolveClick}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 py-3.5 text-sm font-black text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.98]"
                      >
                        Mark resolved
                      </button>
                    )}
                    {isPendingVerification && (
                      !user ? (
                        <Link
                          href="/auth"
                          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 py-3.5 text-sm font-black text-amber-800 transition hover:bg-amber-100 active:scale-[0.98]"
                        >
                          Sign in as reporter to verify
                        </Link>
                      ) : isReporterForSelected ? (
                        <>
                          <button
                            type="button"
                            onClick={handleRejectResolved}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 py-3.5 text-sm font-black text-rose-700 transition hover:bg-rose-100 active:scale-[0.98]"
                          >
                            Reject resolution
                          </button>
                          <button
                            type="button"
                            onClick={handleVerifyResolved}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 py-3.5 text-sm font-black text-amber-800 transition hover:bg-amber-100 active:scale-[0.98]"
                          >
                            Verify resolution
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3.5 text-center text-sm font-black text-amber-800">
                          Waiting for original reporter verification
                        </div>
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerTab("accountability")}
                    className="flex w-full items-center justify-between rounded-2xl border border-accent-200 bg-accent-50/60 px-4 py-3 text-sm font-bold text-accent-800 transition hover:bg-accent-50"
                  >
                    <span>{hasRepresentativeData ? "Who&apos;s responsible for this?" : "Accountability flow"}</span>
                    <svg className="h-4 w-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                </div>
                {/* Other issues in this ward */}
                {wardReports.length > 1 && (
                  <aside className="mt-4 md:mt-0 md:col-span-2 md:self-start">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:sticky md:top-2">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        More in {selectedWard?.wardName}
                      </p>
                      <div className="space-y-1.5">
                        {wardReports.filter((r) => r.id !== selectedReport.id).map((issue) => (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => { setSelectedReportId(issue.id); setDrawerTab("issue"); setResolveFlowOpen(false); }}
                            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50"
                          >
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${CAT_COLORS[issue.category] ?? "bg-slate-100 text-slate-600"}`}>
                              {issue.category}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-800">{issue.address}</p>
                              <p className="text-xs text-slate-500">{issue.supportCount} supports</p>
                            </div>
                            {getStatus(issue.id, issue.status) === "resolved" && (
                              <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </aside>
                )}
              </div>
            )}

            {/* ── ACCOUNTABILITY TAB ── */}
            {drawerTab === "accountability" && (
              <div className="space-y-5 px-4 py-4">
                {/* Elected reps */}
                {electedReps.length > 0 && (
                  <section>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Elected Representatives
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {electedReps.map((rep) => (
                        <div key={rep.id} className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center">
                          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50">
                            {rep.photoUrl
                              ? <img src={rep.photoUrl} alt={rep.name} className="h-full w-full object-cover" />
                              : <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-300">{rep.name[0]}</div>
                            }
                          </div>
                          <p className="mt-2 text-sm font-bold text-slate-900 leading-tight">{rep.name}</p>
                          <p className="text-xs text-slate-500">{rep.role}</p>
                          {rep.party && (
                            <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${PARTY_COLORS[rep.party] ?? "bg-slate-100 text-slate-700"}`}>
                              {rep.party}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {electedReps.length === 0 && (
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Elected representative details for this ward will be added soon.
                  </section>
                )}

                {/* Officials */}
                <section>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Officials - {selectedReport?.category ?? "this issue"}
                  </p>
                  <div className="space-y-2">
                    {officials.map((rep) => {
                      const isPrimary = rep.role === responsibility?.primaryRole;
                      return (
                        <button
                          key={rep.id}
                          type="button"
                          onClick={() => { setSelRepId(rep.id); setDrawerTab("contact"); }}
                          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{rep.name}</p>
                            <p className="text-xs text-slate-500">{rep.role} · {rep.area}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPrimary && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Primary</span>
                            )}
                            <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {officials.length === 0 && (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Official contacts for this ward are not added yet.
                    </p>
                  )}
                </section>

                {/* Escalation flowchart */}
                {responsibility && (
                  <section>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Escalation Path</p>
                    <EscalationFlowchart
                      roles={responsibility.escalationOrder}
                      currentRole={responsibility.primaryRole}
                      steps={escalationSteps}
                    />
                  </section>
                )}
                {selectedEscalation && (
                  <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-amber-700">
                      Escalation Details
                    </p>
                    <p className="text-sm font-semibold text-amber-900">
                      Level {selectedEscalation.escalationLevel ?? 1} · {selectedEscalation.status}
                    </p>
                    <p className="mt-1 text-xs text-amber-800">
                      Raised on {new Date(selectedEscalation.createdAt).toLocaleString()}
                    </p>
                    {selectedEscalation.reason ? (
                      <p className="mt-1 text-xs text-amber-800">{getEscalationReasonLabel(selectedEscalation.reason)}</p>
                    ) : null}
                    {canDeleteSelectedEscalation && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteEscalation(true)}
                        disabled={deletingEscalationReportId === selectedReport?.id}
                        className="mt-2 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                      >
                        {deletingEscalationReportId === selectedReport?.id ? "Removing..." : "Remove Escalation (Hard Delete)"}
                      </button>
                    )}
                  </section>
                )}
              </div>
            )}

            {/* ── CONTACT TAB ── */}
            {drawerTab === "contact" && selectedReport && (() => {
              const report = selectedReport; // capture for use inside nested functions
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const reportUrl = `${origin}/explore-map?reportId=${report.id}&wardId=${report.governance.wardId}`;

              // Fallback department contact based on issue category
              const deptContact = getContactForCategory(report.category, city.id);

              // Build pre-filled message (works for both ward rep and dept contact)
              function buildMsg(recipientName: string) {
                return [
                  `Hello ${recipientName},`,
                  "",
                  "I am reporting a civic issue via NammaPoruppu and requesting your attention.",
                  "",
                  `Issue: ${report.category}`,
                  `Location: ${report.address}`,
                  `Ward: ${selectedWard?.wardName ?? ""} (Ward ${selectedWard?.wardNumber ?? ""})`,
                  `Report ID: ${report.id}`,
                  "",
                  `View report: ${reportUrl}`,
                  "",
                  "Please review and take necessary action. Thank you.",
                ].join("\n");
              }

              // Ward representative contact hrefs
              const officialMsg = selectedRep ? buildMsg(selectedRep.name) : "";
              const waRepDigits = (selectedRep?.helpline ?? "").replace(/\D/g, "");
              const waRepNumber = waRepDigits.length === 10 ? `91${waRepDigits}` : waRepDigits;
              const waOfficialHref = selectedRep
                ? `https://wa.me/${waRepNumber}?text=${encodeURIComponent(officialMsg)}`
                : "#";
              const emailHref = selectedRep
                ? `mailto:${selectedRep.email}?subject=${encodeURIComponent(`Civic Issue - ${selectedReport.category} · Ward ${selectedWard?.wardNumber ?? ""} ${selectedWard?.wardName ?? ""}`)}&body=${encodeURIComponent(officialMsg)}`
                : "#";

              // Department fallback contact hrefs
              const deptMsg = buildMsg(deptContact.shortName);
              const waDeptHref = deptContact.whatsapp
                ? `https://wa.me/${deptContact.whatsapp}?text=${encodeURIComponent(deptMsg)}`
                : null;
              const emailDeptHref = deptContact.email
                ? `mailto:${deptContact.email}?subject=${encodeURIComponent(`Civic Issue - ${selectedReport.category} · Ward ${selectedWard?.wardNumber ?? ""} ${selectedWard?.wardName ?? ""}`)}&body=${encodeURIComponent(deptMsg)}`
                : null;

              // Social share message
              const shareText = `Civic issue in ${report.governance.wardName}, ${city.name}: ${report.category} at ${report.address}. Help resolve this!`;
              const typeTag = report.category.replace(/[^a-zA-Z0-9]/g, "") || "CivicIssue";
              const cityTag = city.name.replace(/[^a-zA-Z0-9]/g, "") || "TamilNadu";
              const shareTagsLine = `#NammaPoruppu #${cityTag} #${typeTag}`;
              const waShareHref = `https://wa.me/?text=${encodeURIComponent(
                `${shareText}\n\nView & support: ${reportUrl}\n\n${shareTagsLine}`,
              )}`;
              const twitterHashtags = shareHashtagsForCategory(report.category, city.name);
              const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(reportUrl)}&hashtags=${twitterHashtags}`;

              const officialAmplifyBody = [
                "Hi NammaPoruppu team,",
                "",
                "Please review this report. If appropriate, amplify it from the official @nammaporuppu X account.",
                "I prefer not to post from my personal X handle.",
                "",
                "--- Suggested post ---",
                shareText,
                "",
                reportUrl,
                "",
                "--- Details ---",
                `Issue type: ${report.category}`,
                `Ward: ${selectedWard?.wardName ?? ""} (Ward ${selectedWard?.wardNumber ?? ""})`,
                `Report ID: ${report.id}`,
                "",
                "Thank you.",
              ].join("\n");
              const officialAmplifyMailto = `mailto:hello@nammaporuppu.in?subject=${encodeURIComponent(
                `Amplify on X: ${report.category} · Ward ${selectedWard?.wardNumber ?? ""} ${selectedWard?.wardName ?? ""}`.trim(),
              )}&body=${encodeURIComponent(officialAmplifyBody)}`;

              return (
                <div className="space-y-5 px-4 py-4">

                  {/* ── Contact the official ── */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Contact Official</p>

                    {selectedRep ? (
                      <>
                        {/* Rep card */}
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50">
                            {selectedRep.photoUrl
                              ? <img src={selectedRep.photoUrl} alt={selectedRep.name} className="h-full w-full object-cover" />
                              : <div className="flex h-full w-full items-center justify-center text-base font-bold text-slate-300">{selectedRep.name[0]}</div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">{selectedRep.name}</p>
                            <p className="text-xs text-slate-500">{selectedRep.role} · {selectedRep.area}</p>
                          </div>
                          {selectedRep.party && (
                            <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${PARTY_COLORS[selectedRep.party] ?? "bg-slate-100 text-slate-600"}`}>
                              {selectedRep.party}
                            </span>
                          )}
                        </div>

                        {/* 3 action buttons */}
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <a
                            href={waOfficialHref}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-xs font-semibold text-white transition hover:bg-emerald-600"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            WhatsApp
                          </a>
                          <a
                            href={emailHref}
                            className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900 py-3 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                            Email
                          </a>
                          <a
                            href={`tel:${selectedRep.helpline}`}
                            className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" />
                            </svg>
                            Call
                          </a>
                        </div>

                        <p className="mt-2 text-center text-[11px] text-slate-400">
                          Office hours: {selectedRep.officeHours}
                        </p>

                        {/* Switch rep */}
                        {representatives.length > 1 && (
                          <div className="mt-3">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Switch Contact</p>
                            <div className="flex flex-wrap gap-2">
                              {representatives.map((rep) => (
                                <button
                                  key={rep.id}
                                  type="button"
                                  onClick={() => setSelRepId(rep.id)}
                                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${selectedRep.id === rep.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                                >
                                  {rep.role}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* No ward rep assigned - show the relevant department contact */
                      <>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">{deptContact.shortName}</p>
                          <p className="mt-0.5 text-sm font-bold text-slate-900">{deptContact.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{deptContact.description}</p>
                        </div>

                        <div className={`mt-3 grid gap-2 ${waDeptHref ? "grid-cols-3" : emailDeptHref ? "grid-cols-2" : "grid-cols-1"}`}>
                          {waDeptHref && (
                            <a
                              href={waDeptHref}
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-xs font-semibold text-white transition hover:bg-emerald-600"
                            >
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              WhatsApp
                            </a>
                          )}
                          {emailDeptHref && (
                            <a
                              href={emailDeptHref}
                              className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900 py-3 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                              </svg>
                              Email
                            </a>
                          )}
                          <a
                            href={`tel:${deptContact.helpline}`}
                            className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" />
                            </svg>
                            Call {deptContact.helpline}
                          </a>
                        </div>

                        {/* CM Helpline escalation tip */}
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div>
                            <p className="text-[11px] font-semibold text-slate-600">Still unresolved?</p>
                            <p className="text-[11px] text-slate-400">Escalate via CM Helpline</p>
                          </div>
                          <a
                            href={`tel:${getContactsForCity(city.id).cm_helpline.helpline}`}
                            className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700"
                          >
                            Call 1100
                          </a>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* ── Share this issue ── */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Share this issue</p>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Copy link */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(reportUrl).then(() => {
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          });
                        }}
                        className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {linkCopied ? (
                          <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                          </svg>
                        )}
                        {linkCopied ? "Copied!" : "Copy Link"}
                      </button>

                      {/* WhatsApp share */}
                      <a
                        href={waShareHref}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-xs font-semibold text-white transition hover:bg-emerald-600"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </a>

                      {/* Twitter / X share */}
                      <a
                        href={twitterHref}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900 py-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
                        </svg>
                        Twitter / X
                      </a>
                    </div>
                    <button
                      type="button"
                      disabled={amplifyQueueBusy || !session?.access_token}
                      onClick={async () => {
                        if (!session?.access_token) {
                          pushToast("error", "Sign in to queue an official post request.");
                          return;
                        }
                        setAmplifyQueueBusy(true);
                        try {
                          const res = await fetch("/api/amplify-requests", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify({ reportId: report.id }),
                          });
                          const json = (await res.json()) as { error?: string; id?: string };
                          if (!res.ok) {
                            pushToast("error", json.error ?? "Could not queue request.");
                            return;
                          }
                          pushToast("success", "Queued for @nammaporuppu. Our team will review and post when appropriate.");
                        } finally {
                          setAmplifyQueueBusy(false);
                        }
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-accent-200 bg-accent-50 py-3 text-xs font-bold text-accent-800 transition hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                      {amplifyQueueBusy ? "Queueing…" : "Queue official @nammaporuppu post"}
                    </button>
                    <a
                      href={officialAmplifyMailto}
                      className="mt-1.5 block text-center text-[11px] font-semibold text-accent-700 hover:underline"
                    >
                      Or email hello@nammaporuppu.in instead
                    </a>
                    <p className="mt-2 text-center text-[11px] text-slate-400">
                      &ldquo;Twitter / X&rdquo; opens your own account. Queue or email us if you prefer not to post personally.
                    </p>
                  </div>

                </div>
              );
            })()}

            {/* Safe area */}
            <div className="h-6" />
          </div>
        </DrawerContent>
      </Drawer>
      {confirmDeleteEscalation && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 ring-2 ring-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Remove escalation?</h3>
            <p className="mt-1.5 text-xs text-slate-500">
              This permanently deletes the escalation for this issue.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteEscalation(false)}
                className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedEscalation}
                disabled={deletingEscalationReportId === selectedReport?.id}
                className="rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {deletingEscalationReportId === selectedReport?.id ? "Removing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed right-4 top-20 z-[1200]">
          <div className={`rounded-xl px-4 py-2 text-xs font-semibold text-white ${
            toast.type === "success" ? "bg-emerald-600" : "bg-brand-600"
          }`}>
            {toast.message}
          </div>
        </div>
      )}

    </main>
  );
}
