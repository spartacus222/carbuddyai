import { useState, useEffect } from "react";

const STORAGE_KEY = "carbuddy_location";

interface LocationState {
  label: string;
  city: string;
  region: string;
  country: string;
  lat?: number;
  lng?: number;
  detected: boolean;
  loading: boolean;
}

const DEFAULT_STATE: LocationState = {
  label: "",
  city: "",
  region: "",
  country: "",
  detected: false,
  loading: true,
};

export function useUserLocation() {
  const [location, setLocation] = useState<LocationState>(DEFAULT_STATE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation({ ...parsed, loading: false });
        return;
      } catch {}
    }

    // Detect from IP
    fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) })
      .then((r) => r.json())
      .then((data) => {
        const city = data.city || "";
        const region = data.region_code || data.region || "";
        const country = data.country_name || "";
        const label = region ? `${city}, ${region}` : city;
        const detected: LocationState = {
          label,
          city,
          region,
          country,
          lat: data.latitude,
          lng: data.longitude,
          detected: true,
          loading: false,
        };
        setLocation(detected);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(detected));
      })
      .catch(() => {
        const fallback: LocationState = {
          label: "San Francisco, CA",
          city: "San Francisco",
          region: "CA",
          country: "United States",
          detected: false,
          loading: false,
        };
        setLocation(fallback);
      });
  }, []);

  const updateLocation = (label: string) => {
    const parts = label.split(",").map((s) => s.trim());
    const updated: LocationState = {
      label,
      city: parts[0] ?? label,
      region: parts[1] ?? "",
      country: location.country,
      lat: undefined,
      lng: undefined,
      detected: false,
      loading: false,
    };
    setLocation(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { location, updateLocation };
}
