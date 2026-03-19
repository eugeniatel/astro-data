// src/engine/chart.ts
// ChartData assembler -- wires ephemeris, houses, and aspects into one output.
// createPerson() converts raw user input into a Person record (CALC-01).
// calculateChart() is the single function downstream phases call for a complete chart.
import type { ChartData, Person, BirthData, GeocodingResult } from './types';
import { calcJulianDay, calcPlanets, calcHouses } from './ephemeris';
import { assignHouses } from './houses';
import { detectAspects } from './aspects';

// Convert raw birth data input + geocoding result into a stored Person record.
// CALC-01: This is the entry point that converts user-entered birth data into
// the canonical Person type used throughout the application.
export function createPerson(
  birthData: BirthData,
  geocodingResult: GeocodingResult,
  name?: string,
): Person {
  return {
    id: crypto.randomUUID(),
    name: name ?? geocodingResult.city, // caller should supply real name; city is fallback
    birthDate: birthData.date,
    birthTime: birthData.time,
    birthCity: geocodingResult.city,    // canonical name from geocoder
    birthCountry: geocodingResult.country,
    lat: geocodingResult.lat,
    lon: geocodingResult.lon,
    ianaTimezone: geocodingResult.ianaTimezone,
    usageCount: 0,
    lastUsed: 0,
  };
}

// Calculate a complete natal chart for a Person.
// Assumes initEphemeris() has been called and awaited before this function runs.
// If person.birthTime is null (unknown), uses "12:00" (noon) as default.
export function calculateChart(person: Person): ChartData {
  const birthTime = person.birthTime ?? '12:00';

  // 1. Convert birth datetime to Julian Day
  const julianDay = calcJulianDay(person.birthDate, birthTime, person.ianaTimezone);

  // 2. Calculate all planet positions (returns positions without house assignment)
  const rawPlanets = calcPlanets(julianDay);

  // 3. Calculate Placidus house cusps
  const housesResult = calcHouses(julianDay, person.lat, person.lon);

  // 4. Assign each planet to its house
  const planets = assignHouses(rawPlanets, housesResult.cusps);

  // 5. Detect aspects among the 10 display planets
  const aspects = detectAspects(planets);

  return {
    person,
    calculatedAt: new Date().toISOString(),
    julianDay,
    planets,
    houses: housesResult.cusps,
    aspects,
    ascendant: housesResult.ascendant,
    midheaven: housesResult.midheaven,
    highLatitudeWarning: housesResult.highLatitudeWarning,
  };
}

// Serialize ChartData to formatted JSON string (CALC-07: AI-readable output).
export function serializeChart(chartData: ChartData): string {
  return JSON.stringify(chartData, null, 2);
}
