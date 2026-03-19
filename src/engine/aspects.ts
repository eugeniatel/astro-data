// src/engine/aspects.ts
// Pure function aspect detection -- no WASM dependency.
// Called after calcPlanets() returns PlanetPosition[].
import type { Aspect, AspectType, PlanetName, PlanetPosition } from './types';
import { ASPECT_ANGLES, BASE_ORBS, LUMINARY_BONUS, DISPLAY_PLANETS } from './types';

const LUMINARIES = new Set<PlanetName>(['Sun', 'Moon']);

// Allowed orb for a given aspect type and pair of planets
export function getAspectOrb(
  aspectType: AspectType,
  planet1: PlanetName,
  planet2: PlanetName,
): number {
  const base = BASE_ORBS[aspectType];
  const bonus = (LUMINARIES.has(planet1) || LUMINARIES.has(planet2)) ? LUMINARY_BONUS : 0;
  return base + bonus;
}

// Angular difference between two ecliptic longitudes (0-180 range)
function angularDiff(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// Detect all aspects among DISPLAY_PLANETS in the provided planet list.
// Chiron and NorthNode are excluded from aspect checking in v1.
export function detectAspects(planets: Pick<PlanetPosition, 'planet' | 'longitude'>[]): Aspect[] {
  // Filter to display planets only
  const displayPlanets = planets.filter(p => DISPLAY_PLANETS.includes(p.planet as PlanetName));
  const aspects: Aspect[] = [];

  for (let i = 0; i < displayPlanets.length; i++) {
    for (let j = i + 1; j < displayPlanets.length; j++) {
      const p1 = displayPlanets[i];
      const p2 = displayPlanets[j];
      const diff = angularDiff(p1.longitude, p2.longitude);

      for (const [aspectType, idealAngle] of Object.entries(ASPECT_ANGLES) as [AspectType, number][]) {
        const orb = Math.abs(diff - idealAngle);
        const maxOrb = getAspectOrb(aspectType, p1.planet as PlanetName, p2.planet as PlanetName);

        if (orb <= maxOrb) {
          aspects.push({
            planet1: p1.planet as PlanetName,
            planet2: p2.planet as PlanetName,
            type: aspectType,
            angle: idealAngle,
            orb: Math.round(orb * 10) / 10, // round to 1 decimal place
          });
        }
      }
    }
  }

  return aspects;
}
