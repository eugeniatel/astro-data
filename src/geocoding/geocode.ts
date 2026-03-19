// src/geocoding/geocode.ts
// Unified geocoding pipeline: Photon -> fallback -> manual entry.
// All paths return GeocodingResult with IANA timezone (never UTC offset).
import type { GeocodingResult } from '../engine/types';
import { geocodeCity } from './photon';
import { lookupCity } from './fallback';
import { getIanaTimezone } from './timezone';

export type GeocodingError =
  | 'photon_unavailable'
  | 'city_not_found'
  | 'network_error';

export interface GeocodingResponse {
  result?: GeocodingResult;
  candidates?: GeocodingResult[]; // multiple matches for disambiguation
  error?: GeocodingError;
}

// Primary pipeline: try Photon, fall back to bundled database.
export async function resolveLocation(
  city: string,
  country: string,
): Promise<GeocodingResponse> {
  // Step 1: Try Photon (CORS-safe, online)
  try {
    const features = await geocodeCity(city, country);
    if (features.length === 1) {
      const f = features[0];
      const ianaTimezone = getIanaTimezone(f.lat, f.lon);
      return {
        result: { lat: f.lat, lon: f.lon, ianaTimezone, city: f.city, country: f.country },
      };
    }
    if (features.length > 1) {
      // Multiple candidates -- return all for disambiguation in UI
      const candidates = features.map((f) => ({
        lat: f.lat,
        lon: f.lon,
        ianaTimezone: getIanaTimezone(f.lat, f.lon),
        city: f.city,
        country: f.country,
      }));
      return { candidates };
    }
    // No results from Photon -- try bundled fallback
  } catch {
    // Photon unavailable -- try bundled fallback
  }

  // Step 2: Bundled offline fallback (cities.json, 100K+ population cities)
  const fallbackResult = lookupCity(city, country);
  if (fallbackResult) {
    return { result: fallbackResult };
  }

  // Step 3: City not found in any source -- caller must prompt for manual entry
  return { error: 'city_not_found' };
}

// Manual entry path -- user provides lat/lon/timezone directly.
// No geocoding API call. Used when city lookup fails.
export function buildManualLocation(
  lat: number,
  lon: number,
  ianaTimezone: string,
  city: string,
  country: string,
): GeocodingResult {
  return { lat, lon, ianaTimezone, city, country };
}
