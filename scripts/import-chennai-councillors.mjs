#!/usr/bin/env node
/**
 * Import Chennai GCC 2022 elected councillors into representatives seed SQL.
 *
 * Source: OpenDataChennai / GCC 2022 urban local body election results (winners).
 * https://github.com/elseasama/OpenDataChennai/blob/main/chnresult2022.csv
 * Also mirrored on OpenCity.in (Chennai GCC Elections Data 2022).
 *
 * Usage:
 *   node scripts/import-chennai-councillors.mjs
 *   node scripts/import-chennai-councillors.mjs --download
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CONFIG = {
  resultsCsv: "scripts/data/chnresult2022.csv",
  wardsMasterCsv: "supabase/chennai_200_wards_master.csv",
  downloadUrl:
    "https://raw.githubusercontent.com/elseasama/OpenDataChennai/main/chnresult2022.csv",
  sqlOut: "supabase/015_seed_chennai_representatives.sql",
};

const PARTY_DISPLAY = {
  DMK: "DMK",
  ADMK: "AIADMK",
  INC: "INC",
  BJP: "BJP",
  Independent: "Independent",
  "CPI (M)": "CPI(M)",
  CPI: "CPI",
  VCK: "VCK",
  MDMK: "MDMK",
  IUML: "IUML",
  AMMK: "AMMK",
};

const PARTY_COLOR = {
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
};

function parseArgs() {
  return { download: process.argv.includes("--download") };
}

async function maybeDownload() {
  const fp = path.join(ROOT, CONFIG.resultsCsv);
  if (existsSync(fp) && !parseArgs().download) return fp;
  mkdirSync(path.dirname(fp), { recursive: true });
  const res = await fetch(CONFIG.downloadUrl);
  if (!res.ok) throw new Error(`Failed to download councillor CSV (${res.status})`);
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

function loadWardMaster() {
  const text = readFileSync(path.join(ROOT, CONFIG.wardsMasterCsv), "utf-8");
  const rows = parseCsv(text);
  const byNumber = new Map();
  for (const row of rows) {
    const n = Number(row.ward_number);
    if (!Number.isFinite(n)) continue;
    byNumber.set(n, row);
  }
  return byNumber;
}

function wardIdFromNumber(n) {
  return `ward-${String(n).padStart(3, "0")}`;
}

function titleCaseName(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeParty(raw) {
  const key = raw.trim();
  const display = PARTY_DISPLAY[key] ?? key;
  return { display, color: PARTY_COLOR[display] ?? PARTY_COLOR[key] ?? "#64748b" };
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function dicebearUrl(name) {
  const seed = encodeURIComponent(name.replace(/\s+/g, " ").trim());
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=e2e8f0&fontFamily=Arial&fontSize=40`;
}

function parseResults(rows) {
  const wardCol = Object.keys(rows[0]).find((k) => k.includes("வார்டு") || k.toLowerCase() === "ward") ?? "Ward";
  const zoneCol = Object.keys(rows[0]).find((k) => k.includes("மண்டல") || k.toLowerCase() === "zone") ?? "Zone";

  return rows
    .map((row) => {
      const wardNumber = Number(row[wardCol] ?? row.Ward ?? 0);
      const name = titleCaseName(row["Name of candidate"] ?? "");
      const partyRaw = (row["Party (s)"] ?? "").trim();
      const zone = Number(row[zoneCol] ?? row.Zone ?? 0);
      if (!Number.isFinite(wardNumber) || wardNumber <= 0 || !name) return null;
      const party = normalizeParty(partyRaw);
      return {
        wardNumber,
        wardId: wardIdFromNumber(wardNumber),
        name,
        party: party.display,
        partyColor: party.color,
        zone,
        reservation: row.Reservation ?? "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.wardNumber - b.wardNumber);
}

function buildSql(councillors, wardMaster) {
  const lines = councillors.map((c) => {
    const master = wardMaster.get(c.wardNumber);
    const zoneName = master?.zone_name ?? `Zone ${c.zone}`;
    const wardName = master?.ward_name ?? `Ward ${c.wardNumber}`;
    const id = `rep-${c.wardId}-councillor`;
    const area = `${wardName}, ${zoneName}`;
    const constituency = `GCC Ward ${c.wardNumber}`;
    const photo = dicebearUrl(c.name);
    return [
      `  ('${id}', '${c.wardId}', '${sqlEscape(c.name)}', 'Councillor',`,
      `   '${sqlEscape(area)}', '${sqlEscape(constituency)}',`,
      `   '${sqlEscape(c.party)}', '${c.partyColor}', '${photo}',`,
      `   'commr.gcc@gmail.com', '1913', 'Mon-Sat, 10:00 AM – 5:00 PM', 'phone')`,
    ].join("\n");
  });

  return [
    `-- Chennai GCC elected councillors (2022 urban local body elections).`,
    `-- Regenerate: node scripts/import-chennai-councillors.mjs`,
    `-- Source: https://github.com/elseasama/OpenDataChennai (chnresult2022.csv)`,
    `-- Contact fields use GCC corporate helpline/email; per-councillor contacts are not in the public dataset.`,
    `-- Councillor photos: MyNeta has no Chennai GCC 2022 local-body dataset; initials avatars used.`,
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

async function main() {
  const csvPath = await maybeDownload();
  const rows = parseCsv(readFileSync(csvPath, "utf-8"));
  const councillors = parseResults(rows);
  if (councillors.length === 0) throw new Error("No councillor rows parsed");
  if (councillors.length !== 200) {
    console.warn(`Warning: expected 200 councillors, got ${councillors.length}`);
  }

  const wardMaster = loadWardMaster();
  const sql = buildSql(councillors, wardMaster);
  const outPath = path.join(ROOT, CONFIG.sqlOut);
  writeFileSync(outPath, sql);
  console.log(`Wrote ${outPath} (${councillors.length} councillors)`);

  const parties = new Map();
  for (const c of councillors) parties.set(c.party, (parties.get(c.party) ?? 0) + 1);
  console.log("Party breakdown:", Object.fromEntries(parties));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
