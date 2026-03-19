// src/engine/ephemeris.ts
import SwissEph from 'swisseph-wasm';
import { DateTime } from 'luxon';
import type {
  PlanetPosition, PlanetName, HouseCusp,
} from './types';
import {
  PLANET_IDS,
} from './types';
import { longitudeToSign } from './houses';

// ---------------------------------------------------------------------------
// WASM Singleton -- must be initialized before any calc_ut/houses calls
// ---------------------------------------------------------------------------
type SweInstance = InstanceType<typeof SwissEph>;
let sweInstance: SweInstance | null = null;
let initPromise: Promise<void> | null = null;

export async function initEphemeris(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    sweInstance = new SwissEph();
    await sweInstance.initSwissEph();
  })();
  return initPromise;
}

export function getSwe(): SweInstance {
  if (!sweInstance) {
    throw new Error('Ephemeris not initialized. Call initEphemeris() and await it before any calculations.');
  }
  return sweInstance;
}

// ---------------------------------------------------------------------------
// Julian Day conversion (birth datetime + IANA zone -> JD)
// ---------------------------------------------------------------------------
export function calcJulianDay(
  date: string,      // "YYYY-MM-DD"
  time: string,      // "HH:MM" -- use "12:00" if birth time unknown
  ianaZone: string,  // e.g. "America/New_York"
): number {
  const dt = DateTime.fromISO(`${date}T${time}`, { zone: ianaZone }).toUTC();
  const decimalHour = dt.hour + dt.minute / 60 + (dt.second ?? 0) / 3600;
  return getSwe().julday(dt.year, dt.month, dt.day, decimalHour);
}

// ---------------------------------------------------------------------------
// Planet positions
// ---------------------------------------------------------------------------
const SEFLG_SWIEPH = 2; // use Swiss Ephemeris data file

export function calcPlanets(jd: number): Omit<PlanetPosition, 'house'>[] {
  const swe = getSwe();
  const results: Omit<PlanetPosition, 'house'>[] = [];

  for (const [planetName, planetId] of Object.entries(PLANET_IDS) as [PlanetName, number][]) {
    const raw = swe.calc_ut(jd, planetId, SEFLG_SWIEPH);
    const longitude: number = raw[0];
    const speed: number = raw[3];
    const { sign, signDegree } = longitudeToSign(longitude);

    results.push({
      planet: planetName,
      longitude,
      sign,
      signDegree,
      isRetrograde: speed < 0,
      speed,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// House cusps (Placidus)
// ---------------------------------------------------------------------------
export interface HousesResult {
  cusps: HouseCusp[];
  ascendant: number;
  midheaven: number;
  highLatitudeWarning: boolean;
}

// swisseph-wasm type definitions declare houses() as returning number, but the
// actual JS implementation returns an object with cusps and ascmc arrays.
// This type assertion bridges the gap between incorrect library types and runtime reality.
interface HousesRawResult {
  cusps: number[];
  ascmc: number[];
  returnCode?: number;
}

export function calcHouses(jd: number, lat: number, lon: number): HousesResult {
  const swe = getSwe();
  const result = swe.houses(jd, lat, lon, 'P') as unknown as HousesRawResult;

  // Swiss Ephemeris returns ERR (-1) as return code when Placidus fails at high latitudes
  // The library still populates cusps/ascmc with Porphyry fallback values in this case.
  const returnCode = result.returnCode ?? 0;
  const highLatitudeWarning = returnCode === -1 || Math.abs(lat) > 63.5;

  const cusps: HouseCusp[] = [];
  for (let h = 1; h <= 12; h++) {
    const longitude: number = result.cusps[h];
    const { sign, signDegree } = longitudeToSign(longitude);
    cusps.push({ house: h, longitude, sign, signDegree });
  }

  return {
    cusps,
    ascendant: result.ascmc[0],
    midheaven: result.ascmc[1],
    highLatitudeWarning,
  };
}
