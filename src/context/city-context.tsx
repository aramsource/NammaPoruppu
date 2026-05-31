"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  City,
  CITIES,
  DEFAULT_CITY,
  detectCityFromCoords,
} from "@/lib/cities";

type LocationState = "idle" | "detecting" | "done" | "error";

type CityContextValue = {
  city: City;
  setCity: (city: City) => void;
  locationState: LocationState;
  detectLocation: () => void;
  /** False until saved city is restored from localStorage. */
  cityReady: boolean;
};

const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  setCity: () => {},
  locationState: "idle",
  detectLocation: () => {},
  cityReady: false,
});

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City>(DEFAULT_CITY);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [cityReady, setCityReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("np_city");
      if (saved) {
        const found = CITIES.find((c) => c.id === saved);
        if (found) setCityState(found);
      }
    } catch {}
    setCityReady(true);
  }, []);

  const setCity = useCallback((next: City) => {
    setCityState(next);
    try {
      localStorage.setItem("np_city", next.id);
    } catch {}
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState("error");
      return;
    }
    setLocationState("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = detectCityFromCoords(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        setCity(detected);
        setLocationState("done");
      },
      () => setLocationState("error"),
      { timeout: 8000 },
    );
  }, [setCity]);

  return (
    <CityContext.Provider value={{ city, setCity, locationState, detectLocation, cityReady }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
