// src/render/transit.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { initEphemeris } from '../engine/ephemeris';
import { createPerson, calculateChart } from '../engine/chart';
import { calculateTransits } from '../engine/transits';
import { renderTransitHeader, renderTransitList, renderTransitPlanets } from './transit';
import type { BirthData, GeocodingResult, ChartData } from '../engine/types';
import type { TransitData } from '../engine/transits';

let chart: ChartData;
let transits: TransitData;

beforeAll(async () => {
  await initEphemeris();
  const birth: BirthData = { date: '1879-03-14', time: '10:50', city: 'Ulm', country: 'Germany' };
  const geo: GeocodingResult = { lat: 48.4, lon: 9.98, ianaTimezone: 'UTC', city: 'Ulm', country: 'Germany' };
  const person = createPerson(birth, geo, 'Albert Einstein');
  chart = calculateChart(person);
  transits = calculateTransits('2026-03-19', chart);
});

describe('renderTransitHeader', () => {
  it('shows person name with "Transits" suffix', () => {
    const output = renderTransitHeader(chart, transits);
    expect(output).toContain('Albert Einstein');
    expect(output).toContain('Transits');
  });

  it('shows the transit date', () => {
    const output = renderTransitHeader(chart, transits);
    expect(output).toContain('2026-03-19');
  });
});

describe('renderTransitList', () => {
  it('shows "Active Transits" header', () => {
    const output = renderTransitList(transits);
    expect(output).toContain('Active Transits');
  });

  it('shows aspect type names', () => {
    const output = renderTransitList(transits);
    // Should contain at least one aspect type keyword
    const hasAspect = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Quincunx', 'Opposition'].some(
      t => output.includes(t),
    );
    expect(hasAspect).toBe(true);
  });

  it('shows "Transit" and "Natal" labels', () => {
    const output = renderTransitList(transits);
    expect(output).toContain('Transit');
    expect(output).toContain('Natal');
  });
});

describe('renderTransitPlanets', () => {
  it('shows "Current Planet Positions" header', () => {
    const output = renderTransitPlanets(transits);
    expect(output).toContain('Current Planet Positions');
  });

  it('lists planet names', () => {
    const output = renderTransitPlanets(transits);
    expect(output).toContain('Sun');
    expect(output).toContain('Moon');
  });
});
