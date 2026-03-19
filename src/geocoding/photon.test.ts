// src/geocoding/photon.test.ts
// Tests for Photon geocoder response parsing (CALC-02).
// Uses mocked fetch -- no live network calls.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geocodeCity } from './photon';

// Minimal GeoJSON FeatureCollection matching Photon API response shape
function makePhotonResponse(features: Array<{
  lon: number;
  lat: number;
  name?: string;
  country?: string;
  state?: string;
}>) {
  return {
    type: 'FeatureCollection',
    features: features.map((f) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [f.lon, f.lat], // GeoJSON: lon first, lat second
      },
      properties: {
        name: f.name,
        country: f.country,
        state: f.state,
      },
    })),
  };
}

describe('geocodeCity (Photon, mocked fetch)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns one PhotonFeature for a single-result response', async () => {
    const mockResponse = makePhotonResponse([
      { lon: -0.1278, lat: 51.5074, name: 'London', country: 'United Kingdom' },
    ]);

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await geocodeCity('London', 'United Kingdom');
    expect(results).toHaveLength(1);
    expect(results[0].lat).toBeCloseTo(51.5, 1);
    expect(results[0].lon).toBeCloseTo(-0.12, 1);
  });

  it('maps GeoJSON coordinates correctly (lon first, then lat)', async () => {
    const mockResponse = makePhotonResponse([
      { lon: 139.6917, lat: 35.6895, name: 'Tokyo', country: 'Japan' },
    ]);

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await geocodeCity('Tokyo', 'Japan');
    expect(results[0].lat).toBeCloseTo(35.69, 1);
    expect(results[0].lon).toBeCloseTo(139.69, 1);
  });

  it('returns city and country from properties', async () => {
    const mockResponse = makePhotonResponse([
      { lon: -0.1278, lat: 51.5074, name: 'London', country: 'United Kingdom' },
    ]);

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await geocodeCity('London', 'United Kingdom');
    expect(results[0].city).toBe('London');
    expect(results[0].country).toBe('United Kingdom');
  });

  it('returns empty array when features is empty', async () => {
    const mockResponse = makePhotonResponse([]);

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await geocodeCity('Nonexistent', 'Nowhere');
    expect(results).toHaveLength(0);
  });

  it('returns multiple features for a multi-result response', async () => {
    const mockResponse = makePhotonResponse([
      { lon: -0.1278, lat: 51.5074, name: 'London', country: 'United Kingdom' },
      { lon: -81.2453, lat: 42.9849, name: 'London', country: 'Canada' },
    ]);

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await geocodeCity('London', 'United Kingdom');
    expect(results).toHaveLength(2);
  });

  it('throws an error when HTTP status is not ok (e.g. 429)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    await expect(geocodeCity('London', 'United Kingdom')).rejects.toThrow('HTTP 429');
  });
});
