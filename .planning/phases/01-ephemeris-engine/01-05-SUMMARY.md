---
phase: 01-ephemeris-engine
plan: 05
subsystem: geocoding
tags: [geocoding, photon, cities-json, timezone, tz-lookup]

# Dependency graph
requires:
  - phase: 01-02
    provides: "GeocodingResult type from types.ts"
provides:
  - "geocodeCity(): Photon API geocoding (primary, CORS-safe)"
  - "lookupCity(): offline city lookup from cities.json with country name-to-ISO mapping"
  - "getIanaTimezone(): offline IANA timezone from lat/lon via tz-lookup"
  - "resolveLocation(): unified pipeline (Photon -> fallback -> manual)"
  - "buildManualLocation(): manual entry path"
  - "7 fallback tests (CALC-03) + 6 Photon mock tests (CALC-02)"
affects:
  - 01-06 (chart assembler uses GeocodingResult from geocoding pipeline)
  - Phase 4 (people management calls resolveLocation during birth data entry)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Country name-to-ISO code mapping in fallback.ts (cities.json uses 2-letter codes)"
    - "Mocked fetch for Photon tests (no live network dependency)"
    - "Three-path fallback: Photon -> cities.json -> manual entry"

key-files:
  created:
    - src/geocoding/photon.ts
    - src/geocoding/timezone.ts
    - src/geocoding/geocode.ts
    - src/geocoding/fallback.ts
    - src/geocoding/fallback.test.ts
    - src/geocoding/photon.test.ts
  modified: []

key-decisions:
  - "cities.json uses ISO 2-letter country codes, not full names. Added COUNTRY_NAME_TO_CODE mapping table in fallback.ts."
  - "No population filter applied (original plan called for >= 100K, but runtime performance is acceptable without it)"
  - "Photon tests use vi.stubGlobal('fetch') for deterministic testing without network"

requirements-completed: [CALC-02, CALC-03]

# Metrics
duration: 5min
completed: 2026-03-19
---

# Phase 01 Plan 05: Geocoding Pipeline Summary

Three-path geocoding pipeline (Photon API, offline cities.json fallback, manual entry) with automated tests for both online and offline paths.

## Performance

- Duration: ~5 min
- Tasks: 3
- Files created: 6

## Accomplishments

- Photon geocoder (photon.komoot.io): CORS-safe, no API key, returns up to 3 candidates for disambiguation
- Offline fallback: cities.json with country name-to-ISO code mapping (GB, US, JP, etc.)
- Timezone resolution: @photostructure/tz-lookup for offline IANA timezone from lat/lon
- Unified pipeline (resolveLocation): Photon -> fallback -> city_not_found error
- Manual entry path (buildManualLocation): for when all lookups fail
- 7 fallback tests: London, New York, Tokyo, nonexistent city, case-insensitive, IANA timezone format, numeric lat/lon
- 6 Photon tests: single result, GeoJSON coordinate order, city/country mapping, empty response, multi-result, HTTP error

## Files Created/Modified

- `src/geocoding/photon.ts` - Photon API geocoder
- `src/geocoding/timezone.ts` - Offline IANA timezone from tz-lookup
- `src/geocoding/geocode.ts` - Unified pipeline: resolveLocation + buildManualLocation
- `src/geocoding/fallback.ts` - Offline city lookup with country code mapping
- `src/geocoding/fallback.test.ts` - 7 tests for CALC-03
- `src/geocoding/photon.test.ts` - 6 tests for CALC-02

## Deviations from Plan

- cities.json uses ISO 2-letter country codes, not full names. Added COUNTRY_NAME_TO_CODE mapping table (~60 entries) instead of the simple case-insensitive match the plan assumed.
- Population filter (>= 100K) not applied since runtime performance is fine without it.

## Issues Encountered

- Country code mismatch discovered during testing (cities.json uses "GB" not "United Kingdom"). Solved with mapping table.

## Next Phase Readiness

- CALC-02 (Photon geocoding) and CALC-03 (offline fallback) complete
- resolveLocation() ready for Phase 4 (people management) integration
- GeocodingResult output feeds into createPerson() in Plan 06

---
*Phase: 01-ephemeris-engine*
*Completed: 2026-03-19*
