#!/usr/bin/env node
/**
 * Fetch MyNeta profile photo URLs for Chennai MLAs (TN 2026 winners).
 *
 * Usage:
 *   node scripts/fetch-myneta-mla-photos.mjs
 */
import path from "node:path";
import {
  fetchMynetaPhotosForAcs,
  loadChennaiAcList,
  writePhotoManifest,
} from "./lib/myneta-photos.mjs";

const OUT = path.join(process.cwd(), "scripts/data/myneta-mla-photo-urls.json");

async function main() {
  const acList = loadChennaiAcList();
  console.log(`Fetching MyNeta photos for ${acList.length} assembly constituencies...`);
  const byAc = await fetchMynetaPhotosForAcs(acList);
  writePhotoManifest(byAc, OUT);
  const ok = Object.values(byAc).filter((e) => e.photoUrl).length;
  console.log(`Wrote ${OUT} (${ok}/${acList.length} with photos)`);
  for (const entry of Object.values(byAc).sort((a, b) => a.acNo - b.acNo)) {
    const status = entry.photoUrl ? "ok" : entry.error ?? "missing";
    console.log(`  AC ${entry.acNo} ${entry.acName}: ${status}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
