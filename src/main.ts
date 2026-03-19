// src/main.ts
// Gachi Pachi -- Natal Chart Tool
// Phase 1 integration: WASM init + chart calculation
// In subsequent phases, this will mount the UI.

import { initEphemeris } from './engine/ephemeris';
import { createPerson, calculateChart, serializeChart } from './engine/chart';
import type { BirthData, GeocodingResult } from './engine/types';

async function main() {
  console.log('Gachi Pachi: initializing ephemeris...');

  // WASM must be awaited before any calc calls
  await initEphemeris();
  console.log('Ephemeris ready.');

  // Phase 1 smoke test: build Einstein Person and calculate chart
  const birthData: BirthData = {
    date: '1879-03-14',
    time: '10:50',
    city: 'Ulm',
    country: 'Germany',
  };

  // In the real app, geocodingResult comes from resolveLocation() in Plan 05.
  // Using hardcoded values here for the smoke test.
  const geoResult: GeocodingResult = {
    lat: 48.4,
    lon: 9.98,
    ianaTimezone: 'UTC',
    city: 'Ulm',
    country: 'Germany',
  };

  const einstein = createPerson(birthData, geoResult, 'Albert Einstein');
  const chart = calculateChart(einstein);
  const sun = chart.planets.find(p => p.planet === 'Sun');
  console.log(`Einstein Sun: ${sun?.sign} ${sun?.signDegree.toFixed(1)} degrees`);
  console.log(`Einstein Ascendant longitude: ${chart.ascendant.toFixed(2)}`);
  console.log('Full chart JSON:', serializeChart(chart));
}

main().catch(console.error);
