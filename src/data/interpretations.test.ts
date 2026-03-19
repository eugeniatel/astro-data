// src/data/interpretations.test.ts
// Tests for interpretation lookup functions.
import { describe, it, expect } from 'vitest';
import { getPlanetInSignText, getPlanetInHouseText, getAspectText } from './interpretations';
import { ZODIAC_SIGNS, DISPLAY_PLANETS } from '../engine/types';

describe('getPlanetInSignText', () => {
  it('returns text for Sun in Aries', () => {
    const text = getPlanetInSignText('Sun', 'Aries');
    expect(text).not.toBeNull();
    expect(text!.length).toBeGreaterThan(20);
  });

  it('returns text for all display planets in all signs', () => {
    for (const planet of DISPLAY_PLANETS) {
      for (const sign of ZODIAC_SIGNS) {
        const text = getPlanetInSignText(planet, sign);
        expect(text).not.toBeNull();
      }
    }
  });

  it('returns null for unknown planet', () => {
    expect(getPlanetInSignText('Asteroid', 'Aries')).toBeNull();
  });
});

describe('getPlanetInHouseText', () => {
  it('returns text for Sun in house 1', () => {
    const text = getPlanetInHouseText('Sun', 1);
    expect(text).not.toBeNull();
    expect(text!.length).toBeGreaterThan(20);
  });

  it('returns text for all display planets in all 12 houses', () => {
    for (const planet of DISPLAY_PLANETS) {
      for (let h = 1; h <= 12; h++) {
        const text = getPlanetInHouseText(planet, h);
        expect(text).not.toBeNull();
      }
    }
  });

  it('returns null for house 0', () => {
    expect(getPlanetInHouseText('Sun', 0)).toBeNull();
  });
});

describe('getAspectText', () => {
  it('returns text for conjunction', () => {
    const text = getAspectText('conjunction');
    expect(text).not.toBeNull();
  });

  it('returns text for all 6 aspect types', () => {
    const types = ['conjunction', 'sextile', 'square', 'trine', 'quincunx', 'opposition'];
    for (const type of types) {
      expect(getAspectText(type)).not.toBeNull();
    }
  });

  it('returns null for unknown aspect', () => {
    expect(getAspectText('semisextile')).toBeNull();
  });
});
