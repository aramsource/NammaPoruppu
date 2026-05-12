"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { PageBody, PageHero } from "@/components/site-page-shell";
import { DEFAULT_CITY } from "@/lib/cities";
import { issueCategories } from "@/lib/domain";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

const CAT_ICON: Record<string, string> = {
  Pothole: "🕳",
  Garbage: "🗑",
  Waterlogging: "🌊",
  "Sewage Leak": "💧",
  "Streetlight Issue": "💡",
  "Broken Footpath": "🚶",
  Drainage: "🏗",
  "Dust Pollution": "💨",
  Encroachment: "🚧",
  Other: "📌",
};

type LocStage = "idle" | "gps" | "geocoding" | "done" | "error" | "manual";

type LocationData = {
  lat: number;
  lng: number;
  accuracy: number;
  street: string;
  neighbourhood: string;
  city: string;
  postcode: string;
  displayAddress: string; // editable
};

type Step = "form" | "success";
const MAX_IMAGE_MB = 5;
const MAX_IMAGES = 3;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type PhotoItem = {
  file: File;
  previewUrl: string;
};

const IssueLocationMap = dynamic(
  () => import("@/components/issue-location-map").then((mod) => mod.IssueLocationMap),
  { ssr: false },
);

async function reverseGeocode(lat: number, lng: number): Promise<Partial<LocationData>> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    if (!res.ok) return {};
    const data = await res.json();
    const a = data.address ?? {};
    const street = [a.road, a.house_number].filter(Boolean).join(" ");
    const neighbourhood = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.village ?? "";
    const city = a.city ?? a.town ?? a.county ?? "";
    const postcode = a.postcode ?? "";
    const displayAddress = [street, neighbourhood, city].filter(Boolean).join(", ");
    return { street, neighbourhood, city, postcode, displayAddress };
  } catch {
    return {};
  }
}

type SearchLocationResult = {
  displayName: string;
  lat: number;
  lng: number;
};

function isWithinChennaiBounds(lat: number, lng: number): boolean {
  const [[swLat, swLng], [neLat, neLng]] = DEFAULT_CITY.bounds;
  return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
}

async function searchLocationByText(query: string): Promise<SearchLocationResult[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .map((item: { display_name?: string; lat?: string; lon?: string }) => ({
        displayName: item.display_name ?? "",
        lat: Number(item.lat),
        lng: Number(item.lon),
      }))
      .filter((item: SearchLocationResult) => Number.isFinite(item.lat) && Number.isFinite(item.lng) && item.displayName);
  } catch {
    return [];
  }
}

export default function ReportIssuePage() {
  const { user, session, loading } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [reportRef, setReportRef] = useState("");
  const [submittedReportId, setSubmittedReportId] = useState("");
  const [mappedWardLabel, setMappedWardLabel] = useState("");

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [locStage, setLocStage] = useState<LocStage>("idle");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [locationError, setLocationError] = useState("");
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickPoint, setMapPickPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState<SearchLocationResult[]>([]);
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [mapPickerError, setMapPickerError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  useEffect(() => { detectLocation(); }, []);

  async function detectLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("GPS is not supported on this device/browser.");
      setLocStage("error");
      return;
    }
    if (!window.isSecureContext) {
      setLocationError("GPS may be blocked on non-HTTPS pages. Use Pick on map below, or open this site via HTTPS.");
    }
    setLocStage("gps");
    setEditingAddress(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setLocStage("geocoding");
        const geo = await reverseGeocode(lat, lng);
        setLocation({
          lat, lng, accuracy,
          street: geo.street ?? "",
          neighbourhood: geo.neighbourhood ?? "",
          city: geo.city ?? "",
          postcode: geo.postcode ?? "",
          displayAddress: geo.displayAddress ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        });
        setLocStage("done");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission was denied. Enable location permission in settings or use Pick on map.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Could not get GPS signal right now. Try again outdoors or use Pick on map.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("GPS request timed out. Try again or use Pick on map.");
        } else {
          setLocationError("Could not detect your location right now. Use Pick on map or enter address manually.");
        }
        setLocStage("error");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  async function applyMapSelection() {
    if (!mapPickPoint) return;
    if (!isWithinChennaiBounds(mapPickPoint.lat, mapPickPoint.lng)) {
      setMapPickerError("Selected pin is outside Chennai. Please choose a location within Chennai.");
      return;
    }
    setLocStage("geocoding");
    const geo = await reverseGeocode(mapPickPoint.lat, mapPickPoint.lng);
    const displayAddress = geo.displayAddress ?? `${mapPickPoint.lat.toFixed(5)}, ${mapPickPoint.lng.toFixed(5)}`;
    setLocation({
      lat: mapPickPoint.lat,
      lng: mapPickPoint.lng,
      accuracy: 0,
      street: geo.street ?? "",
      neighbourhood: geo.neighbourhood ?? "",
      city: geo.city ?? "",
      postcode: geo.postcode ?? "",
      displayAddress,
    });
    setManualAddress(displayAddress);
    setMapPickerOpen(false);
    setEditingAddress(false);
    setLocationError("");
    setMapPickerError("");
    setLocStage("manual");
  }

  async function handleMapSearch() {
    const q = mapSearchQuery.trim();
    if (!q) return;
    setMapSearchLoading(true);
    const results = (await searchLocationByText(q)).filter((r) => isWithinChennaiBounds(r.lat, r.lng));
    setMapSearchResults(results);
    if (results[0]) {
      setMapPickPoint({ lat: results[0].lat, lng: results[0].lng });
      setMapPickerError("");
    } else {
      setMapPickerError("No Chennai matches found. Search with a Chennai area or landmark.");
    }
    setMapSearchLoading(false);
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError("");
    const incoming = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - photos.length);
    const valid: PhotoItem[] = [];
    for (const f of incoming) {
      if (!ALLOWED_IMAGE_TYPES.has(f.type)) {
        setPhotoError("Only JPG, PNG, and WEBP images are allowed.");
        continue;
      }
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        setPhotoError(`Each image must be under ${MAX_IMAGE_MB}MB.`);
        continue;
      }
      valid.push({ file: f, previewUrl: URL.createObjectURL(f) });
    }
    if (valid.length) setPhotos((p) => [...p, ...valid]);
    e.target.value = "";
  }

  function startEditAddress() {
    setManualAddress(location?.displayAddress ?? "");
    setEditingAddress(true);
    setTimeout(() => addressRef.current?.focus(), 50);
  }

  function saveManualAddress() {
    if (manualAddress.trim()) {
      setLocation((prev) =>
        prev
          ? { ...prev, displayAddress: manualAddress.trim() }
          : { lat: 0, lng: 0, accuracy: 0, street: "", neighbourhood: "", city: "", postcode: "", displayAddress: manualAddress.trim() }
      );
      setLocStage("manual");
    }
    setEditingAddress(false);
  }

  const effectiveAddress = editingAddress
    ? manualAddress
    : location?.displayAddress ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!user) {
      setSubmitError("Please sign in to submit a report.");
      return;
    }
    if (!category) {
      setSubmitError("Issue type is required.");
      return;
    }
    if (!location || !effectiveAddress.trim()) {
      setSubmitError("Location is required. Use GPS, Pick on map, or enter and save an address.");
      return;
    }
    setUploadProgress(0);
    setUploadStage("");
    setSubmitting(true);
    const reportRefVal = `NP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    try {
      const lat = location?.lat ?? 13.0475;
      const lng = location?.lng ?? 80.2272;
      const sessionId =
        localStorage.getItem("np_session_id") ??
        `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      localStorage.setItem("np_session_id", sessionId);

      const createRes = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          cityId: "chennai",
          category,
          description: description || null,
          displayAddress: effectiveAddress || "Location provided by user",
          street: location?.street || null,
          neighbourhood: location?.neighbourhood || null,
          postcode: location?.postcode || null,
          lat,
          lng,
          accuracyMeters: location?.accuracy ?? null,
          reporterSessionId: sessionId,
          imageUrls: [],
        }),
      });
      if (!createRes.ok) throw new Error("Report create API failed");
      const createData = await createRes.json();
      const reportRow = createData as {
        id: string;
        reportRef?: string;
        wardId?: string;
        wardName?: string | null;
        wardNumber?: number | null;
      };
      if (!reportRow?.id) throw new Error("Report ID missing from API response");
      setMappedWardLabel(
        reportRow.wardName && reportRow.wardNumber
          ? `Ward ${reportRow.wardNumber} · ${reportRow.wardName}`
          : "Ward mapping unavailable",
      );
      setUploadProgress(20);
      setUploadStage("Report created");

      if (reportRow?.id && photos.length > 0) {
        setUploadStage("Uploading photos...");
        const uploads = await Promise.all(
          photos.map(async (p, idx) => {
            const ext = p.file.name.split(".").pop()?.toLowerCase() || "jpg";
            const path = `reports/${reportRow.id}/${Date.now()}-${idx}.${ext}`;
            const { error: upErr } = await supabaseClient.storage
              .from("report-images")
              .upload(path, p.file, { cacheControl: "3600", upsert: false });
            if (upErr) throw upErr;
            const { data: pub } = supabaseClient.storage.from("report-images").getPublicUrl(path);
            setUploadProgress(20 + Math.round(((idx + 1) / photos.length) * 60));
            return pub.publicUrl;
          }),
        );
        setUploadStage("Saving photo metadata...");
        const { error: imgErr } = await supabaseClient.from("report_images").insert(
          uploads.map((url) => ({
            report_id: reportRow.id,
            image_url: url,
            image_kind: "report",
          })),
        );
        if (imgErr) throw imgErr;
      }
      setUploadProgress(100);
      setUploadStage("Done");

      setReportRef(reportRow.reportRef ?? reportRefVal);
      setSubmittedReportId(reportRow.id);
      setStep("success");
    } catch (err: unknown) {
      console.error(err);
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: string }).message)
          : "";
      if (msg.toLowerCase().includes("row-level security")) {
        setSubmitError("Permission issue while saving report. Please check Supabase RLS policies.");
      } else if (msg.toLowerCase().includes("mime") || msg.toLowerCase().includes("content type")) {
        setSubmitError("Unsupported image type. Please upload JPG, PNG, or WEBP.");
      } else if (msg.toLowerCase().includes("size") || msg.toLowerCase().includes("too large")) {
        setSubmitError(`Image too large. Keep each file under ${MAX_IMAGE_MB}MB.`);
      } else if (msg.toLowerCase().includes("bucket")) {
        setSubmitError("Storage bucket not ready. Run supabase/004_seed_all_chennai_wards.sql once.");
      } else {
        setSubmitError("Could not save report to server. Please retry.");
      }
      setUploadStage("");
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setStep("form");
    setPhotos([]);
    setCategory("");
    setDescription("");
    setLocation(null);
    setLocStage("idle");
    setReportRef("");
    setSubmittedReportId("");
    setMappedWardLabel("");
    setManualAddress("");
    setLocationError("");
    setMapPickerOpen(false);
    setMapPickPoint(null);
    setMapSearchQuery("");
    setMapSearchResults([]);
    setMapSearchLoading(false);
    setEditingAddress(false);
    setPhotoError("");
    detectLocation();
  }

  /* ── Success screen ── */
  if (step === "success") {
    return (
      <main className="min-h-[calc(100vh-64px)]">
        <PageHero
          eyebrow="Success"
          title="Report submitted!"
          subtitle="Now visible on the map and linked to your account."
          tone="brand"
          containerWidth="xl"
        />
        <PageBody maxWidth="sm" className="pt-6 md:pt-8">
        <div className="mx-auto w-full max-w-sm rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
          <p className="mt-4 text-sm font-medium text-slate-600">Here&apos;s your tracking summary.</p>
          <div className="mt-6 space-y-1.5 rounded-2xl bg-slate-50 px-4 py-4 text-left text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tracking ID</span>
              <span className="font-bold text-slate-800">{reportRef}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Category</span>
              <span className="font-semibold text-slate-700">{CAT_ICON[category]} {category}</span>
            </div>
            {mappedWardLabel && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mapped Ward</span>
                <span className="font-semibold text-slate-700">{mappedWardLabel}</span>
              </div>
            )}
            {effectiveAddress && (
              <div className="flex items-start justify-between gap-2">
                <span className="shrink-0 text-slate-400">Location</span>
                <span className="text-right font-semibold text-slate-700">{effectiveAddress}</span>
              </div>
            )}
            {location && location.lat !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">GPS</span>
                <span className="text-slate-500">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="mt-3 w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Report Another Issue
          </button>
        </div>
        </PageBody>
      </main>
    );
  }

  /* ── Form ── */
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <PageHero
        eyebrow="Report"
        title="Report an issue"
        subtitle="Photo, location, and category. Sign in is required to submit."
        tone="accent"
        containerWidth="xl"
      />
      <PageBody maxWidth="xl">
        {!loading && !user ? (
          <div className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
            <p className="font-semibold">Sign in required</p>
            <p className="mt-1 text-xs text-brand-700">
              To prevent spam reports, you need to sign in before submitting an issue.
            </p>
            <Link
              href={`/auth?next=${encodeURIComponent("/report-issue")}`}
              className="mt-3 inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
            >
              Sign in to continue
            </Link>
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>

          {/* ── 1. Location (first - most important, auto-filled) ── */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
            <div className="px-5 pt-4 pb-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">📍 Location <span className="text-brand-500">*</span></p>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locStage === "gps" || locStage === "geocoding"}
                className="text-[11px] font-semibold text-brand-600 hover:underline disabled:opacity-40"
              >
                {locStage === "gps" || locStage === "geocoding" ? "Detecting…" : "Re-detect"}
              </button>
            </div>

            {/* GPS + geocoding spinner */}
            {(locStage === "gps" || locStage === "geocoding") && (
              <div className="mx-5 mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {locStage === "gps" ? "Getting your GPS position…" : "Finding your address…"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {locStage === "gps" ? "Allow location access if prompted" : "Looking up street name"}
                  </p>
                </div>
              </div>
            )}

            {/* Location card - done */}
            {locStage === "done" && location && !editingAddress && (
              <div className="mx-5 mb-4 rounded-xl bg-brand-50 ring-1 ring-brand-100 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-snug">{location.displayAddress}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {location.postcode && (
                        <span className="text-[11px] text-slate-400">{location.postcode}</span>
                      )}
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        GPS ±{Math.round(location.accuracy)}m
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startEditAddress}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            {/* Manual override card */}
            {locStage === "manual" && location && !editingAddress && (
              <div className="mx-5 mb-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Manually entered</p>
                    <p className="text-sm font-bold text-slate-900">{location.displayAddress}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={startEditAddress}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-100"
                    >
                      Use GPS
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {locStage === "error" && !editingAddress && (
              <div className="mx-5 mb-2 rounded-xl bg-amber-50 ring-1 ring-amber-100 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800">Couldn&apos;t detect location</p>
                <p className="mt-0.5 text-[11px] text-amber-600">
                  {locationError || "Type your address or landmark below"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMapPickerOpen(true);
                    setEditingAddress(false);
                    setMapPickerError("");
                    setMapPickPoint((prev) => prev ?? { lat: 13.0827, lng: 80.2707 });
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-50"
                >
                  Pick on map
                </button>
              </div>
            )}

            {mapPickerOpen && (
              <div className="mx-5 mb-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-xs font-semibold text-slate-700">Tap map to drop a pin</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleMapSearch();
                      }
                    }}
                    placeholder="Search area, street, landmark..."
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-brand-300"
                  />
                  <button
                    type="button"
                    onClick={handleMapSearch}
                    disabled={mapSearchLoading || !mapSearchQuery.trim()}
                    className="h-9 shrink-0 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    {mapSearchLoading ? "..." : "Search"}
                  </button>
                </div>
                {mapSearchResults.length > 0 && (
                  <div className="mt-2 max-h-28 overflow-auto rounded-lg border border-slate-200 bg-white">
                    {mapSearchResults.map((r, idx) => (
                      <button
                        key={`${r.lat}-${r.lng}-${idx}`}
                        type="button"
                        onClick={() => {
                          if (!isWithinChennaiBounds(r.lat, r.lng)) {
                            setMapPickerError("This place is outside Chennai. Pick a Chennai location.");
                            return;
                          }
                          setMapPickPoint({ lat: r.lat, lng: r.lng });
                          setMapSearchQuery(r.displayName);
                          setMapPickerError("");
                        }}
                        className="block w-full border-b border-slate-100 px-3 py-2 text-left text-[11px] text-slate-700 last:border-b-0 hover:bg-slate-50"
                      >
                        {r.displayName}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-2 overflow-hidden rounded-lg ring-1 ring-slate-200">
                  <IssueLocationMap mapPickPoint={mapPickPoint} onPick={setMapPickPoint} />
                </div>
                {mapPickerError ? (
                  <p className="mt-2 text-[11px] font-semibold text-brand-600">{mapPickerError}</p>
                ) : null}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-500">
                    {mapPickPoint
                      ? `${mapPickPoint.lat.toFixed(5)}, ${mapPickPoint.lng.toFixed(5)}`
                      : "Tap once to choose location"}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMapPickerOpen(false)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applyMapSelection}
                      disabled={!mapPickPoint}
                      className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-40"
                    >
                      Use this location
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Editable / manual input */}
            {(editingAddress || locStage === "idle" || locStage === "error") && (
              <div className="mx-5 mb-4">
                <div className="relative">
                  <input
                    ref={addressRef}
                    type="text"
                    value={editingAddress ? manualAddress : ""}
                    onChange={(e) => setManualAddress(e.target.value)}
                    onFocus={() => { if (!editingAddress) { setManualAddress(""); setEditingAddress(true); } }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveManualAddress(); } }}
                    placeholder="Street, landmark, or neighbourhood…"
                    style={{ fontSize: "16px" }}
                    suppressHydrationWarning
                    className="w-full rounded-xl bg-slate-50 py-3 pl-4 pr-24 text-sm text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-brand-300"
                  />
                  {editingAddress && (
                    <button
                      type="button"
                      onClick={saveManualAddress}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      Save
                    </button>
                  )}
                </div>
                {!editingAddress && (
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 hover:underline"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      Use my GPS location instead
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMapPickerOpen(true);
                        setMapPickerError("");
                        setMapPickPoint((prev) => prev ?? { lat: 13.0827, lng: 80.2707 });
                        setEditingAddress(false);
                      }}
                      className="text-[11px] font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2"
                    >
                      Pick on map
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 2. Category ── */}
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-800">What type of issue? <span className="text-brand-500">*</span></p>
            <div className="mt-3 flex flex-wrap gap-2">
              {issueCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat === category ? "" : cat)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    category === cat
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{CAT_ICON[cat] ?? "📌"}</span>
                  {cat}
                </button>
              ))}
            </div>
            {!category && (
              <p className="mt-2 text-[11px] text-slate-400">Tap to select - required</p>
            )}
          </div>

          {/* ── 3. Photo ── */}
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">📸 Photo</p>
              <span className="text-[11px] text-slate-400">Up to 3 · optional but recommended</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handlePhotos} />
            <div className="mt-3 flex flex-wrap gap-3">
            {photos.map((item, i) => (
                <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl ring-1 ring-slate-200">
                  <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(item.previewUrl);
                      setPhotos((p) => p.filter((_, j) => j !== i));
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white"
                  >✕</button>
                </div>
              ))}
              {photos.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-brand-300 hover:text-brand-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <span className="text-[11px]">Add photo</span>
                </button>
              )}
            </div>
            {photos.length === 0 && (
              <p className="mt-2 text-[11px] text-slate-400">A photo makes your report 3× more likely to get resolved quickly.</p>
            )}
            {photoError && (
              <p className="mt-2 text-[11px] font-semibold text-brand-600">{photoError}</p>
            )}
          </div>

          {/* ── 4. Note ── */}
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-800">📝 Add a note <span className="font-normal text-slate-400">(optional)</span></p>
            <textarea
              placeholder="e.g. This pothole has been here for 2 weeks. Cars keep swerving. Safety risk at night."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              style={{ fontSize: "16px" }}
              className="mt-3 w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-brand-300"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">{description.length}/500</p>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={!category || submitting || !user}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-4 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-40"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                Submit Report
                {!category && <span className="text-[11px] font-normal opacity-70">- select category first</span>}
              </>
            )}
          </button>
          {submitting && (
            <div className="rounded-xl bg-slate-100 px-3 py-2">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-600">{uploadStage || "Submitting..."}</span>
                <span className="text-slate-500">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <p className="text-center text-[11px] text-slate-400">
            {user
              ? "Public immediately · Linked to your account for updates"
              : "Sign in required to submit and track updates"}
          </p>
          {submitError && (
            <p className="text-center text-xs font-semibold text-brand-600">{submitError}</p>
          )}
        </form>
      </PageBody>
    </main>
  );
}
