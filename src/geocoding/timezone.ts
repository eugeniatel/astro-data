// src/geocoding/timezone.ts
// Offline IANA timezone resolution from lat/lon coordinates.
// Uses @photostructure/tz-lookup (72KB, CC0, browser-compatible).
// Never stores or returns raw UTC offsets -- always returns IANA zone names.
import tzlookup from '@photostructure/tz-lookup';

export function getIanaTimezone(lat: number, lon: number): string {
  return tzlookup(lat, lon);
}
