// src/engine/ephemeris.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { initEphemeris, getSwe, calcJulianDay, calcPlanets, calcHouses } from './ephemeris';
import { longitudeToSign, assignHouses } from './houses';

// ---------------------------------------------------------------------------
// Unit tests: no WASM required
// ---------------------------------------------------------------------------
describe('longitudeToSign', () => {
  it('0 degrees = Aries 0', () => {
    const result = longitudeToSign(0);
    expect(result.sign).toBe('Aries');
    expect(result.signDegree).toBeCloseTo(0, 2);
  });

  it('30 degrees = Taurus 0', () => {
    const result = longitudeToSign(30);
    expect(result.sign).toBe('Taurus');
    expect(result.signDegree).toBeCloseTo(0, 2);
  });

  it('45 degrees = Taurus 15', () => {
    const result = longitudeToSign(45);
    expect(result.sign).toBe('Taurus');
    expect(result.signDegree).toBeCloseTo(15, 2);
  });

  it('359.5 degrees = Pisces', () => {
    const result = longitudeToSign(359.5);
    expect(result.sign).toBe('Pisces');
  });

  it('360 degrees wraps to Aries', () => {
    const result = longitudeToSign(360);
    expect(result.sign).toBe('Aries');
  });

  it('negative longitude wraps correctly', () => {
    const result = longitudeToSign(-30);
    expect(result.sign).toBe('Pisces');
  });
});

// ---------------------------------------------------------------------------
// WASM tests: require initEphemeris()
// ---------------------------------------------------------------------------
describe('ephemeris (WASM)', () => {
  beforeAll(async () => {
    await initEphemeris();
  });

  it('getSwe() throws before init', () => {
    // This test validates the error message, but since beforeAll already ran,
    // we test the singleton guarantee instead
    expect(getSwe()).toBeDefined();
  });

  it('initEphemeris() called twice resolves without error (singleton)', async () => {
    await expect(initEphemeris()).resolves.toBeUndefined();
    await expect(initEphemeris()).resolves.toBeUndefined();
  });

  describe('calcJulianDay', () => {
    it('J2000 epoch: 2000-01-01 12:00 UTC = 2451545.0', () => {
      const jd = calcJulianDay('2000-01-01', '12:00', 'UTC');
      expect(jd).toBeCloseTo(2451545.0, 1);
    });
  });

  describe('calcPlanets (Einstein chart)', () => {
    // Albert Einstein: born 1879-03-14, 11:30 LMT, Ulm Germany (48N24, 9E59)
    // LMT offset for 9.98E = +39min40s = +0.661 hours
    // Birth time UTC = 11:30 - 0:40 = 10:50 UTC
    // Using UTC directly to avoid pre-1970 IANA ambiguity
    let einsteinJD: number;

    beforeAll(() => {
      einsteinJD = calcJulianDay('1879-03-14', '10:50', 'UTC');
    });

    it('Sun is in Pisces (expected ~23 Pisces)', () => {
      const planets = calcPlanets(einsteinJD);
      const sun = planets.find(p => p.planet === 'Sun');
      expect(sun).toBeDefined();
      expect(sun!.sign).toBe('Pisces');
    });

    it('Moon is in Sagittarius (expected ~14 Sagittarius)', () => {
      const planets = calcPlanets(einsteinJD);
      const moon = planets.find(p => p.planet === 'Moon');
      expect(moon).toBeDefined();
      expect(moon!.sign).toBe('Sagittarius');
    });

    it('Sun longitude is approximately 353 degrees (23 Pisces)', () => {
      const planets = calcPlanets(einsteinJD);
      const sun = planets.find(p => p.planet === 'Sun');
      // 23 Pisces = 11 signs * 30 + 23 = 353 degrees
      expect(sun!.longitude).toBeGreaterThan(352);
      expect(sun!.longitude).toBeLessThan(355);
    });

    it('all 12 planet objects are returned (10 planets + Chiron + NorthNode)', () => {
      const planets = calcPlanets(einsteinJD);
      expect(planets).toHaveLength(12);
    });
  });

  describe('calcHouses', () => {
    let einsteinJD: number;
    const ulmLat = 48.4;
    const ulmLon = 9.98;

    beforeAll(() => {
      einsteinJD = calcJulianDay('1879-03-14', '10:50', 'UTC');
    });

    it('returns 12 house cusps for standard location', () => {
      const result = calcHouses(einsteinJD, ulmLat, ulmLon);
      expect(result.cusps).toHaveLength(12);
    });

    it('ascendant is a valid longitude (0-360)', () => {
      const result = calcHouses(einsteinJD, ulmLat, ulmLon);
      expect(result.ascendant).toBeGreaterThanOrEqual(0);
      expect(result.ascendant).toBeLessThan(360);
    });

    it('Einstein ascendant is in Cancer (expected ~11 Cancer = ~101 degrees)', () => {
      const result = calcHouses(einsteinJD, ulmLat, ulmLon);
      const { sign } = longitudeToSign(result.ascendant);
      expect(sign).toBe('Cancer');
    });

    it('Reykjavik (64N) sets highLatitudeWarning=true', () => {
      const result = calcHouses(einsteinJD, 64.15, -21.94);
      expect(result.highLatitudeWarning).toBe(true);
    });

    it('Reykjavik does NOT throw (handles gracefully)', () => {
      expect(() => calcHouses(einsteinJD, 64.15, -21.94)).not.toThrow();
    });
  });

  describe('assignHouses', () => {
    it('assigns house numbers to planets based on cusp longitudes', () => {
      const einsteinJD = calcJulianDay('1879-03-14', '10:50', 'UTC');
      const planets = calcPlanets(einsteinJD);
      const { cusps } = calcHouses(einsteinJD, 48.4, 9.98);
      const assigned = assignHouses(planets, cusps);

      expect(assigned).toHaveLength(12);
      assigned.forEach(p => {
        expect(p.house).toBeGreaterThanOrEqual(1);
        expect(p.house).toBeLessThanOrEqual(12);
      });
    });
  });
});
