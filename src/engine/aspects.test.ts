// src/engine/aspects.test.ts
import { describe, it, expect } from 'vitest';
import { detectAspects, getAspectOrb } from './aspects';

// Helper: create a minimal planet position for testing
function planet(name: string, longitude: number) {
  return { planet: name as any, longitude };
}

describe('getAspectOrb', () => {
  it('conjunction Sun-Moon = 8 (6 base + 2 luminary)', () => {
    expect(getAspectOrb('conjunction', 'Sun', 'Moon')).toBe(8);
  });

  it('conjunction Mercury-Venus = 6 (6 base, no bonus)', () => {
    expect(getAspectOrb('conjunction', 'Mercury', 'Venus')).toBe(6);
  });

  it('sextile Sun-Jupiter = 5 (3 base + 2 luminary)', () => {
    expect(getAspectOrb('sextile', 'Sun', 'Jupiter')).toBe(5);
  });

  it('trine Mars-Saturn = 5 (5 base, no bonus)', () => {
    expect(getAspectOrb('trine', 'Mars', 'Saturn')).toBe(5);
  });

  it('opposition Moon-Pluto = 8 (6 base + 2 luminary)', () => {
    expect(getAspectOrb('opposition', 'Moon', 'Pluto')).toBe(8);
  });

  it('quincunx Venus-Mars = 3 (3 base, no bonus)', () => {
    expect(getAspectOrb('quincunx', 'Venus', 'Mars')).toBe(3);
  });
});

describe('detectAspects', () => {
  it('empty input returns empty array', () => {
    expect(detectAspects([])).toEqual([]);
  });

  it('Sun opposition Moon exact (0 and 180)', () => {
    const aspects = detectAspects([planet('Sun', 0), planet('Moon', 180)]);
    expect(aspects).toHaveLength(1);
    expect(aspects[0].type).toBe('opposition');
    expect(aspects[0].orb).toBe(0);
  });

  it('Sun opposition Moon at 188 degrees -- orb=8, within luminary limit', () => {
    const aspects = detectAspects([planet('Sun', 0), planet('Moon', 188)]);
    const opp = aspects.find(a => a.type === 'opposition');
    expect(opp).toBeDefined();
    expect(opp!.orb).toBeCloseTo(8, 0);
  });

  it('Sun opposition Moon at 189 degrees -- outside luminary orb of 8, no aspect', () => {
    const aspects = detectAspects([planet('Sun', 0), planet('Moon', 189)]);
    expect(aspects.find(a => a.type === 'opposition')).toBeUndefined();
  });

  it('Mercury conjunction Venus at 6 degrees -- within non-luminary orb', () => {
    const aspects = detectAspects([planet('Mercury', 0), planet('Venus', 6)]);
    const conj = aspects.find(a => a.type === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj!.orb).toBeCloseTo(6, 0);
  });

  it('Mercury conjunction Venus at 7 degrees -- outside non-luminary orb, no aspect', () => {
    const aspects = detectAspects([planet('Mercury', 0), planet('Venus', 7)]);
    expect(aspects.find(a => a.type === 'conjunction')).toBeUndefined();
  });

  it('handles wrap-around: Sun at 350 and Moon at 10 = 20 degree conjunction -- no aspect since 20 > 8', () => {
    const aspects = detectAspects([planet('Sun', 350), planet('Moon', 10)]);
    // diff=20 (wrap-around handled correctly), 20 > luminary conjunction orb of 8
    const conj = aspects.find(a => a.type === 'conjunction');
    expect(conj).toBeUndefined();
  });

  it('handles wrap-around: Sun at 350 and Moon at 354 = 4 degree conjunction', () => {
    const aspects = detectAspects([planet('Sun', 350), planet('Moon', 354)]);
    const conj = aspects.find(a => a.type === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj!.orb).toBeCloseTo(4, 0);
  });

  it('Sun trine Jupiter (exact 120 degrees)', () => {
    const aspects = detectAspects([planet('Sun', 0), planet('Jupiter', 120)]);
    const trine = aspects.find(a => a.type === 'trine');
    expect(trine).toBeDefined();
    expect(trine!.orb).toBe(0);
  });

  it('Sun sextile Moon exact (60 degrees)', () => {
    const aspects = detectAspects([planet('Sun', 0), planet('Moon', 60)]);
    const sextile = aspects.find(a => a.type === 'sextile');
    expect(sextile).toBeDefined();
  });

  it('orb is included in each aspect as a positive number', () => {
    const aspects = detectAspects([planet('Sun', 0), planet('Moon', 178)]);
    expect(aspects.length).toBeGreaterThan(0);
    aspects.forEach(a => {
      expect(a.orb).toBeGreaterThanOrEqual(0);
      expect(typeof a.orb).toBe('number');
    });
  });

  it('Chiron is excluded from aspect detection', () => {
    const aspects = detectAspects([
      planet('Sun', 0),
      planet('Chiron', 0), // exact conjunction with Sun -- should be ignored
    ]);
    // Chiron is not in DISPLAY_PLANETS, so no aspects involving Chiron
    expect(aspects.every(a => a.planet1 !== 'Chiron' && a.planet2 !== 'Chiron')).toBe(true);
  });

  it('NorthNode is excluded from aspect detection', () => {
    const aspects = detectAspects([
      planet('Sun', 0),
      planet('NorthNode', 180), // exact opposition with Sun -- should be ignored
    ]);
    expect(aspects.every(a => a.planet1 !== 'NorthNode' && a.planet2 !== 'NorthNode')).toBe(true);
  });
});
