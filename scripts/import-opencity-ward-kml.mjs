#!/usr/bin/env node
/**
 * Convert OpenCity.in municipal ward KML (livingatlas.esri.in) into app GeoJSON + SQL seed.
 *
 * Sources:
 * - https://data.opencity.in/dataset/coimbatore-wards-map
 * - https://data.opencity.in/dataset/madurai-wards-map
 *
 * Usage:
 *   node scripts/import-opencity-ward-kml.mjs
 *   node scripts/import-opencity-ward-kml.mjs --download
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CITY_CONFIG = [
  {
    id: "coimbatore",
    name: "Coimbatore",
    prefix: "cbe",
    kml: "scripts/data/coimbatore-wards-2024.kml",
    downloadUrl:
      "https://data.opencity.in/dataset/bcedc1ea-ba01-468d-83c2-6aa5afe74db0/resource/3a068058-d69d-4621-8f2a-e3dcfa7224be/download/3111f6d4-f8db-44c2-a608-61c975e9b744.kml",
  },
  {
    id: "madurai",
    name: "Madurai",
    prefix: "mdr",
    kml: "scripts/data/madurai-wards-2024.kml",
    downloadUrl:
      "https://data.opencity.in/dataset/cc31c08b-1463-43e9-b613-1863e6b3eac1/resource/dbfa5196-71ad-4858-ac88-d874c975da85/download/49412899-c569-474a-9868-c3d4c7d46655.kml",
  },
];

function parseArgs() {
  return { download: process.argv.includes("--download") };
}

async function maybeDownload(config) {
  const fp = path.join(ROOT, config.kml);
  if (existsSync(fp) && !parseArgs().download) return fp;
  mkdirSync(path.dirname(fp), { recursive: true });
  const res = await fetch(config.downloadUrl);
  if (!res.ok) throw new Error(`Failed to download ${config.id} KML (${res.status})`);
  writeFileSync(fp, Buffer.from(await res.arrayBuffer()));
  console.log(`Downloaded ${fp}`);
  return fp;
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

function ringsToGeometry(rings) {
  if (rings.length === 0) return null;
  if (rings.length === 1) {
    return { type: "Polygon", coordinates: rings };
  }
  return { type: "MultiPolygon", coordinates: rings.map((ring) => [ring]) };
}

function wardNumberFromProps(props) {
  const raw = props.sourcewardcode || props.ward_lgd_name || props.ward_lgd_code || "";
  const n = Number(String(raw).trim());
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

function parseKml(kmlText) {
  const chunks = kmlText.split(/<Placemark>/i).slice(1);
  const features = [];
  for (const chunk of chunks) {
    const block = chunk.split(/<\/Placemark>/i)[0] ?? "";
    const props = parseSimpleData(block);
    const wardNumber = wardNumberFromProps(props);
    if (!wardNumber) continue;
    const rings = parseCoordinateRings(block);
    const geometry = ringsToGeometry(rings);
    if (!geometry) continue;
    features.push({
      type: "Feature",
      properties: {
        Ward_No: wardNumber,
        Zone_Name: props.zone || "Unknown",
        Source_Ward_Code: props.sourcewardcode || String(wardNumber),
        Source_Ward_Name: props.sourcewardname || "",
      },
      geometry,
    });
  }
  return features;
}

function dedupeByWardNumber(features) {
  const byNo = new Map();
  for (const f of features) {
    const n = Number(f.properties.Ward_No);
    if (!byNo.has(n)) byNo.set(n, f);
  }
  return [...byNo.values()].sort((a, b) => Number(a.properties.Ward_No) - Number(b.properties.Ward_No));
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function buildSql(config, features) {
  const lines = features.map((f) => {
    const wardNumber = Number(f.properties.Ward_No);
    const id = `${config.prefix}-${String(wardNumber).padStart(3, "0")}`;
    const zone = sqlEscape(f.properties.Zone_Name || "Unknown");
    return `  ('${id}', '${config.id}', ${wardNumber}, 'Ward ${wardNumber}', '${zone}', null)`;
  });
  return [
    `insert into public.wards (id, city_id, ward_number, ward_name, zone_name, assembly_constituency)`,
    `values`,
    lines.join(",\n"),
    `on conflict (id) do update set`,
    `  city_id = excluded.city_id,`,
    `  ward_number = excluded.ward_number,`,
    `  ward_name = excluded.ward_name,`,
    `  zone_name = excluded.zone_name;`,
  ].join("\n");
}

async function importCity(config) {
  const kmlPath = await maybeDownload(config);
  const kmlText = readFileSync(kmlPath, "utf-8");
  const features = dedupeByWardNumber(parseKml(kmlText));
  if (features.length === 0) throw new Error(`No ward features parsed for ${config.id}`);

  const geo = {
    type: "FeatureCollection",
    metadata: {
      source: "OpenCity.in / livingatlas.esri.in",
      city: config.name,
      license: "Public Domain",
      importedAt: new Date().toISOString().slice(0, 10),
    },
    features,
  };

  const geoPath = path.join(ROOT, "public", "data", `${config.id}-wards.geojson`);
  writeFileSync(geoPath, `${JSON.stringify(geo)}\n`);
  console.log(`Wrote ${geoPath} (${features.length} wards)`);

  const nums = features.map((f) => Number(f.properties.Ward_No));
  console.log(
    `  ward numbers ${Math.min(...nums)}–${Math.max(...nums)} (${new Set(nums).size} unique)`,
  );

  return { config, features };
}

async function main() {
  const imported = [];
  for (const config of CITY_CONFIG) {
    imported.push(await importCity(config));
  }

  let sql = `-- Real ward boundaries from OpenCity.in (livingatlas.esri.in, 2024 delimitation).\n`;
  sql += `-- Regenerate: node scripts/import-opencity-ward-kml.mjs\n\n`;
  sql += `update public.cities set active = true where id in ('coimbatore', 'madurai');\n\n`;
  for (const { config, features } of imported) {
    sql += `-- ${config.name}\n${buildSql(config, features)}\n\n`;
  }

  const sqlPath = path.join(ROOT, "supabase", "013_seed_coimbatore_madurai_wards.sql");
  writeFileSync(sqlPath, sql);
  console.log(`Wrote ${sqlPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
