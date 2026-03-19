// src/render/layout.test.ts
// Tests for split-panel layout compositor.
import { describe, it, expect, beforeAll } from 'vitest';
import { initEphemeris } from '../engine/ephemeris';
import { createPerson, calculateChart } from '../engine/chart';
import { renderNatalChart } from './layout';
import type { BirthData, GeocodingResult, ChartData } from '../engine/types';

let chart: ChartData;

beforeAll(async () => {
  await initEphemeris();
  const birth: BirthData = { date: '1879-03-14', time: '10:50', city: 'Ulm', country: 'Germany' };
  const geo: GeocodingResult = { lat: 48.4, lon: 9.98, ianaTimezone: 'UTC', city: 'Ulm', country: 'Germany' };
  const person = createPerson(birth, geo, 'Albert Einstein');
  chart = calculateChart(person);
});

describe('renderNatalChart (split layout)', () => {
  it('contains wheel elements (zodiac abbreviations)', () => {
    const output = renderNatalChart(chart);
    expect(output).toContain('Ari');
    expect(output).toContain('Lib');
  });

  it('contains Big Three header', () => {
    const output = renderNatalChart(chart);
    expect(output).toContain('This is Albert Einstein');
  });

  it('contains planet table', () => {
    const output = renderNatalChart(chart);
    expect(output).toContain('Planets');
    expect(output).toContain('Pisces');
  });

  it('contains aspect table', () => {
    const output = renderNatalChart(chart);
    expect(output).toContain('Aspects');
  });

  it('has at least 41 lines (wheel height)', () => {
    const output = renderNatalChart(chart);
    const lines = output.split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(41);
  });

  it('lines are wider than the wheel alone (side panel added)', () => {
    const output = renderNatalChart(chart);
    const lines = output.split('\n');
    // Wheel is 81 chars wide, with right panel it should be wider
    const maxWidth = Math.max(...lines.map(l => l.length));
    expect(maxWidth).toBeGreaterThan(81);
  });
});
