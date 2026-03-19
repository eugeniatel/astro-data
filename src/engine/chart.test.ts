// src/engine/chart.test.ts
// Integration test: full calculation pipeline for CALC-01 (createPerson) and CALC-07 (ChartData JSON output).
// Uses Albert Einstein birth data as reference chart (astro.com verified).
import { describe, it, expect, beforeAll } from 'vitest';
import { initEphemeris } from './ephemeris';
import { createPerson, calculateChart, serializeChart } from './chart';
import { longitudeToSign } from './houses';
import type { BirthData, GeocodingResult, Person } from './types';

// Einstein birth data split across BirthData + GeocodingResult (as user would enter)
const EINSTEIN_BIRTH: BirthData = {
  date: '1879-03-14',
  time: '10:50', // converted from LMT to UTC: 11:30 LMT - 40min = 10:50 UTC
  city: 'Ulm',
  country: 'Germany',
};

const EINSTEIN_GEO: GeocodingResult = {
  lat: 48.4,
  lon: 9.98,
  ianaTimezone: 'UTC', // using UTC directly with manual offset applied
  city: 'Ulm',
  country: 'Germany',
};

describe('createPerson (CALC-01)', () => {
  it('returns a Person with birthDate from BirthData', () => {
    const person = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
    expect(person.birthDate).toBe('1879-03-14');
  });

  it('returns a Person with birthTime from BirthData', () => {
    const person = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
    expect(person.birthTime).toBe('10:50');
  });

  it('returns a Person with null birthTime when BirthData.time is null', () => {
    const nullTimeBirth: BirthData = { ...EINSTEIN_BIRTH, time: null };
    const person = createPerson(nullTimeBirth, EINSTEIN_GEO, 'Albert Einstein');
    expect(person.birthTime).toBeNull();
  });

  it('returns a Person with ianaTimezone from GeocodingResult', () => {
    const person = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
    expect(person.ianaTimezone).toBe('UTC');
  });

  it('returns a Person with lat/lon from GeocodingResult', () => {
    const person = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
    expect(person.lat).toBe(48.4);
    expect(person.lon).toBe(9.98);
  });

  it('returns a Person with usageCount=0 and lastUsed=0', () => {
    const person = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
    expect(person.usageCount).toBe(0);
    expect(person.lastUsed).toBe(0);
  });

  it('generates a non-empty id for each call', () => {
    const person = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
    expect(person.id).toBeTruthy();
    expect(typeof person.id).toBe('string');
  });

  it('uses geocodingResult.city as canonical birthCity', () => {
    const person = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
    expect(person.birthCity).toBe('Ulm');
  });
});

describe('calculateChart (integration)', () => {
  let einstein: Person;

  beforeAll(async () => {
    await initEphemeris();
    einstein = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
  });

  it('returns a ChartData object with all required fields', () => {
    const chart = calculateChart(einstein);
    expect(chart.person).toBeDefined();
    expect(chart.calculatedAt).toBeTruthy();
    expect(chart.julianDay).toBeGreaterThan(2400000);
    expect(chart.planets).toBeDefined();
    expect(chart.houses).toBeDefined();
    expect(chart.aspects).toBeDefined();
    expect(typeof chart.ascendant).toBe('number');
    expect(typeof chart.midheaven).toBe('number');
    expect(typeof chart.highLatitudeWarning).toBe('boolean');
  });

  it('planets array contains exactly 12 bodies', () => {
    const chart = calculateChart(einstein);
    expect(chart.planets).toHaveLength(12);
  });

  it('houses array contains exactly 12 cusps', () => {
    const chart = calculateChart(einstein);
    expect(chart.houses).toHaveLength(12);
    chart.houses.forEach((h, i) => {
      expect(h.house).toBe(i + 1);
    });
  });

  it('ascendant is a valid longitude (0-360)', () => {
    const chart = calculateChart(einstein);
    expect(chart.ascendant).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant).toBeLessThan(360);
  });

  it('midheaven is a valid longitude (0-360)', () => {
    const chart = calculateChart(einstein);
    expect(chart.midheaven).toBeGreaterThanOrEqual(0);
    expect(chart.midheaven).toBeLessThan(360);
  });

  it('Einstein Sun is in Pisces', () => {
    const chart = calculateChart(einstein);
    const sun = chart.planets.find(p => p.planet === 'Sun');
    expect(sun).toBeDefined();
    expect(sun!.sign).toBe('Pisces');
  });

  it('Einstein Moon is in Sagittarius', () => {
    const chart = calculateChart(einstein);
    const moon = chart.planets.find(p => p.planet === 'Moon');
    expect(moon).toBeDefined();
    expect(moon!.sign).toBe('Sagittarius');
  });

  it('Einstein Ascendant is in Cancer', () => {
    const chart = calculateChart(einstein);
    const { sign } = longitudeToSign(chart.ascendant);
    expect(sign).toBe('Cancer');
  });

  it('each planet has a house assignment (1-12)', () => {
    const chart = calculateChart(einstein);
    chart.planets.forEach((p) => {
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
    });
  });

  it('aspects is an array', () => {
    const chart = calculateChart(einstein);
    expect(Array.isArray(chart.aspects)).toBe(true);
  });

  it('calculatedAt is a valid ISO 8601 timestamp', () => {
    const chart = calculateChart(einstein);
    expect(() => new Date(chart.calculatedAt)).not.toThrow();
    expect(new Date(chart.calculatedAt).getTime()).toBeGreaterThan(0);
  });

  it('unknown birth time (null) does not throw', () => {
    const unknownTime: Person = { ...einstein, id: 'test-unknown', birthTime: null };
    expect(() => calculateChart(unknownTime)).not.toThrow();
  });

  it('unknown birth time produces valid chart with 12 planets', () => {
    const unknownTime: Person = { ...einstein, id: 'test-unknown-2', birthTime: null };
    const chart = calculateChart(unknownTime);
    expect(chart.planets).toHaveLength(12);
  });
});

describe('serializeChart (CALC-07)', () => {
  let einstein: Person;

  beforeAll(async () => {
    await initEphemeris();
    einstein = createPerson(EINSTEIN_BIRTH, EINSTEIN_GEO, 'Albert Einstein');
  });

  it('produces a valid JSON string', () => {
    const chart = calculateChart(einstein);
    const json = serializeChart(chart);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('JSON contains all required top-level keys', () => {
    const chart = calculateChart(einstein);
    const parsed = JSON.parse(serializeChart(chart));
    expect(parsed).toHaveProperty('person');
    expect(parsed).toHaveProperty('calculatedAt');
    expect(parsed).toHaveProperty('julianDay');
    expect(parsed).toHaveProperty('planets');
    expect(parsed).toHaveProperty('houses');
    expect(parsed).toHaveProperty('aspects');
    expect(parsed).toHaveProperty('ascendant');
    expect(parsed).toHaveProperty('midheaven');
    expect(parsed).toHaveProperty('highLatitudeWarning');
  });

  it('JSON planets array length is 12', () => {
    const chart = calculateChart(einstein);
    const parsed = JSON.parse(serializeChart(chart));
    expect(parsed.planets).toHaveLength(12);
  });

  it('JSON is pretty-printed (contains newlines)', () => {
    const chart = calculateChart(einstein);
    const json = serializeChart(chart);
    expect(json).toContain('\n');
  });
});
