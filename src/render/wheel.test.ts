// src/render/wheel.test.ts
// Tests for ASCII wheel renderer coordinate math and structural output.
import { describe, it, expect, beforeAll } from 'vitest';
import { eclipticToScreenAngle, polarToGrid, renderWheel, gridToString } from './wheel';
import { initEphemeris } from '../engine/ephemeris';
import { createPerson, calculateChart } from '../engine/chart';
import type { BirthData, GeocodingResult } from '../engine/types';

// ---------------------------------------------------------------------------
// Coordinate math tests (no WASM needed)
// ---------------------------------------------------------------------------
describe('eclipticToScreenAngle', () => {
  it('ascendant maps to PI (9 o\'clock / left side)', () => {
    const angle = eclipticToScreenAngle(100, 100); // longitude == ascendant
    expect(angle).toBeCloseTo(Math.PI, 2);
  });

  it('descendant (ASC + 180) maps to 0 (3 o\'clock / right side)', () => {
    const angle = eclipticToScreenAngle(280, 100); // 100 + 180 = 280
    expect(angle).toBeCloseTo(0, 1);
  });

  it('MC (90 degrees ahead of ASC in ecliptic) maps to top area', () => {
    // If ASC is at 100, then 100 + 90 = 190 would be near the top
    // But MC isn't always 90 degrees from ASC. Test the math:
    // offset = 100 - 10 = 90 degrees ahead
    const angle = eclipticToScreenAngle(10, 100);
    // offset = 90 -> angle = PI + 90 * PI/180 = PI + PI/2 = 3PI/2 (top)
    expect(angle).toBeCloseTo(3 * Math.PI / 2, 1);
  });

  it('wraps correctly at 0/360 boundary', () => {
    const a1 = eclipticToScreenAngle(350, 10);
    const a2 = eclipticToScreenAngle(350 - 360, 10);
    // Both should produce the same result (modulo 2PI)
    const norm1 = ((a1 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const norm2 = ((a2 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    expect(norm1).toBeCloseTo(norm2, 2);
  });

  it('full circle: 360 degrees ahead maps back to same position', () => {
    const a1 = eclipticToScreenAngle(50, 100);
    const a2 = eclipticToScreenAngle(50 + 360, 100);
    const norm1 = ((a1 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const norm2 = ((a2 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    expect(norm1).toBeCloseTo(norm2, 2);
  });
});

describe('polarToGrid', () => {
  it('angle=0 (right/3 o\'clock) maps to right side of grid', () => {
    const { row, col } = polarToGrid(0, 10);
    expect(col).toBeGreaterThan(40); // right of center
    expect(row).toBe(20); // on the center row
  });

  it('angle=PI (left/9 o\'clock) maps to left side of grid', () => {
    const { row, col } = polarToGrid(Math.PI, 10);
    expect(col).toBeLessThan(40); // left of center
    expect(row).toBe(20); // on the center row
  });

  it('angle=PI/2 (top/12 o\'clock) maps to top of grid', () => {
    const { row, col } = polarToGrid(Math.PI / 2, 10);
    expect(row).toBeLessThan(20); // above center
    expect(col).toBe(40); // on the center column
  });

  it('angle=3PI/2 (bottom/6 o\'clock) maps to bottom of grid', () => {
    const { row, col } = polarToGrid(3 * Math.PI / 2, 10);
    expect(row).toBeGreaterThan(20); // below center
    expect(col).toBe(40); // on the center column
  });

  it('aspect ratio makes horizontal extent ~2x vertical extent', () => {
    const right = polarToGrid(0, 10);
    const top = polarToGrid(Math.PI / 2, 10);
    const horizontalExtent = right.col - 40; // distance from center
    const verticalExtent = 20 - top.row;     // distance from center
    // Horizontal should be roughly 2x vertical due to aspect ratio
    expect(horizontalExtent / verticalExtent).toBeCloseTo(2.0, 0);
  });
});

// ---------------------------------------------------------------------------
// Wheel rendering tests (require WASM for real chart data)
// ---------------------------------------------------------------------------
describe('renderWheel', () => {
  let einsteinGrid: string[][];
  let einsteinStr: string;

  beforeAll(async () => {
    await initEphemeris();
    const birth: BirthData = { date: '1879-03-14', time: '10:50', city: 'Ulm', country: 'Germany' };
    const geo: GeocodingResult = { lat: 48.4, lon: 9.98, ianaTimezone: 'UTC', city: 'Ulm', country: 'Germany' };
    const person = createPerson(birth, geo, 'Albert Einstein');
    const chart = calculateChart(person);
    einsteinGrid = renderWheel(chart);
    einsteinStr = gridToString(einsteinGrid);
  });

  it('returns a 2D grid of expected dimensions', () => {
    expect(einsteinGrid).toHaveLength(41); // GRID_ROWS
    expect(einsteinGrid[0]).toHaveLength(81); // GRID_COLS
  });

  it('grid contains zodiac sign abbreviations', () => {
    const abbrevs = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
    for (const abbrev of abbrevs) {
      expect(einsteinStr).toContain(abbrev);
    }
  });

  it('grid contains ASC and DSC labels', () => {
    expect(einsteinStr).toContain('ASC');
    expect(einsteinStr).toContain('DSC');
  });

  it('grid contains MC and IC labels', () => {
    expect(einsteinStr).toContain('MC');
    expect(einsteinStr).toContain('IC');
  });

  it('grid contains planet glyphs for display planets', () => {
    // Check that at least the Sun and Moon glyphs appear
    expect(einsteinStr).toContain('\u2609'); // ☉ Sun
    expect(einsteinStr).toContain('\u263D'); // ☽ Moon
  });

  it('grid contains house numbers (1-12)', () => {
    // Check for at least some house numbers
    for (let h = 1; h <= 9; h++) {
      expect(einsteinStr).toContain(h.toString());
    }
  });

  it('grid contains ring characters (middle dots)', () => {
    expect(einsteinStr).toContain('\u00B7'); // · middle dot
  });

  it('gridToString produces multiline output', () => {
    const lines = einsteinStr.split('\n');
    expect(lines).toHaveLength(41);
  });

  it('wheel has content in all four quadrants', () => {
    // Check that the grid has non-empty characters in all four corners area
    const topLeft = einsteinGrid.slice(0, 20).some(row =>
      row.slice(0, 40).some(ch => ch !== ' '),
    );
    const topRight = einsteinGrid.slice(0, 20).some(row =>
      row.slice(41).some(ch => ch !== ' '),
    );
    const bottomLeft = einsteinGrid.slice(21).some(row =>
      row.slice(0, 40).some(ch => ch !== ' '),
    );
    const bottomRight = einsteinGrid.slice(21).some(row =>
      row.slice(41).some(ch => ch !== ' '),
    );
    expect(topLeft).toBe(true);
    expect(topRight).toBe(true);
    expect(bottomLeft).toBe(true);
    expect(bottomRight).toBe(true);
  });
});
