// @ts-nocheck
import { useState } from "react";
import Autocomplete from "react-google-autocomplete";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (lat: number | null, lng: number | null) => void;
}


export function LocationInput({
  value,
  onChange,
  onCoordinatesChange,
}: LocationInputProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
  
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }
  
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error("Please allow location access in your browser settings"));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error("Location information is unavailable"));
                break;
              case error.TIMEOUT:
                reject(new Error("Location request timed out"));
                break;
              default:
                reject(new Error("An unknown error occurred"));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
  
      const { latitude, longitude } = position.coords;
      onCoordinatesChange?.(latitude, longitude);
  
      // ✅ Reverse geocode using fetch and Google Maps Web API
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Store in .env
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
  
      const data = await response.json();
  
      if (data.status === "OK" && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        onChange(address); // 👈 Use address instead of lat/lng
      } else {
        console.warn("Reverse geocoding failed:", data.status);
        onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`); // fallback
      }
    } catch (error) {
      console.error("Location error:", error);
      setLocationError(
        error instanceof Error ? error.message : "Unable to get your location"
      );
    } finally {
      setIsGettingLocation(false);
    }
  };
  

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-400">Location</label>
      <div className="relative">
        <Autocomplete
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          onPlaceSelected={(place) => {
            const formatted = place.formatted_address;
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            if (formatted) onChange(formatted);
            if (lat && lng) onCoordinatesChange?.(lat, lng);
          }}
          options={{
            types: ["geocode"], // Only address results
            // Restrict to India (optional)
          }}
          defaultValue={value}
          placeholder="Enter location or use pin"
          className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 pl-4 pr-12 py-3.5
                     text-white transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        />

        {/* location button stays same */}
        <button
          type="button"
          onClick={getLocation}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5
                   rounded-lg bg-sky-500/10 text-sky-400 
                   hover:bg-sky-500/20 transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isGettingLocation}
          title="Get current location"
        >
          {isGettingLocation ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>
      {locationError && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          {/* warning icon */}
          {locationError}
        </p>
      )}
    </div>
  );
}
