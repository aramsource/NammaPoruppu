/**
 * Fetch candidate profile photo URLs from MyNeta (ADR) for Tamil Nadu 2026.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const MYNETA = {
  candidatesUrl: (constituencyId) =>
    `https://myneta.info/TamilNadu2026/index.php?action=show_candidates&constituency_id=${constituencyId}`,
  candidateUrl: (id) =>
    `https://myneta.info/TamilNadu2026/candidate.php?candidate_id=${id}`,
  photoRe: /https:\/\/(?:www\.)?myneta\.info\/images_candidate\/TamilNadu2026\/[a-f0-9]+\.jpg/i,
};

/** ECI AC number → MyNeta constituency_id (discovered via title scrape). */
export const CHENNAI_AC_MYNETA_CONSTITUENCY_ID = {
  2: 171, // Ponneri (SC)
  7: 176, // Maduravoyal / Madhuravoyal
  8: 177, // Ambattur
  9: 178, // Madavaram / Madhavaram
  10: 179, // Tiruvottiyur / Thiruvottiyur
  11: 10, // Dr.Radhakrishnan Nagar
  12: 5, // Perambur
  13: 6, // Kolathur
  14: 7, // Villivakkam
  15: 8, // Thiru-Vi-Ka-Nagar (SC)
  16: 9, // Egmore (SC)
  17: 3, // Royapuram
  18: 11, // Harbour
  19: 12, // Chepauk-Thiruvallikeni
  20: 13, // Thousand Lights
  21: 14, // Anna Nagar
  22: 15, // Virugampakkam
  23: 16, // Saidapet
  24: 18, // Thiyagarayanagar
  25: 19, // Mylapore
  26: 4, // Velachery
  27: 20, // Shozhinganallur / Sholinganallur
  28: 71, // Alandur
};

export function norm(value) {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Normalize person names for ECI ↔ MyNeta matching. */
export function normName(value) {
  return norm(value);
}

export function parseCandidatesPage(html) {
  const candidates = [];
  const re = /candidate_id=(\d+)>([^<]+)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    candidates.push({
      candidateId: Number(m[1]),
      name: m[2].trim(),
    });
  }
  return candidates;
}

export function matchCandidateByName(winnerName, candidates) {
  const key = normName(winnerName);
  if (!key) return null;
  const hits = candidates.filter((c) => normName(c.name) === key);
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) return hits[0];
  // Partial match when initials differ (e.g. "K V. Vijay Damu" vs "K.V.Vijay Damu")
  const partial = candidates.filter((c) => {
    const ck = normName(c.name);
    return ck.includes(key) || key.includes(ck);
  });
  if (partial.length === 1) return partial[0];
  return null;
}

export function parseWinnersFromResultsCsv(csvText) {
  const lines = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const header = lines[0].split(",").map((h) => h.trim());
  const byAc = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(",");
    const row = {};
    header.forEach((key, idx) => {
      row[key] = (cols[idx] ?? "").trim();
    });
    const acNo = Number(row["AC No"]);
    const votes = Number(String(row["Total Votes"] ?? "0").replace(/,/g, ""));
    const candidate = row.Candidate?.trim() ?? "";
    if (!Number.isFinite(acNo) || !candidate || !Number.isFinite(votes)) continue;
    const entry = byAc.get(acNo) ?? { acNo, winner: null };
    if (!entry.winner || votes > entry.winner.votes) {
      entry.winner = { name: candidate, votes };
    }
    byAc.set(acNo, entry);
  }
  return byAc;
}

export function loadChennaiWinnersByAc() {
  const csvPath = path.join(ROOT, "scripts/data/tn-results-2026.csv");
  if (!existsSync(csvPath)) {
    throw new Error("Missing scripts/data/tn-results-2026.csv");
  }
  return parseWinnersFromResultsCsv(readFileSync(csvPath, "utf-8"));
}

export async function fetchPhotoUrl(candidateId) {
  const res = await fetch(MYNETA.candidateUrl(candidateId), {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`MyNeta candidate ${candidateId} (${res.status})`);
  const html = await res.text();
  const m = html.match(MYNETA.photoRe);
  return m ? m[0].replace("www.myneta.info", "myneta.info") : null;
}

export async function fetchMynetaPhotosForAcs(acList, { delayMs = 150 } = {}) {
  const winnersByAc = loadChennaiWinnersByAc();
  const byAc = {};

  for (const { acNo, acName } of acList) {
    const constituencyId = CHENNAI_AC_MYNETA_CONSTITUENCY_ID[acNo];
    const winnerRow = winnersByAc.get(acNo);
    const winnerName = winnerRow?.winner?.name;

    if (!constituencyId) {
      byAc[String(acNo)] = { acNo, acName, photoUrl: null, error: "no_constituency_id" };
      continue;
    }
    if (!winnerName) {
      byAc[String(acNo)] = { acNo, acName, photoUrl: null, error: "no_eci_winner" };
      continue;
    }

    await sleep(delayMs);
    try {
      const listRes = await fetch(MYNETA.candidatesUrl(constituencyId), {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!listRes.ok) {
        byAc[String(acNo)] = {
          acNo,
          acName,
          photoUrl: null,
          error: `constituency_page_${listRes.status}`,
        };
        continue;
      }
      const candidates = parseCandidatesPage(await listRes.text());
      const matched = matchCandidateByName(winnerName, candidates);
      if (!matched) {
        byAc[String(acNo)] = {
          acNo,
          acName,
          winnerName,
          constituencyId,
          photoUrl: null,
          error: "no_candidate_match",
        };
        continue;
      }

      await sleep(delayMs);
      const photoUrl = await fetchPhotoUrl(matched.candidateId);
      byAc[String(acNo)] = {
        acNo,
        acName,
        constituencyId,
        candidateId: matched.candidateId,
        candidateName: matched.name,
        winnerName,
        photoUrl,
        source: "https://myneta.info/TamilNadu2026/",
      };
    } catch (err) {
      byAc[String(acNo)] = {
        acNo,
        acName,
        photoUrl: null,
        error: String(err.message ?? err),
      };
    }
  }
  return byAc;
}

export function loadChennaiAcList() {
  const mappingCsv = path.join(ROOT, "scripts/data/chennai_ward_assembly_mapping.csv");
  if (!existsSync(mappingCsv)) {
    throw new Error("Run import-chennai-mlas.mjs first to generate ward→AC mapping");
  }
  const text = readFileSync(mappingCsv, "utf-8");
  const lines = text.trim().split("\n").slice(1);
  const seen = new Map();
  for (const line of lines) {
    const parts = line.split(",");
    const acNoNum = Number(parts[2]);
    if (!Number.isFinite(acNoNum)) continue;
    let acName = parts.slice(3).join(",").trim();
    if (acName.startsWith('"') && acName.endsWith('"')) {
      acName = acName.slice(1, -1).replace(/""/g, '"');
    }
    if (!seen.has(acNoNum)) seen.set(acNoNum, acName);
  }
  return [...seen.entries()]
    .map(([acNo, acName]) => ({ acNo, acName }))
    .sort((a, b) => a.acNo - b.acNo);
}

export function writePhotoManifest(byAc, outPath) {
  writeFileSync(outPath, JSON.stringify(byAc, null, 2) + "\n");
}

export function loadPhotoManifest(manifestPath) {
  if (!existsSync(manifestPath)) return new Map();
  const raw = JSON.parse(readFileSync(manifestPath, "utf-8"));
  return new Map(
    Object.entries(raw).map(([acNo, entry]) => [Number(acNo), entry.photoUrl ?? null]),
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
