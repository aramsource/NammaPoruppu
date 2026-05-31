import { City } from "@/lib/cities";

export function wardGeoJsonPublicPath(cityId: string) {
  return `/data/${cityId}-wards.geojson`;
}

export function isWithinCityBounds(city: City, lat: number, lng: number) {
  const [[swLat, swLng], [neLat, neLng]] = city.bounds;
  return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
}

export function wardIdFromNumber(cityId: string, wardNumber: number) {
  if (cityId === "chennai") return `ward-${String(wardNumber).padStart(3, "0")}`;
  if (cityId === "coimbatore") return `cbe-${String(wardNumber).padStart(3, "0")}`;
  if (cityId === "madurai") return `mdr-${String(wardNumber).padStart(3, "0")}`;
  return `${cityId}-ward-${String(wardNumber).padStart(3, "0")}`;
}
