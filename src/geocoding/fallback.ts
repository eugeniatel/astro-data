// src/geocoding/fallback.ts
// Offline city lookup from cities.json (GeoNames-based, CC-BY-3.0).
// Used when Photon API is unavailable or returns no results.
// Note: cities.json 1.1.50 uses ISO 2-letter country codes (GB, US, JP).
// This module accepts full country names and maps them to ISO codes for lookup.
import citiesRaw from 'cities.json';
import type { GeocodingResult } from '../engine/types';
import { getIanaTimezone } from './timezone';

interface CityRecord {
  name: string;
  country: string; // ISO 2-letter code (e.g. "GB", "US", "JP")
  lat: string | number;
  lng: string | number;
}

// Common country name to ISO 2-letter code mappings.
// Covers the most common cases for major city lookups.
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'afghanistan': 'AF',
  'albania': 'AL',
  'algeria': 'DZ',
  'argentina': 'AR',
  'australia': 'AU',
  'austria': 'AT',
  'bangladesh': 'BD',
  'belgium': 'BE',
  'brazil': 'BR',
  'canada': 'CA',
  'chile': 'CL',
  'china': 'CN',
  'colombia': 'CO',
  'croatia': 'HR',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'denmark': 'DK',
  'egypt': 'EG',
  'ethiopia': 'ET',
  'finland': 'FI',
  'france': 'FR',
  'germany': 'DE',
  'ghana': 'GH',
  'greece': 'GR',
  'hungary': 'HU',
  'india': 'IN',
  'indonesia': 'ID',
  'iran': 'IR',
  'iraq': 'IQ',
  'ireland': 'IE',
  'israel': 'IL',
  'italy': 'IT',
  'japan': 'JP',
  'jordan': 'JO',
  'kenya': 'KE',
  'malaysia': 'MY',
  'mexico': 'MX',
  'morocco': 'MA',
  'mozambique': 'MZ',
  'myanmar': 'MM',
  'netherlands': 'NL',
  'new zealand': 'NZ',
  'nigeria': 'NG',
  'norway': 'NO',
  'pakistan': 'PK',
  'peru': 'PE',
  'philippines': 'PH',
  'poland': 'PL',
  'portugal': 'PT',
  'romania': 'RO',
  'russia': 'RU',
  'russian federation': 'RU',
  'saudi arabia': 'SA',
  'south africa': 'ZA',
  'south korea': 'KR',
  'korea, republic of': 'KR',
  'spain': 'ES',
  'sri lanka': 'LK',
  'sweden': 'SE',
  'switzerland': 'CH',
  'taiwan': 'TW',
  'tanzania': 'TZ',
  'thailand': 'TH',
  'turkey': 'TR',
  'ukraine': 'UA',
  'united arab emirates': 'AE',
  'united kingdom': 'GB',
  'uk': 'GB',
  'great britain': 'GB',
  'england': 'GB',
  'united states': 'US',
  'united states of america': 'US',
  'usa': 'US',
  'uzbekistan': 'UZ',
  'venezuela': 'VE',
  'vietnam': 'VN',
  'yemen': 'YE',
};

// Cast the imported JSON to the expected type
const CITIES = citiesRaw as CityRecord[];

// Resolve a full country name to its ISO 2-letter code.
// Falls back to the input uppercased if not found (handles direct code input).
function resolveCountryCode(country: string): string {
  const lower = country.toLowerCase().trim();
  return COUNTRY_NAME_TO_CODE[lower] ?? country.toUpperCase().trim();
}

export function lookupCity(city: string, country: string): GeocodingResult | null {
  const cityLower = city.toLowerCase().trim();
  const countryCode = resolveCountryCode(country);

  const match = CITIES.find(
    (c) =>
      c.name.toLowerCase() === cityLower &&
      c.country.toUpperCase() === countryCode.toUpperCase(),
  );

  if (!match) return null;

  const lat = Number(match.lat);
  const lon = Number(match.lng);
  const ianaTimezone = getIanaTimezone(lat, lon);

  return {
    lat,
    lon,
    ianaTimezone,
    city: match.name,
    country: match.country,
  };
}
