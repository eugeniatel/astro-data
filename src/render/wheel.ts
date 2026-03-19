// src/render/wheel.ts
// ASCII circular chart wheel renderer.
// Pure function: ChartData in, character grid out.
// Handles monospace aspect ratio compensation to produce a circle, not an oval.

import type { ChartData, PlanetPosition, HouseCusp } from '../engine/types';
import { DISPLAY_PLANETS, ZODIAC_SIGNS } from '../engine/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Grid dimensions (characters). Height ~41 rows, width ~81 cols.
// Width is doubled relative to height because monospace chars are ~2x taller than wide.
const GRID_ROWS = 41;
const GRID_COLS = 81;
const CENTER_ROW = Math.floor(GRID_ROWS / 2); // 20
const CENTER_COL = Math.floor(GRID_COLS / 2); // 40

// Radii in "row units" (vertical character units).
// The aspect ratio correction is applied when converting to column units.
const OUTER_RADIUS = 19;   // outer ring (zodiac)
const SIGN_RADIUS = 17;    // where sign abbreviations go
const PLANET_RADIUS = 14;  // where planet glyphs go
const INNER_RADIUS = 11;   // inner ring (houses)
const CUSP_LABEL_RADIUS = 9; // where house numbers go

// Monospace aspect ratio: chars are ~2x taller than wide.
// Multiply column offset by this to make circles round.
const ASPECT_RATIO = 2.0;

// Zodiac sign symbols + abbreviations
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

// Planet display symbols (Unicode where available, short ASCII labels)
const PLANET_GLYPHS: Record<string, string> = {
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

// Characters for drawing
const RING_CHAR = '\u00B7';  // · (middle dot for rings)
const EMPTY = ' ';

// ---------------------------------------------------------------------------
// Coordinate math
// ---------------------------------------------------------------------------

// Convert ecliptic longitude to screen angle.
// Screen angle: 0 = right (3 o'clock), increases counter-clockwise.
// Ascendant is placed at PI (9 o'clock), which is standard in astrology charts.
// Zodiac runs counter-clockwise on the wheel.
export function eclipticToScreenAngle(longitude: number, ascendant: number): number {
  // How far this longitude is from the ascendant, in degrees
  const offset = ascendant - longitude;
  // Convert to radians and shift so ASC is at PI (9 o'clock / left side)
  const angle = Math.PI + (offset * Math.PI) / 180;
  // Normalize to [0, 2*PI)
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

// Convert polar coordinates (angle, radius) to grid position (row, col).
// Applies aspect ratio correction on the horizontal axis.
export function polarToGrid(
  angle: number,
  radius: number,
): { row: number; col: number } {
  // Standard polar: x = r*cos(a), y = r*sin(a)
  // In our grid: row increases downward, col increases rightward
  // Angle 0 = right, PI/2 = up (but grid row 0 is top, so y is inverted)
  const col = CENTER_COL + Math.round(Math.cos(angle) * radius * ASPECT_RATIO);
  const row = CENTER_ROW - Math.round(Math.sin(angle) * radius);
  return { row, col };
}

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

function createGrid(): string[][] {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => EMPTY),
  );
}

function setChar(grid: string[][], row: number, col: number, ch: string): void {
  if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
    grid[row][col] = ch;
  }
}

function setString(grid: string[][], row: number, col: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    setChar(grid, row, col + i, str[i]);
  }
}

function isOccupied(grid: string[][], row: number, col: number): boolean {
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return true;
  return grid[row][col] !== EMPTY && grid[row][col] !== RING_CHAR;
}

// ---------------------------------------------------------------------------
// Drawing functions
// ---------------------------------------------------------------------------

function drawCircle(grid: string[][], radius: number, char: string): void {
  // Draw a circle by sampling angles densely
  const steps = Math.max(360, Math.round(radius * ASPECT_RATIO * 12));
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const { row, col } = polarToGrid(angle, radius);
    setChar(grid, row, col, char);
  }
}

function drawCuspLine(
  grid: string[][],
  angle: number,
  innerR: number,
  outerR: number,
  char: string = '\u2502', // │ (vertical box-drawing for visibility)
): void {
  // Draw a line from inner radius to outer radius at the given angle
  const steps = Math.round((outerR - innerR) * 3);
  for (let i = 0; i <= steps; i++) {
    const r = innerR + (outerR - innerR) * (i / steps);
    const { row, col } = polarToGrid(angle, r);
    if (!isOccupied(grid, row, col)) {
      setChar(grid, row, col, char);
    }
  }
}

function placeSignLabels(grid: string[][], ascendant: number): void {
  // Place zodiac symbol + abbreviation at the midpoint of each 30-degree segment
  for (let i = 0; i < 12; i++) {
    const signName = ZODIAC_SIGNS[i];
    const symbol = SIGN_SYMBOLS[signName];
    const abbrev = SIGN_ABBREV[signName];
    const label = `${symbol}${abbrev}`;
    // Midpoint of this sign: (i * 30) + 15 degrees ecliptic
    const midLongitude = i * 30 + 15;
    const angle = eclipticToScreenAngle(midLongitude, ascendant);
    const { row, col } = polarToGrid(angle, SIGN_RADIUS);
    // Center the 4-char label
    setString(grid, row, col - 2, label);
  }
}

function placeSignBoundaries(grid: string[][], ascendant: number): void {
  // Draw cusp lines at each 30-degree zodiac boundary
  for (let i = 0; i < 12; i++) {
    const boundaryLongitude = i * 30; // 0 Aries, 30 Taurus, etc.
    const angle = eclipticToScreenAngle(boundaryLongitude, ascendant);
    drawCuspLine(grid, angle, SIGN_RADIUS + 1, OUTER_RADIUS, RING_CHAR);
  }
}

function placeHouseCusps(
  grid: string[][],
  houses: HouseCusp[],
  ascendant: number,
): void {
  for (const cusp of houses) {
    const angle = eclipticToScreenAngle(cusp.longitude, ascendant);
    // Full radial line from center to outer ring (like image 9: pie-slice dividers)
    drawCuspLine(grid, angle, 2, OUTER_RADIUS, '\u00B7');
  }
}

function placeHouseNumbers(
  grid: string[][],
  houses: HouseCusp[],
  ascendant: number,
): void {
  for (const cusp of houses) {
    // Place house number at the midpoint between this cusp and the next
    const nextCusp = houses[cusp.house % 12]; // house numbers are 1-indexed
    let midLon = (cusp.longitude + nextCusp.longitude) / 2;
    // Handle wrap-around
    if (Math.abs(cusp.longitude - nextCusp.longitude) > 180) {
      midLon = (cusp.longitude + nextCusp.longitude + 360) / 2;
      if (midLon >= 360) midLon -= 360;
    }
    const angle = eclipticToScreenAngle(midLon, ascendant);
    const { row, col } = polarToGrid(angle, CUSP_LABEL_RADIUS);
    const label = cusp.house.toString();
    setString(grid, row, col - Math.floor(label.length / 2), label);
  }
}

function placePlanets(
  grid: string[][],
  planets: PlanetPosition[],
  ascendant: number,
): void {
  // Filter to display planets only
  const displayPlanets = planets.filter(p =>
    DISPLAY_PLANETS.includes(p.planet),
  );

  // Sort by longitude so we can detect collisions in order
  const sorted = [...displayPlanets].sort((a, b) => a.longitude - b.longitude);

  // Track placed positions for collision detection
  const placed: Array<{ row: number; col: number }> = [];

  for (const planet of sorted) {
    const angle = eclipticToScreenAngle(planet.longitude, ascendant);
    let radius = PLANET_RADIUS;
    let { row, col } = polarToGrid(angle, radius);
    const glyph = PLANET_GLYPHS[planet.planet] ?? planet.planet[0];

    // Simple collision resolution: if position is occupied, nudge inward
    let attempts = 0;
    while (
      attempts < 3 &&
      placed.some(p => Math.abs(p.row - row) <= 0 && Math.abs(p.col - col) <= 1)
    ) {
      radius -= 1.5;
      ({ row, col } = polarToGrid(angle, radius));
      attempts++;
    }

    setChar(grid, row, col, glyph);
    placed.push({ row, col });
  }
}

// ---------------------------------------------------------------------------
// Cross-hair axes (ASC-DSC and MC-IC lines)
// ---------------------------------------------------------------------------

function drawAxisLine(
  grid: string[][],
  angle: number,
  innerR: number,
  outerR: number,
  char: string,
): void {
  const steps = Math.round((outerR - innerR) * 2);
  for (let i = 0; i <= steps; i++) {
    const r = innerR + (outerR - innerR) * (i / steps);
    const { row, col } = polarToGrid(angle, r);
    if (!isOccupied(grid, row, col)) {
      setChar(grid, row, col, char);
    }
  }
}

function drawAxes(grid: string[][], ascendant: number, midheaven: number): void {
  // ASC-DSC axis (horizontal when ASC is at 9 o'clock)
  const ascAngle = eclipticToScreenAngle(ascendant, ascendant); // = PI
  const dscAngle = eclipticToScreenAngle((ascendant + 180) % 360, ascendant); // = 0

  drawAxisLine(grid, ascAngle, 0, INNER_RADIUS, '\u2500'); // ─
  drawAxisLine(grid, dscAngle, 0, INNER_RADIUS, '\u2500');

  // MC-IC axis
  const mcAngle = eclipticToScreenAngle(midheaven, ascendant);
  const icAngle = eclipticToScreenAngle((midheaven + 180) % 360, ascendant);

  drawAxisLine(grid, mcAngle, 0, INNER_RADIUS, '\u2502'); // │
  drawAxisLine(grid, icAngle, 0, INNER_RADIUS, '\u2502');

  // Label ASC and DSC (placed just inside the outer ring area)
  // ASC is at PI (left side), so place label to the left with safety margin
  setString(grid, CENTER_ROW, 0, 'ASC');

  // DSC is at 0 (right side)
  setString(grid, CENTER_ROW, GRID_COLS - 3, 'DSC');

  // Label MC and IC
  const mcPos = polarToGrid(mcAngle, OUTER_RADIUS + 1);
  if (mcPos.row >= 1) {
    setString(grid, mcPos.row - 1, mcPos.col - 1, 'MC');
  }

  const icPos = polarToGrid(icAngle, OUTER_RADIUS + 1);
  if (icPos.row < GRID_ROWS - 1) {
    setString(grid, icPos.row + 1, icPos.col - 1, 'IC');
  }
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

export function renderWheel(chartData: ChartData): string[][] {
  const grid = createGrid();
  const asc = chartData.ascendant;

  // 1. Draw outer ring (zodiac boundary)
  drawCircle(grid, OUTER_RADIUS, RING_CHAR);

  // 2. Draw inner ring (house boundary)
  drawCircle(grid, INNER_RADIUS, RING_CHAR);

  // 3. Draw zodiac sign boundary lines on outer ring
  placeSignBoundaries(grid, asc);

  // 4. Place zodiac sign abbreviations
  placeSignLabels(grid, asc);

  // 5. Draw ASC-DSC and MC-IC axes
  drawAxes(grid, asc, chartData.midheaven);

  // 6. Draw house cusp lines
  placeHouseCusps(grid, chartData.houses, asc);

  // 7. Place house numbers
  placeHouseNumbers(grid, chartData.houses, asc);

  // 8. Place planet glyphs
  placePlanets(grid, chartData.planets, asc);

  return grid;
}

// Convert a 2D character grid to a single string for display
export function gridToString(grid: string[][]): string {
  return grid.map(row => row.join('')).join('\n');
}
