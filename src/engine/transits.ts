// src/engine/transits.ts
// Transit calculation: current planet positions + aspects to natal chart.
// Assumes initEphemeris() has been called before any transit calculations.

import type { PlanetPosition, Aspect, ChartData, AspectType, PlanetName } from './types';
import { DISPLAY_PLANETS, ASPECT_ANGLES, BASE_ORBS, LUMINARY_BONUS } from './types';
import { calcJulianDay, calcPlanets } from './ephemeris';

export interface TransitData {
  date: string;           // "YYYY-MM-DD" of the transit
  transitPlanets: Omit<PlanetPosition, 'house'>[];  // current planet positions (no house assignment)
  transitAspects: Aspect[]; // aspects between transit planets and natal planets
}

// Calculate transit planet positions for a given date.
// Returns positions at noon UTC for the given date.
export function calcTransitPlanets(date: string): Omit<PlanetPosition, 'house'>[] {
  const jd = calcJulianDay(date, '12:00', 'UTC');
  return calcPlanets(jd);
}

// Find aspects between transit planets and natal planets.
// Only checks cross-chart pairs (transit planet vs natal planet).
export function calcTransitAspects(
  transitPlanets: Omit<PlanetPosition, 'house'>[],
  natalPlanets: PlanetPosition[],
): Aspect[] {
  return detectTransitNatalAspects(transitPlanets, natalPlanets);
}

// Detect aspects between transit and natal planet pairs only.
function detectTransitNatalAspects(
  transitPlanets: Omit<PlanetPosition, 'house'>[],
  natalPlanets: PlanetPosition[],
): Aspect[] {
  const LUMINARIES = new Set<PlanetName>(['Sun', 'Moon']);
  const aspects: Aspect[] = [];

  const transitDisplay = transitPlanets.filter(p => DISPLAY_PLANETS.includes(p.planet));
  const natalDisplay = natalPlanets.filter(p => DISPLAY_PLANETS.includes(p.planet));

  for (const tp of transitDisplay) {
    for (const np of natalDisplay) {
      let diff = Math.abs(tp.longitude - np.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const [aspectType, idealAngle] of Object.entries(ASPECT_ANGLES) as [AspectType, number][]) {
        const orb = Math.abs(diff - idealAngle);
        const base = BASE_ORBS[aspectType];
        const bonus = (LUMINARIES.has(tp.planet as PlanetName) || LUMINARIES.has(np.planet as PlanetName)) ? LUMINARY_BONUS : 0;
        const maxOrb = base + bonus;

        if (orb <= maxOrb) {
          aspects.push({
            planet1: tp.planet as PlanetName,
            planet2: np.planet as PlanetName,
            type: aspectType,
            angle: idealAngle,
            orb: Math.round(orb * 10) / 10,
          });
        }
      }
    }
  }

  return aspects;
}

// Full transit calculation for a given date against a natal chart.
export function calculateTransits(date: string, natalChart: ChartData): TransitData {
  const transitPlanets = calcTransitPlanets(date);
  const transitAspects = calcTransitAspects(transitPlanets, natalChart.planets);

  return {
    date,
    transitPlanets,
    transitAspects,
  };
}
