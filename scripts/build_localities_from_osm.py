#!/usr/bin/env python3
"""
Build Chennai locality -> ward mapping from OpenStreetMap (Overpass)
using existing ward polygons in public/data/chennai-wards.geojson.

Outputs:
  - supabase/localities_from_osm_raw.csv
  - supabase/localities_from_osm_deduped.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
DEFAULT_BBOX = (12.82, 80.08, 13.28, 80.42)  # south, west, north, east
PLACE_RANK = {"suburb": 0, "neighbourhood": 1, "quarter": 2, "village": 3, "hamlet": 4}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--geojson",
        default="public/data/chennai-wards.geojson",
        help="Path to ward GeoJSON",
    )
    parser.add_argument(
        "--raw-out",
        default="supabase/localities_from_osm_raw.csv",
        help="Raw CSV output path",
    )
    parser.add_argument(
        "--deduped-out",
        default="supabase/localities_from_osm_deduped.csv",
        help="Deduped CSV output path",
    )
    parser.add_argument("--city-id", default="chennai", help="City id value in output")
    return parser.parse_args()


def load_geojson(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def point_in_ring(lat: float, lng: float, ring: list[list[float]]) -> bool:
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]  # lng, lat
        xj, yj = ring[j][0], ring[j][1]
        intersects = (yi > lat) != (yj > lat) and (
            lng < ((xj - xi) * (lat - yi)) / ((yj - yi) if (yj - yi) != 0 else 1e-12) + xi
        )
        if intersects:
            inside = not inside
        j = i
    return inside


def point_in_polygon(lat: float, lng: float, polygon: list[list[list[float]]]) -> bool:
    if not polygon:
        return False
    outer = polygon[0]
    if not point_in_ring(lat, lng, outer):
        return False
    for hole in polygon[1:]:
        if point_in_ring(lat, lng, hole):
            return False
    return True


def point_in_feature(lat: float, lng: float, geometry: dict[str, Any]) -> bool:
    gtype = geometry.get("type")
    coords = geometry.get("coordinates", [])
    if gtype == "Polygon":
        return point_in_polygon(lat, lng, coords)
    if gtype == "MultiPolygon":
        return any(point_in_polygon(lat, lng, poly) for poly in coords)
    return False


def build_ward_features(geojson: dict[str, Any]) -> list[dict[str, Any]]:
    features = []
    for feat in geojson.get("features", []):
        props = feat.get("properties", {})
        ward_no = props.get("Ward_No")
        try:
            ward_number = int(ward_no)
        except Exception:
            continue
        if ward_number <= 0:
            continue
        zone_raw = str(props.get("Zone_Name") or "").strip()
        zone_name = "Zone " + " ".join(part.capitalize() for part in zone_raw.replace("_", " ").split())
        features.append(
            {
                "ward_number": ward_number,
                "ward_id": f"ward-{ward_number:03d}",
                "ward_name": f"Ward {ward_number}",
                "zone_name": zone_name,
                "geometry": feat.get("geometry", {}),
            }
        )
    return features


def fetch_overpass_localities() -> list[dict[str, Any]]:
    south, west, north, east = DEFAULT_BBOX
    bbox = f"{south},{west},{north},{east}"
    query = f"""
[out:json][timeout:120];
(
  node["place"~"suburb|neighbourhood|quarter|village|hamlet"]({bbox});
  way["place"~"suburb|neighbourhood|quarter|village|hamlet"]({bbox});
  relation["place"~"suburb|neighbourhood|quarter|village|hamlet"]({bbox});
);
out center tags;
"""
    payload = urllib.parse.urlencode({"data": query}).encode("utf-8")
    last_error: Exception | None = None
    for url in OVERPASS_URLS:
        try:
            req = urllib.request.Request(
                url,
                data=payload,
                method="POST",
                headers={
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Accept": "application/json",
                    "User-Agent": "NammaPoruppu-LocalityBuilder/1.0",
                },
            )
            with urllib.request.urlopen(req, timeout=180) as resp:
                body = resp.read().decode("utf-8")
            data = json.loads(body)
            return data.get("elements", [])
        except Exception as exc:
            last_error = exc
            continue
    raise RuntimeError(f"All Overpass endpoints failed: {last_error}")


def extract_name(tags: dict[str, Any]) -> str:
    for key in ("name:en", "name", "official_name", "alt_name"):
        value = tags.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def normalize_locality_name(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", name.lower())


def main() -> int:
    args = parse_args()
    geojson_path = Path(args.geojson)
    raw_out = Path(args.raw_out)
    deduped_out = Path(args.deduped_out)

    if not geojson_path.exists():
        print(f"GeoJSON not found: {geojson_path}", file=sys.stderr)
        return 1

    geojson = load_geojson(geojson_path)
    ward_features = build_ward_features(geojson)
    if not ward_features:
        print("No ward features parsed from GeoJSON.", file=sys.stderr)
        return 1

    try:
        osm_elements = fetch_overpass_localities()
    except Exception as exc:
        print(f"Failed to fetch OSM localities: {exc}", file=sys.stderr)
        return 1

    raw_rows: list[dict[str, Any]] = []
    for el in osm_elements:
        tags = el.get("tags", {})
        if not isinstance(tags, dict):
            continue
        locality_name = extract_name(tags)
        place_type = str(tags.get("place") or "").strip().lower()
        if not locality_name or place_type not in PLACE_RANK:
            continue

        lat = el.get("lat")
        lng = el.get("lon")
        if lat is None or lng is None:
            center = el.get("center", {})
            lat = center.get("lat")
            lng = center.get("lon")
        if lat is None or lng is None:
            continue

        matched = None
        for ward in ward_features:
            if point_in_feature(float(lat), float(lng), ward["geometry"]):
                matched = ward
                break
        if not matched:
            continue

        osm_type = str(el.get("type") or "")
        osm_id = str(el.get("id") or "")
        source_url = f"https://www.openstreetmap.org/{osm_type}/{osm_id}" if osm_type and osm_id else ""
        raw_rows.append(
            {
                "city_id": args.city_id,
                "ward_id": matched["ward_id"],
                "ward_number": matched["ward_number"],
                "ward_name": matched["ward_name"],
                "zone_name": matched["zone_name"],
                "locality_name": locality_name,
                "place_type": place_type,
                "osm_type": osm_type,
                "osm_id": osm_id,
                "lat": f"{float(lat):.7f}",
                "lng": f"{float(lng):.7f}",
                "source_name": "OpenStreetMap Overpass",
                "source_url": source_url,
                "is_verified": "false",
                "notes": "",
            }
        )

    raw_rows.sort(key=lambda r: (int(r["ward_number"]), r["locality_name"].lower(), PLACE_RANK.get(r["place_type"], 999)))

    raw_out.parent.mkdir(parents=True, exist_ok=True)
    with raw_out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "city_id",
                "ward_id",
                "ward_number",
                "ward_name",
                "zone_name",
                "locality_name",
                "place_type",
                "osm_type",
                "osm_id",
                "lat",
                "lng",
                "source_name",
                "source_url",
                "is_verified",
                "notes",
            ],
        )
        writer.writeheader()
        writer.writerows(raw_rows)

    deduped: dict[tuple[str, str], dict[str, Any]] = {}
    for row in raw_rows:
        key = (row["ward_id"], normalize_locality_name(row["locality_name"]))
        existing = deduped.get(key)
        if existing is None:
            deduped[key] = row
            continue
        if PLACE_RANK.get(row["place_type"], 999) < PLACE_RANK.get(existing["place_type"], 999):
            deduped[key] = row

    deduped_rows = sorted(deduped.values(), key=lambda r: (int(r["ward_number"]), r["locality_name"].lower()))
    with deduped_out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "city_id",
                "ward_id",
                "ward_number",
                "ward_name",
                "zone_name",
                "locality_name",
                "place_type",
                "osm_type",
                "osm_id",
                "lat",
                "lng",
                "source_name",
                "source_url",
                "is_verified",
                "notes",
            ],
        )
        writer.writeheader()
        writer.writerows(deduped_rows)

    print(f"Fetched OSM rows: {len(osm_elements)}")
    print(f"Ward-mapped raw localities: {len(raw_rows)} -> {raw_out}")
    print(f"Deduped localities: {len(deduped_rows)} -> {deduped_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
