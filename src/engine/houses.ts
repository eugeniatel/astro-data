// src/engine/houses.ts
import type { PlanetPosition, HouseCusp, ZodiacSign } from './types';
import { ZODIAC_SIGNS } from './types';

// ---------------------------------------------------------------------------
// Degree-to-sign conversion (standard astrological convention)
// ---------------------------------------------------------------------------
export function longitudeToSign(longitude: number): { sign: ZodiacSign; signDegree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signDegree = normalized % 30;
  return { sign: ZODIAC_SIGNS[signIndex], signDegree };
}

// ---------------------------------------------------------------------------
// Planet-to-house assignment
// ---------------------------------------------------------------------------
export function assignHouses(
  planets: Omit<PlanetPosition, 'house'>[],
  cusps: HouseCusp[],
): PlanetPosition[] {
  return planets.map((planet) => {
    const house = findHouse(planet.longitude, cusps);
    return { ...planet, house };
  });
}

function findHouse(longitude: number, cusps: HouseCusp[]): number {
  const normalized = ((longitude % 360) + 360) % 360;

  for (let i = 0; i < 12; i++) {
    const cuspStart = cusps[i].longitude;
    const cuspEnd = cusps[(i + 1) % 12].longitude;

    if (cuspStart <= cuspEnd) {
      // No wrap-around: simple range check
      if (normalized >= cuspStart && normalized < cuspEnd) {
        return i + 1;
      }
    } else {
      // Wrap-around: range crosses 0 degrees (e.g. 350 -> 10)
      if (normalized >= cuspStart || normalized < cuspEnd) {
        return i + 1;
      }
    }
  }

  // Fallback: should not reach here with valid cusps
  return 1;
}
