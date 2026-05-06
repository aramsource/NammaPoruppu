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
    active: false,
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
    active: false,
  },
];

export const DEFAULT_CITY = CITIES[0]; // Chennai

/** Find a city by approximate lat/lng */
export function detectCityFromCoords(lat: number, lng: number): City {
  const match = CITIES.find(
    (c) =>
      lat >= c.bounds[0][0] &&
      lat <= c.bounds[1][0] &&
      lng >= c.bounds[0][1] &&
      lng <= c.bounds[1][1],
  );
  return match ?? DEFAULT_CITY;
}
