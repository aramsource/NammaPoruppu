export type City = {
  id: string;
  name: string;
  state: string;
  /** Map center [lat, lng] */
  center: [number, number];
  /** SW and NE corners for maxBounds */
  bounds: [[number, number], [number, number]];
  defaultZoom: number;
  minZoom: number;
  active: boolean;
};

export const CITIES: City[] = [
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    center: [13.0475, 80.2272],
    bounds: [
      [12.82, 80.08],
      [13.28, 80.42],
    ],
    defaultZoom: 12,
    minZoom: 11,
    active: true,
  },
  {
    id: "coimbatore",
    name: "Coimbatore",
    state: "Tamil Nadu",
    center: [11.0168, 76.9558],
    bounds: [
      [10.85, 76.80],
      [11.18, 77.12],
    ],
    defaultZoom: 12,
    minZoom: 11,
    active: true,
  },
  {
    id: "madurai",
    name: "Madurai",
    state: "Tamil Nadu",
    center: [9.9252, 78.1198],
    bounds: [
      [9.78, 77.98],
      [10.07, 78.28],
    ],
    defaultZoom: 13,
    minZoom: 12,
    active: true,
  },
];

export const DEFAULT_CITY = CITIES[0]; // Chennai

export function getCityById(id: string): City {
  return CITIES.find((c) => c.id === id) ?? DEFAULT_CITY;
}

export const ACTIVE_CITIES = CITIES.filter((c) => c.active);

function isWithinBounds(city: City, lat: number, lng: number) {
  const [[swLat, swLng], [neLat, neLng]] = city.bounds;
  return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
}

function bboxArea(city: City) {
  const [[swLat, swLng], [neLat, neLng]] = city.bounds;
  return (neLat - swLat) * (neLng - swLng);
}

/** Find a city by approximate lat/lng (smallest matching bbox wins). */
export function detectCityFromCoords(lat: number, lng: number): City {
  const matches = CITIES.filter((c) => isWithinBounds(c, lat, lng)).sort(
    (a, b) => bboxArea(a) - bboxArea(b),
  );
  return matches[0] ?? DEFAULT_CITY;
}
