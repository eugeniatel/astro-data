// src/geocoding/fallback.test.ts
import { describe, it, expect } from 'vitest';
import { lookupCity } from './fallback';

describe('lookupCity (offline fallback)', () => {
  it('returns result for London, United Kingdom', () => {
    const result = lookupCity('London', 'United Kingdom');
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(51.5, 0);
  });

  it('returns result for New York City, United States', () => {
    // Note: cities.json may use "New York City" or "New York" -- try both
    const result = lookupCity('New York City', 'United States') ??
                   lookupCity('New York', 'United States');
    expect(result).not.toBeNull();
    expect(result!.lon).toBeCloseTo(-74, 0);
  });

  it('returns result for Tokyo, Japan', () => {
    const result = lookupCity('Tokyo', 'Japan');
    expect(result).not.toBeNull();
  });

  it('returns null for a city that does not exist', () => {
    const result = lookupCity('xyznonexistent', 'Nowhere');
    expect(result).toBeNull();
  });

  it('case-insensitive: "london" matches "London"', () => {
    const result = lookupCity('london', 'united kingdom');
    expect(result).not.toBeNull();
  });

  it('returned result includes IANA timezone (not empty, not raw offset)', () => {
    const result = lookupCity('London', 'United Kingdom');
    expect(result).not.toBeNull();
    expect(result!.ianaTimezone).toBeTruthy();
    expect(result!.ianaTimezone).toContain('/'); // IANA names contain slash, e.g. "Europe/London"
  });

  it('returned result has numeric lat and lon', () => {
    const result = lookupCity('Tokyo', 'Japan');
    expect(result).not.toBeNull();
    expect(typeof result!.lat).toBe('number');
    expect(typeof result!.lon).toBe('number');
  });
});
