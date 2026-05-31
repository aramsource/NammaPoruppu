#!/usr/bin/env node
/**
 * Import Chennai MLAs from the 2026 Tamil Nadu assembly election results.
 *
 * Ward → assembly constituency mapping is derived by spatial join:
 *   GCC ward centroids (public/data/chennai-wards.geojson)
 *   × TN assembly boundaries (OpenCity chennai-election-boundaries / tn_acs_map.kml)
 *
 * Results: OpenCity TN assembly election results 2026 (ECI).
 *
 * Usage:
 *   node scripts/import-chennai-mlas.mjs
 *   node scripts/import-chennai-mlas.mjs --download
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { loadPhotoManifest } from "./lib/myneta-photos.mjs";

const ROOT = process.cwd();

const CONFIG = {
  resultsCsv: "scripts/data/tn-results-2026.csv",
  resultsUrl:
    "https://data.opencity.in/dataset/8325ad4d-89b7-442c-80a6-24142868b8a3/resource/d7f9aa7b-9c7f-4e37-9a0e-423f6c7f242c/download/tn-results-2026.csv",
  acKml: "scripts/data/tn_acs_map.kml",
  acKmlUrl:
    "https://data.opencity.in/dataset/0b8bf444-411e-413b-ba09-148afc76a79f/resource/83e523a9-a038-4df7-8f9b-7fbb2237acfd/download/tn_acs_map.kml",
  wardGeojson: "public/data/chennai-wards.geojson",
  wardsMasterCsv: "supabase/chennai_200_wards_master.csv",
  wardAcMappingCsv: "scripts/data/chennai_ward_assembly_mapping.csv",
  mynetaPhotoManifest: "scripts/data/myneta-mla-photo-urls.json",
  sqlOut: "supabase/016_seed_chennai_mlas.sql",
};

const PARTY_DISPLAY = {
  "Tamilaga Vettri Kazhagam": "TVK",
  "Dravida Munnetra Kazhagam": "DMK",
  "All India Anna Dravida Munnetra Kazhagam": "AIADMK",
  "Bharatiya Janata Party": "BJP",
  "Indian National Congress": "INC",
  "Naam Tamilar Katchi": "NTK",
  "Communist Party of India (Marxist)": "CPI(M)",
  "Communist Party of India": "CPI",
  "Viduthalai Chiruthaigal Katchi": "VCK",
  "Marumalarchi Dravida Munnetra Kazhagam": "MDMK",
  "Indian Union Muslim League": "IUML",
  "Amma Makkal Munnetra Kazhagam": "AMMK",
  Independent: "Independent",
};

const PARTY_COLOR = {
  TVK: "#d97706",
  DMK: "#e3000f",
  AIADMK: "#006400",
  INC: "#1a6fc4",
  BJP: "#ff6600",
  Independent: "#64748b",
  "CPI(M)": "#b91c1c",
  CPI: "#dc2626",
  VCK: "#1d4ed8",
  MDMK: "#991b1b",
  IUML: "#059669",
  AMMK: "#7c3aed",
  NTK: "#111827",
};

function parseArgs() {
  return { download: process.argv.includes("--download") };
}

async function maybeDownload(file, url, label) {
  const fp = path.join(ROOT, file);
  if (existsSync(fp) && !parseArgs().download) return fp;
  mkdirSync(path.dirname(fp), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${label} (${res.status})`);
  writeFileSync(fp, Buffer.from(await res.arrayBuffer()));
  console.log(`Downloaded ${fp}`);
  return fp;
}

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const header = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = splitCsvLine(line);
    const row = {};
    header.forEach((key, idx) => {
      row[key.trim()] = (cols[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseSimpleData(block) {
  const props = {};
  const re = /<SimpleData name="([^"]+)">([^<]*)<\/SimpleData>/g;
  let m;
  while ((m = re.exec(block)) !== null) props[m[1]] = m[2].trim();
  return props;
}

function parseCoordinateRings(block) {
  const rings = [];
  const re = /<coordinates>([\s\S]*?)<\/coordinates>/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const ring = m[1]
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(",").map(Number))
      .filter((p) => p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (ring.length >= 4) rings.push(ring);
  }
  return rings;
}

function parseAcKml(kmlText) {
  const chunks = kmlText.split(/<Placemark[^>]*>/i).slice(1);
  const acs = [];
  for (const chunk of chunks) {
    const block = chunk.split(/<\/Placemark>/i)[0] ?? "";
    const props = parseSimpleData(block);
    const acNo = Number(props.ac_no);
    const acName = props.ac_name?.trim();
    if (!Number.isFinite(acNo) || !acName) continue;
    const rings = parseCoordinateRings(block);
    if (rings.length === 0) continue;
    acs.push({ acNo, acName, rings });
  }
  return acs;
}

function ringCentroid(ring) {
  let sx = 0;
  let sy = 0;
  for (const [x, y] of ring) {
    sx += x;
    sy += y;
  }
  return [sx / ring.length, sy / ring.length];
}

function geometryCentroid(geometry) {
  if (geometry.type === "Polygon") {
    return ringCentroid(geometry.coordinates[0]);
  }
  if (geometry.type === "MultiPolygon") {
    let best = null;
    let bestLen = 0;
    for (const poly of geometry.coordinates) {
      const ring = poly[0];
      if (ring.length > bestLen) {
        bestLen = ring.length;
        best = ring;
      }
    }
    return best ? ringCentroid(best) : null;
  }
  return null;
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInAc(point, ac) {
  for (const ring of ac.rings) {
    if (pointInRing(point, ring)) return true;
  }
  return false;
}

function findAcForPoint(point, acs) {
  for (const ac of acs) {
    if (pointInAc(point, ac)) return ac;
  }
  return null;
}

function normalizeAcKey(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function titleCaseName(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === "vi" || lower === "ka") return part.toUpperCase();
      if (/^dr\.?$/i.test(part)) return "Dr.";
      if (/^[a-z]\.?$/i.test(part)) return part.replace(/\./, "").toUpperCase() + ".";
      if (/^[a-z]+\.[a-z]\.?$/i.test(part)) {
        const [first, initial] = part.replace(/\.$/, "").split(".");
        return `${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()} ${initial.charAt(0).toUpperCase()}.`;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

function displayAcName(raw) {
  const cleaned = raw
    .replace(/\s*\(sc\)\s*$/i, "")
    .replace(/\./g, ". ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned
    .split(" ")
    .map((w) => {
      if (w.toLowerCase() === "vi" || w.toLowerCase() === "ka") return w.toUpperCase();
      if (w.includes("-")) {
        return w
          .split("-")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
          .join("-");
      }
      if (/^dr\.?$/i.test(w)) return "Dr.";
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/Thiru-Vi-Ka-Nagar/i, "Thiru-Vi-Ka-Nagar");
}

function normalizeParty(raw) {
  const display = PARTY_DISPLAY[raw.trim()] ?? raw.trim();
  return { display, color: PARTY_COLOR[display] ?? "#64748b" };
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function dicebearUrl(name) {
  const seed = encodeURIComponent(name.replace(/\s+/g, " ").trim());
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=e2e8f0&fontFamily=Arial&fontSize=40`;
}

function loadMlaPhotoUrls() {
  return loadPhotoManifest(path.join(ROOT, CONFIG.mynetaPhotoManifest));
}

function photoUrlForAc(acNo, name, photoByAc) {
  return photoByAc.get(acNo) ?? dicebearUrl(name);
}

function wardIdFromNumber(n) {
  return `ward-${String(n).padStart(3, "0")}`;
}

function buildWardAcMapping(wardGeojson, acs) {
  const mapping = [];
  const unmatched = [];
  for (const feature of wardGeojson.features) {
    const wardNo = Number(feature.properties?.Ward_No);
    if (!Number.isFinite(wardNo) || wardNo <= 0) continue;
    const centroid = geometryCentroid(feature.geometry);
    if (!centroid) {
      unmatched.push(wardNo);
      continue;
    }
    const ac = findAcForPoint(centroid, acs);
    if (!ac) {
      unmatched.push(wardNo);
      continue;
    }
    mapping.push({
      wardNumber: wardNo,
      wardId: wardIdFromNumber(wardNo),
      acNo: ac.acNo,
      acName: ac.acName,
    });
  }
  mapping.sort((a, b) => a.wardNumber - b.wardNumber);
  if (unmatched.length) {
    console.warn(`Warning: ${unmatched.length} ward(s) without AC match:`, unmatched.join(", "));
  }
  return mapping;
}

function parseWinners(resultsRows) {
  const byAc = new Map();
  for (const row of resultsRows) {
    const acNo = Number(row["AC No"]);
    const acName = row["AC Name"]?.trim() ?? "";
    const votes = Number(String(row["Total Votes"] ?? "0").replace(/,/g, ""));
    const candidate = row.Candidate?.trim() ?? "";
    const partyRaw = row.Party?.trim() ?? "";
    if (!Number.isFinite(acNo) || !candidate || !Number.isFinite(votes)) continue;
    const entry = byAc.get(acNo) ?? { acNo, acName, winner: null };
    if (!entry.winner || votes > entry.winner.votes) {
      entry.acName = acName || entry.acName;
      entry.winner = { name: candidate, partyRaw, votes };
    }
    byAc.set(acNo, entry);
  }
  const winnersByKey = new Map();
  for (const entry of byAc.values()) {
    if (!entry.winner) continue;
    const party = normalizeParty(entry.winner.partyRaw);
    const winner = {
      acNo: entry.acNo,
      acName: entry.acName,
      name: titleCaseName(entry.winner.name),
      party: party.display,
      partyColor: party.color,
    };
    winnersByKey.set(entry.acNo, winner);
    winnersByKey.set(normalizeAcKey(entry.acName), winner);
  }
  return winnersByKey;
}

function winnerForAc(acNo, acName, winnersByKey) {
  return winnersByKey.get(acNo) ?? winnersByKey.get(normalizeAcKey(acName)) ?? null;
}

function writeWardAcMappingCsv(mapping) {
  const lines = [
    "ward_number,ward_id,ac_no,ac_name",
    ...mapping.map((m) => `${m.wardNumber},${m.wardId},${m.acNo},"${m.acName.replace(/"/g, '""')}"`),
  ];
  const out = path.join(ROOT, CONFIG.wardAcMappingCsv);
  writeFileSync(out, lines.join("\n") + "\n");
  console.log(`Wrote ${out} (${mapping.length} rows)`);
}

function updateWardsMasterCsv(mapping, wardMasterRows) {
  const acByWard = new Map(mapping.map((m) => [m.wardNumber, displayAcName(m.acName)]));
  const header = "city_id,ward_id,ward_number,ward_name,zone_name,assembly_constituency";
  const lines = [header];
  for (const row of wardMasterRows) {
    const n = Number(row.ward_number);
    const ac = acByWard.get(n) ?? row.assembly_constituency ?? "";
    lines.push(
      [
        row.city_id,
        row.ward_id,
        row.ward_number,
        row.ward_name,
        row.zone_name,
        ac.includes(",") ? `"${ac}"` : ac,
      ].join(","),
    );
  }
  writeFileSync(path.join(ROOT, CONFIG.wardsMasterCsv), lines.join("\n") + "\n");
  console.log(`Updated ${CONFIG.wardsMasterCsv}`);
}

function buildSql(mapping, wardMaster, winnersByKey, photoByAc) {
  const lines = [];
  const acCounts = new Map();
  for (const m of mapping) {
    const winner = winnerForAc(m.acNo, m.acName, winnersByKey);
    if (!winner) {
      console.warn(`No 2026 winner for AC ${m.acNo} ${m.acName} (ward ${m.wardNumber})`);
      continue;
    }
    const master = wardMaster.get(m.wardNumber);
    const zoneName = master?.zone_name ?? "Chennai";
    const wardName = master?.ward_name ?? `Ward ${m.wardNumber}`;
    const acDisplay = displayAcName(m.acName);
    const id = `rep-${m.wardId}-mla`;
    const area = `${wardName}, ${zoneName}`;
    const constituency = acDisplay;
    const photo = photoUrlForAc(m.acNo, winner.name, photoByAc);
    acCounts.set(winner.acNo, (acCounts.get(winner.acNo) ?? 0) + 1);
    lines.push(
      [
        `  ('${id}', '${m.wardId}', '${sqlEscape(winner.name)}', 'MLA',`,
        `   '${sqlEscape(area)}', '${sqlEscape(constituency)}',`,
        `   '${sqlEscape(winner.party)}', '${winner.partyColor}', '${photo}',`,
        `   'secretariat@tn.gov.in', '044-25670203', 'Mon-Fri, 10:00 AM – 5:00 PM', 'phone')`,
      ].join("\n"),
    );
  }

  const uniqueAcs = new Set(mapping.map((m) => m.acNo)).size;
  return [
    `-- Chennai elected MLAs (2026 Tamil Nadu assembly elections).`,
    `-- Regenerate: node scripts/import-chennai-mlas.mjs`,
    `-- Results: https://data.opencity.in/dataset/tamil-nadu-final-results-2026 (ECI)`,
    `-- Ward→AC mapping: spatial join of chennai-wards.geojson × tn_acs_map.kml (OpenCity)`,
    `-- ${lines.length} MLA rows across ${uniqueAcs} assembly constituencies.`,
    `-- Contact fields use TN Legislative Assembly Secretariat; per-MLA contacts are not in the public ECI dataset.`,
    `-- MLA photos: https://myneta.info/TamilNadu2026/ (ADR/ECI affidavit portraits).`,
    `-- Regenerate photos: node scripts/fetch-myneta-mla-photos.mjs`,
    ``,
    `-- Backfill assembly constituency on wards (derived mapping).`,
    ...mapping.map((m) => {
      const acDisplay = displayAcName(m.acName);
      return `update public.wards set assembly_constituency = '${sqlEscape(acDisplay)}' where id = '${m.wardId}';`;
    }),
    ``,
    `insert into public.representatives (`,
    `  id, ward_id, name, role, area, constituency, party, party_color, photo_url,`,
    `  email, helpline, office_hours, preferred_channel`,
    `)`,
    `values`,
    lines.join(",\n"),
    `on conflict (id) do update set`,
    `  ward_id = excluded.ward_id,`,
    `  name = excluded.name,`,
    `  role = excluded.role,`,
    `  area = excluded.area,`,
    `  constituency = excluded.constituency,`,
    `  party = excluded.party,`,
    `  party_color = excluded.party_color,`,
    `  photo_url = excluded.photo_url,`,
    `  email = excluded.email,`,
    `  helpline = excluded.helpline,`,
    `  office_hours = excluded.office_hours,`,
    `  preferred_channel = excluded.preferred_channel,`,
    `  updated_at = now();`,
    ``,
  ].join("\n");
}

function loadWardMaster() {
  const text = readFileSync(path.join(ROOT, CONFIG.wardsMasterCsv), "utf-8");
  const rows = parseCsv(text);
  const byNumber = new Map();
  for (const row of rows) {
    const n = Number(row.ward_number);
    if (Number.isFinite(n)) byNumber.set(n, row);
  }
  return { rows, byNumber };
}

async function main() {
  await maybeDownload(CONFIG.resultsCsv, CONFIG.resultsUrl, "2026 results CSV");
  await maybeDownload(CONFIG.acKml, CONFIG.acKmlUrl, "TN AC KML");

  const wardGeojson = JSON.parse(readFileSync(path.join(ROOT, CONFIG.wardGeojson), "utf-8"));
  const acs = parseAcKml(readFileSync(path.join(ROOT, CONFIG.acKml), "utf-8"));
  const mapping = buildWardAcMapping(wardGeojson, acs);
  if (mapping.length === 0) throw new Error("No ward→AC mappings produced");

  const resultsRows = parseCsv(readFileSync(path.join(ROOT, CONFIG.resultsCsv), "utf-8"));
  const winnersByKey = parseWinners(resultsRows);
  const photoByAc = loadMlaPhotoUrls();
  if (photoByAc.size === 0) {
    console.warn(
      "Warning: no MyNeta photo manifest — run node scripts/fetch-myneta-mla-photos.mjs first",
    );
  }

  writeWardAcMappingCsv(mapping);
  const { rows: wardMasterRows, byNumber: wardMaster } = loadWardMaster();
  updateWardsMasterCsv(mapping, wardMasterRows);

  const sql = buildSql(mapping, wardMaster, winnersByKey, photoByAc);
  const outPath = path.join(ROOT, CONFIG.sqlOut);
  writeFileSync(outPath, sql);
  const mlaCount = (sql.match(/'MLA'/g) ?? []).length;
  console.log(`Wrote ${outPath} (${mlaCount} MLA rows, ${new Set(mapping.map((m) => m.acNo)).size} ACs)`);

  const acSummary = new Map();
  for (const m of mapping) {
    const w = winnerForAc(m.acNo, m.acName, winnersByKey);
    if (!w) continue;
    acSummary.set(w.acNo, `${displayAcName(w.acName)} — ${w.name} (${w.party})`);
  }
  console.log("MLAs by AC:");
  for (const [acNo, label] of [...acSummary.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${acNo}: ${label}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
