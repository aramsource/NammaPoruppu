"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { City, DEFAULT_CITY } from "@/lib/cities";
import { isWithinCityBounds } from "@/lib/ward-geo-client";

type Point = { lat: number; lng: number };

function MapTapHandler({ city, onPick }: { city: City; onPick: (point: Point) => void }) {
  useMapEvents({
    click: (e) => {
      if (!isWithinCityBounds(city, e.latlng.lat, e.latlng.lng)) return;
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
  city = DEFAULT_CITY,
  mapPickPoint,
  onPick,
}: {
  city?: City;
  mapPickPoint: Point | null;
  onPick: (point: Point) => void;
}) {
  return (
    <MapContainer
      center={mapPickPoint ? [mapPickPoint.lat, mapPickPoint.lng] : city.center}
      zoom={city.defaultZoom}
      style={{ height: 260, width: "100%" }}
      scrollWheelZoom
      zoomControl
      touchZoom
      doubleClickZoom
      boxZoom
      keyboard
      minZoom={city.minZoom}
      maxZoom={18}
      maxBounds={city.bounds}
      maxBoundsViscosity={1}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterOnPick point={mapPickPoint} />
      <MapTapHandler city={city} onPick={onPick} />
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
