// src/render/tables.test.ts
// Tests for text panel renderers (Big Three, planet table, aspect table).
import { describe, it, expect, beforeAll } from 'vitest';
import { initEphemeris } from '../engine/ephemeris';
import { createPerson, calculateChart } from '../engine/chart';
import { renderBigThree, renderPlanetTable, renderAspectTable } from './tables';
import type { BirthData, GeocodingResult, ChartData } from '../engine/types';

let chart: ChartData;

beforeAll(async () => {
  await initEphemeris();
  const birth: BirthData = { date: '1879-03-14', time: '10:50', city: 'Ulm', country: 'Germany' };
  const geo: GeocodingResult = { lat: 48.4, lon: 9.98, ianaTimezone: 'UTC', city: 'Ulm', country: 'Germany' };
  const person = createPerson(birth, geo, 'Albert Einstein');
  chart = calculateChart(person);
});

describe('renderBigThree', () => {
  it('contains the person name', () => {
    const output = renderBigThree(chart);
    expect(output).toContain('Albert Einstein');
  });

  it('contains "This is" header', () => {
    const output = renderBigThree(chart);
    expect(output).toContain('This is');
  });

  it('shows Sun sign', () => {
    const output = renderBigThree(chart);
    expect(output).toContain('Sun');
    expect(output).toContain('Pisces');
  });

  it('shows Moon sign', () => {
    const output = renderBigThree(chart);
    expect(output).toContain('Moon');
    expect(output).toContain('Sagittarius');
  });

  it('shows ASC sign', () => {
    const output = renderBigThree(chart);
    expect(output).toContain('ASC');
    expect(output).toContain('Cancer');
  });
});

describe('renderPlanetTable', () => {
  it('contains header "Planets"', () => {
    const output = renderPlanetTable(chart);
    expect(output).toContain('Planets');
  });

  it('lists all 10 display planets', () => {
    const output = renderPlanetTable(chart);
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    for (const name of planetNames) {
      expect(output).toContain(name);
    }
  });

  it('shows house numbers', () => {
    const output = renderPlanetTable(chart);
    expect(output).toContain('House');
  });

  it('shows sign names', () => {
    const output = renderPlanetTable(chart);
    expect(output).toContain('Sign');
    expect(output).toContain('Pisces'); // Einstein Sun
  });
});

describe('renderAspectTable', () => {
  it('contains header "Aspects"', () => {
    const output = renderAspectTable(chart);
    expect(output).toContain('Aspects');
  });

  it('shows at least one aspect (Einstein chart has many)', () => {
    const output = renderAspectTable(chart);
    expect(output).toContain('deg');
  });

  it('shows planet names in aspects', () => {
    const output = renderAspectTable(chart);
    // Einstein chart should have aspects involving Sun and/or Moon
    const hasPlanet = output.includes('Sun') || output.includes('Moon') || output.includes('Mercury');
    expect(hasPlanet).toBe(true);
  });
});
