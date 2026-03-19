// src/render/tables.ts
// Text panel renderers for the natal chart screen.
// Pure functions: ChartData in, formatted string out.

import type { ChartData } from '../engine/types';
import { DISPLAY_PLANETS } from '../engine/types';
import { longitudeToSign } from '../engine/houses';

// Planet display symbols (matching wheel.ts)
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '\u2609',     // ☉
  Moon: '\u263D',    // ☽
  Mercury: '\u263F', // ☿
  Venus: '\u2640',   // ♀
  Mars: '\u2642',    // ♂
  Jupiter: '\u2643', // ♃
  Saturn: '\u2644',  // ♄
  Uranus: '\u2645',  // ♅
  Neptune: '\u2646', // ♆
  Pluto: '\u2647',   // ♇
};

// Aspect type symbols
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '\u260C',  // ☌
  sextile: '\u26B9',      // ⚹ (using alternative)
  square: '\u25A1',       // □
  trine: '\u25B3',        // △
  quincunx: '\u26BB',     // ⚻ (using alternative)
  opposition: '\u260D',   // ☍
};

// ---------------------------------------------------------------------------
// Big Three header: "This is [Name]" with Sun, Moon, Ascendant
// ---------------------------------------------------------------------------
export function renderBigThree(chartData: ChartData): string {
  const { person, planets, ascendant } = chartData;

  const sun = planets.find(p => p.planet === 'Sun');
  const moon = planets.find(p => p.planet === 'Moon');
  const { sign: ascSign, signDegree: ascDegree } = longitudeToSign(ascendant);

  const lines: string[] = [];
  lines.push(`This is ${person.name}`);
  lines.push('');
  if (sun) {
    lines.push(`  ${PLANET_SYMBOLS.Sun} Sun      ${sun.sign} ${formatDegree(sun.signDegree)}`);
  }
  if (moon) {
    lines.push(`  ${PLANET_SYMBOLS.Moon} Moon     ${moon.sign} ${formatDegree(moon.signDegree)}`);
  }
  lines.push(`  ASC        ${ascSign} ${formatDegree(ascDegree)}`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Planet positions table
// ---------------------------------------------------------------------------
export function renderPlanetTable(chartData: ChartData): string {
  const lines: string[] = [];
  lines.push('Planets');
  lines.push('');
  lines.push('  Sym  Planet     House  Sign          Deg');
  lines.push('  ---  ---------  -----  -----------  -----');

  const displayPlanets = chartData.planets.filter(p =>
    DISPLAY_PLANETS.includes(p.planet),
  );

  for (const p of displayPlanets) {
    const sym = PLANET_SYMBOLS[p.planet] ?? ' ';
    const retro = p.isRetrograde ? ' R' : '  ';
    lines.push(
      `  ${sym.padEnd(3)}  ${p.planet.padEnd(9)}  ${String(p.house).padStart(3)}    ${p.sign.padEnd(11)}  ${formatDegree(p.signDegree)}${retro}`,
    );
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Aspect table
// ---------------------------------------------------------------------------
export function renderAspectTable(chartData: ChartData): string {
  const lines: string[] = [];
  lines.push('Aspects');
  lines.push('');

  if (chartData.aspects.length === 0) {
    lines.push('  No aspects found.');
    return lines.join('\n');
  }

  lines.push('  Planet 1      Aspect       Planet 2      Orb');
  lines.push('  ---------  -----------  ---------  --------');

  for (const a of chartData.aspects) {
    const sym = ASPECT_SYMBOLS[a.type] ?? ' ';
    const typeName = a.type.charAt(0).toUpperCase() + a.type.slice(1);
    lines.push(
      `  ${a.planet1.padEnd(9)}  ${sym} ${typeName.padEnd(11)}  ${a.planet2.padEnd(9)}  ${a.orb.toFixed(1).padStart(5)} deg`,
    );
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDegree(deg: number): string {
  const whole = Math.floor(deg);
  const minutes = Math.round((deg - whole) * 60);
  return `${String(whole).padStart(2)}' ${String(minutes).padStart(2, '0')}"`;
}
