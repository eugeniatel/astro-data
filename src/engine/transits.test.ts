// src/engine/transits.test.ts
// Tests for transit calculations.
import { describe, it, expect, beforeAll } from 'vitest';
import { initEphemeris } from './ephemeris';
import { createPerson, calculateChart } from './chart';
import { calcTransitPlanets, calcTransitAspects, calculateTransits } from './transits';
import type { BirthData, GeocodingResult, ChartData } from './types';

let natalChart: ChartData;

beforeAll(async () => {
  await initEphemeris();
  const birth: BirthData = { date: '1879-03-14', time: '10:50', city: 'Ulm', country: 'Germany' };
  const geo: GeocodingResult = { lat: 48.4, lon: 9.98, ianaTimezone: 'UTC', city: 'Ulm', country: 'Germany' };
  const person = createPerson(birth, geo, 'Albert Einstein');
  natalChart = calculateChart(person);
});

describe('calcTransitPlanets', () => {
  it('returns 12 planet positions for a given date', () => {
    const planets = calcTransitPlanets('2026-03-19');
    expect(planets).toHaveLength(12);
  });

  it('each planet has longitude between 0 and 360', () => {
    const planets = calcTransitPlanets('2026-03-19');
    for (const p of planets) {
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
    }
  });

  it('different dates produce different planet positions', () => {
    const today = calcTransitPlanets('2026-03-19');
    const future = calcTransitPlanets('2026-06-15');
    const sunToday = today.find(p => p.planet === 'Sun');
    const sunFuture = future.find(p => p.planet === 'Sun');
    expect(sunToday!.longitude).not.toBeCloseTo(sunFuture!.longitude, 0);
  });
});

describe('calcTransitAspects', () => {
  it('returns an array of aspects', () => {
    const transitPlanets = calcTransitPlanets('2026-03-19');
    const aspects = calcTransitAspects(transitPlanets, natalChart.planets);
    expect(Array.isArray(aspects)).toBe(true);
  });

  it('each aspect has planet1, planet2, type, angle, and orb', () => {
    const transitPlanets = calcTransitPlanets('2026-03-19');
    const aspects = calcTransitAspects(transitPlanets, natalChart.planets);
    if (aspects.length > 0) {
      const a = aspects[0];
      expect(a.planet1).toBeDefined();
      expect(a.planet2).toBeDefined();
      expect(a.type).toBeDefined();
      expect(typeof a.angle).toBe('number');
      expect(typeof a.orb).toBe('number');
    }
  });
});

describe('calculateTransits', () => {
  it('returns TransitData with date, transitPlanets, and transitAspects', () => {
    const result = calculateTransits('2026-03-19', natalChart);
    expect(result.date).toBe('2026-03-19');
    expect(result.transitPlanets).toHaveLength(12);
    expect(Array.isArray(result.transitAspects)).toBe(true);
  });

  it('works with different dates', () => {
    const r1 = calculateTransits('2026-01-01', natalChart);
    const r2 = calculateTransits('2026-12-31', natalChart);
    expect(r1.date).toBe('2026-01-01');
    expect(r2.date).toBe('2026-12-31');
  });
});
