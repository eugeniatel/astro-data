// src/engine/types.ts
// Central type contracts for the Gachi Pachi calculation engine.
// All Phase 1 modules import from here. Downstream phases (2-7) consume ChartData.

// ---------------------------------------------------------------------------
// Person -- stored in localStorage, one record per saved person
// ---------------------------------------------------------------------------
export interface Person {
  id: string;           // uuid v4, generated at creation
  name: string;
  birthDate: string;    // "YYYY-MM-DD"
  birthTime: string | null;  // "HH:MM" -- null means unknown birth time
  birthCity: string;
  birthCountry: string;
  lat: number;
  lon: number;
  ianaTimezone: string; // e.g. "America/New_York" -- NEVER a raw UTC offset
  usageCount: number;   // incremented each time this person's chart is viewed
  lastUsed: number;     // Date.now() timestamp, for recency sorting
}

// Birth data input (before geocoding resolves lat/lon/timezone)
export interface BirthData {
  date: string;         // "YYYY-MM-DD"
  time: string | null;  // "HH:MM" or null
  city: string;
  country: string;
}

// ---------------------------------------------------------------------------
// Geocoding
// ---------------------------------------------------------------------------
export interface GeocodingResult {
  lat: number;
  lon: number;
  ianaTimezone: string;
  city: string;         // canonical city name from geocoder
  country: string;
}

// ---------------------------------------------------------------------------
// Planetary calculation output
// ---------------------------------------------------------------------------
export type PlanetName =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'
  | 'NorthNode' | 'Chiron';

export const PLANET_IDS: Record<PlanetName, number> = {
  Sun: 0,
  Moon: 1,
  Mercury: 2,
  Venus: 3,
  Mars: 4,
  Jupiter: 5,
  Saturn: 6,
  Uranus: 7,
  Neptune: 8,
  Pluto: 9,
  NorthNode: 11, // SE_TRUE_NODE
  Chiron: 15,    // SE_CHIRON
};

// The 10 planets displayed in v1 (Chiron and NorthNode calculated but not shown)
export const DISPLAY_PLANETS: PlanetName[] = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

export interface PlanetPosition {
  planet: PlanetName;
  longitude: number;    // 0-360 ecliptic degrees
  sign: ZodiacSign;
  signDegree: number;   // 0-29.99 degrees within the sign
  house: number;        // 1-12
  isRetrograde: boolean;
  speed: number;        // degrees/day; negative = retrograde
}

// ---------------------------------------------------------------------------
// House cusps
// ---------------------------------------------------------------------------
export interface HouseCusp {
  house: number;        // 1-12
  longitude: number;    // 0-360 ecliptic degrees
  sign: ZodiacSign;
  signDegree: number;
}

// ---------------------------------------------------------------------------
// Aspects
// ---------------------------------------------------------------------------
export type AspectType =
  | 'conjunction'   // 0 degrees, orb 6 (+2 luminary)
  | 'sextile'       // 60 degrees, orb 3 (+2 luminary)
  | 'square'        // 90 degrees, orb 5 (+2 luminary)
  | 'trine'         // 120 degrees, orb 5 (+2 luminary)
  | 'quincunx'      // 150 degrees, orb 3 (+2 luminary)
  | 'opposition';   // 180 degrees, orb 6 (+2 luminary)

export const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  quincunx: 150,
  opposition: 180,
};

export const BASE_ORBS: Record<AspectType, number> = {
  conjunction: 6,
  sextile: 3,
  square: 5,
  trine: 5,
  quincunx: 3,
  opposition: 6,
};

export const LUMINARY_BONUS = 2; // +2 degrees for aspects involving Sun or Moon

export interface Aspect {
  planet1: PlanetName;
  planet2: PlanetName;
  type: AspectType;
  angle: number;        // ideal angle (0, 60, 90, 120, 150, 180)
  orb: number;          // actual deviation from ideal angle (e.g. 2.3)
}

// ---------------------------------------------------------------------------
// Complete chart output (CALC-07)
// ---------------------------------------------------------------------------
export interface ChartData {
  person: Person;
  calculatedAt: string;       // ISO 8601 timestamp
  julianDay: number;          // Julian Day used for calculations
  planets: PlanetPosition[];  // all 12 bodies (incl. Chiron, NorthNode)
  houses: HouseCusp[];        // 12 house cusps (Placidus)
  aspects: Aspect[];          // all aspects between the 10 display planets
  ascendant: number;          // longitude of Ascendant
  midheaven: number;          // longitude of Midheaven (MC)
  highLatitudeWarning: boolean; // true if Placidus failed at high latitude
}
