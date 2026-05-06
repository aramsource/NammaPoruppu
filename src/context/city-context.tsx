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
};

const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  setCity: () => {},
  locationState: "idle",
  detectLocation: () => {},
});

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City>(DEFAULT_CITY);
  const [locationState, setLocationState] = useState<LocationState>("idle");

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("np_city");
      if (saved) {
        const found = CITIES.find((c) => c.id === saved);
        if (found) setCityState(found);
      }
    } catch {}
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
    <CityContext.Provider value={{ city, setCity, locationState, detectLocation }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
