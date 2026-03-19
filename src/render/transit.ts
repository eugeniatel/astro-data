// src/render/transit.ts
// Transit view renderer: transit aspect list with interpretations.
// Pure function: TransitData + ChartData in, formatted string out.

import type { ChartData } from '../engine/types';
import type { TransitData } from '../engine/transits';
import { getTransitText } from '../data/interpretations';
// Aspect type symbols (same as tables.ts)
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '\u260C',
  sextile: '\u26B9',
  square: '\u25A1',
  trine: '\u25B3',
  quincunx: '\u26BB',
  opposition: '\u260D',
};

// Render the transit header
export function renderTransitHeader(chartData: ChartData, transitData: TransitData): string {
  const lines: string[] = [];
  lines.push(`This is ${chartData.person.name} - Transits`);
  lines.push(`Date: ${transitData.date}`);
  return lines.join('\n');
}

// Render the transit aspect list with interpretations
export function renderTransitList(transitData: TransitData): string {
  const lines: string[] = [];
  lines.push('Active Transits');
  lines.push('');

  if (transitData.transitAspects.length === 0) {
    lines.push('  No active transit aspects for this date.');
    return lines.join('\n');
  }

  for (const a of transitData.transitAspects) {
    const sym = ASPECT_SYMBOLS[a.type] ?? ' ';
    const typeName = a.type.charAt(0).toUpperCase() + a.type.slice(1);
    lines.push(`  Transit ${a.planet1} ${sym} ${typeName} Natal ${a.planet2} (${a.orb.toFixed(1)} deg)`);

    // Add planet-pair specific interpretation
    const interp = getTransitText(a.planet1, a.planet2, a.type);
    lines.push(`    ${interp}`);
    lines.push('');
  }

  return lines.join('\n');
}

// Render transit planet positions summary
export function renderTransitPlanets(transitData: TransitData): string {
  const lines: string[] = [];
  lines.push('Current Planet Positions');
  lines.push('');

  const displayPlanets = transitData.transitPlanets.filter(p =>
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(p.planet),
  );

  for (const p of displayPlanets) {
    const retro = p.isRetrograde ? ' R' : '';
    lines.push(`  ${p.planet.padEnd(9)}  ${p.sign} ${Math.floor(p.signDegree)}'${retro}`);
  }

  return lines.join('\n');
}
