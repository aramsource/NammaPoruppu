"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_CITY } from "@/lib/cities";

type Point = { lat: number; lng: number };

function isWithinChennaiBounds(lat: number, lng: number): boolean {
  const [[swLat, swLng], [neLat, neLng]] = DEFAULT_CITY.bounds;
  return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
}

function MapTapHandler({ onPick }: { onPick: (point: Point) => void }) {
  useMapEvents({
    click: (e) => {
      if (!isWithinChennaiBounds(e.latlng.lat, e.latlng.lng)) return;
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapCenterOnPick({ point }: { point: Point | null }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (!point) return;
    map.setView([point.lat, point.lng], Math.max(map.getZoom(), 15), { animate: true });
  }, [map, point]);
  return null;
}

export function IssueLocationMap({
  mapPickPoint,
  onPick,
}: {
  mapPickPoint: Point | null;
  onPick: (point: Point) => void;
}) {
  return (
    <MapContainer
      center={mapPickPoint ? [mapPickPoint.lat, mapPickPoint.lng] : [13.0827, 80.2707]}
      zoom={13}
      style={{ height: 260, width: "100%" }}
      scrollWheelZoom
      zoomControl
      touchZoom
      doubleClickZoom
      boxZoom
      keyboard
      minZoom={DEFAULT_CITY.minZoom}
      maxZoom={18}
      maxBounds={DEFAULT_CITY.bounds}
      maxBoundsViscosity={1}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterOnPick point={mapPickPoint} />
      <MapTapHandler onPick={onPick} />
      {mapPickPoint && (
        <CircleMarker
          center={[mapPickPoint.lat, mapPickPoint.lng]}
          radius={8}
          pathOptions={{ color: "#F25C3B", fillColor: "#F25C3B", fillOpacity: 0.9 }}
        />
      )}
    </MapContainer>
  );
}
