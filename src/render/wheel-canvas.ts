// src/render/wheel-canvas.ts
// Canvas-based chart wheel renderer.
// Draws clean straight lines for house cusps and sign boundaries.

import type { ChartData } from '../engine/types';
import { DISPLAY_PLANETS, ZODIAC_SIGNS } from '../engine/types';

// Zodiac symbols
const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '\u2648', Taurus: '\u2649', Gemini: '\u264A', Cancer: '\u264B',
  Leo: '\u264C', Virgo: '\u264D', Libra: '\u264E', Scorpio: '\u264F',
  Sagittarius: '\u2650', Capricorn: '\u2651', Aquarius: '\u2652', Pisces: '\u2653',
};

const SIGN_ABBREV: Record<string, string> = {
  Aries: 'Ari', Taurus: 'Tau', Gemini: 'Gem', Cancer: 'Can',
  Leo: 'Leo', Virgo: 'Vir', Libra: 'Lib', Scorpio: 'Sco',
  Sagittarius: 'Sag', Capricorn: 'Cap', Aquarius: 'Aqu', Pisces: 'Pis',
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640',
  Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645',
  Neptune: '\u2646', Pluto: '\u2647',
};

// Convert ecliptic longitude to screen angle (ASC at 9 o'clock = PI)
function eclipticToAngle(longitude: number, ascendant: number): number {
  return Math.PI + ((ascendant - longitude) * Math.PI) / 180;
}

export function renderWheelCanvas(chartData: ChartData, size: number = 600): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const signR = size * 0.39;    // sign label radius
  const midR = size * 0.33;     // boundary between signs and houses
  const planetR = size * 0.27;  // planet glyph radius
  const innerR = size * 0.20;   // inner ring
  const houseNumR = size * 0.15; // house number radius

  const lineColor = 'rgba(255, 255, 255, 0.15)';
  const lineColorStrong = 'rgba(255, 255, 255, 0.3)';
  const textColor = 'rgba(255, 255, 255, 0.5)';
  const textColorBright = 'rgba(255, 255, 255, 0.75)';
  const asc = chartData.ascendant;

  // --- Draw outer circle ---
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- Draw middle circle (separates signs from houses) ---
  ctx.beginPath();
  ctx.arc(cx, cy, midR, 0, Math.PI * 2);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // --- Draw inner circle ---
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // --- Sign boundary lines (outer ring to mid ring) ---
  for (let i = 0; i < 12; i++) {
    const angle = eclipticToAngle(i * 30, asc);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * midR, cy - Math.sin(angle) * midR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy - Math.sin(angle) * outerR);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // --- Sign labels (symbol + abbrev) ---
  ctx.font = '12px "SF Mono", "Fira Code", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;

  for (let i = 0; i < 12; i++) {
    const signName = ZODIAC_SIGNS[i];
    const angle = eclipticToAngle(i * 30 + 15, asc);
    const x = cx + Math.cos(angle) * signR;
    const y = cy - Math.sin(angle) * signR;
    const label = `${SIGN_SYMBOLS[signName]}${SIGN_ABBREV[signName]}`;
    ctx.fillText(label, x, y);
  }

  // --- House cusp lines (center to mid ring) ---
  for (const cusp of chartData.houses) {
    const angle = eclipticToAngle(cusp.longitude, asc);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * midR, cy - Math.sin(angle) * midR);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // --- ASC-DSC axis (strong line) ---
  const ascAngle = eclipticToAngle(asc, asc); // = PI
  const dscAngle = eclipticToAngle((asc + 180) % 360, asc); // = 0

  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(ascAngle) * outerR, cy - Math.sin(ascAngle) * outerR);
  ctx.lineTo(cx + Math.cos(dscAngle) * outerR, cy - Math.sin(dscAngle) * outerR);
  ctx.strokeStyle = lineColorStrong;
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- MC-IC axis ---
  const mcAngle = eclipticToAngle(chartData.midheaven, asc);
  const icAngle = eclipticToAngle((chartData.midheaven + 180) % 360, asc);

  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(mcAngle) * outerR, cy - Math.sin(mcAngle) * outerR);
  ctx.lineTo(cx + Math.cos(icAngle) * outerR, cy - Math.sin(icAngle) * outerR);
  ctx.strokeStyle = lineColorStrong;
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- Axis labels ---
  ctx.font = '11px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = textColorBright;

  const labelOffset = outerR + 14;
  ctx.fillText('ASC', cx + Math.cos(ascAngle) * labelOffset, cy - Math.sin(ascAngle) * labelOffset);
  ctx.fillText('DSC', cx + Math.cos(dscAngle) * labelOffset, cy - Math.sin(dscAngle) * labelOffset);
  ctx.fillText('MC', cx + Math.cos(mcAngle) * labelOffset, cy - Math.sin(mcAngle) * labelOffset);
  ctx.fillText('IC', cx + Math.cos(icAngle) * labelOffset, cy - Math.sin(icAngle) * labelOffset);

  // --- House numbers ---
  ctx.font = '11px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = textColor;

  for (const cusp of chartData.houses) {
    const nextCusp = chartData.houses[cusp.house % 12];
    let midLon = (cusp.longitude + nextCusp.longitude) / 2;
    if (Math.abs(cusp.longitude - nextCusp.longitude) > 180) {
      midLon = (cusp.longitude + nextCusp.longitude + 360) / 2;
      if (midLon >= 360) midLon -= 360;
    }
    const angle = eclipticToAngle(midLon, asc);
    const x = cx + Math.cos(angle) * houseNumR;
    const y = cy - Math.sin(angle) * houseNumR;
    ctx.fillText(cusp.house.toString(), x, y);
  }

  // --- Planet glyphs ---
  const displayPlanets = chartData.planets.filter(p => DISPLAY_PLANETS.includes(p.planet));
  const sorted = [...displayPlanets].sort((a, b) => a.longitude - b.longitude);

  // Collision resolution: track placed angles
  const placedAngles: number[] = [];
  const MIN_ANGLE_GAP = 0.12; // radians

  ctx.font = '14px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = textColorBright;

  for (const planet of sorted) {
    let angle = eclipticToAngle(planet.longitude, asc);
    let r = planetR;

    // Nudge if too close to another planet
    for (const placed of placedAngles) {
      const diff = Math.abs(angle - placed);
      if (diff < MIN_ANGLE_GAP || (Math.PI * 2 - diff) < MIN_ANGLE_GAP) {
        r -= 14;
        break;
      }
    }
    placedAngles.push(angle);

    const glyph = PLANET_GLYPHS[planet.planet] ?? planet.planet[0];
    const x = cx + Math.cos(angle) * r;
    const y = cy - Math.sin(angle) * r;
    ctx.fillText(glyph, x, y);
  }

  return canvas;
}
