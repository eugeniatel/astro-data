---
phase: 01-ephemeris-engine
plan: 02
subsystem: types
tags: [typescript, types, contracts, astrology, swisseph]

# Dependency graph
requires:
  - phase: 01-01
    provides: Vite project scaffold, vitest config, tsconfig, package.json with all dependencies installed
provides:
  - src/engine/types.ts with all Phase 1 type contracts (Person, BirthData, GeocodingResult, PlanetPosition, HouseCusp, AspectType, Aspect, ChartData)
  - PLANET_IDS, DISPLAY_PLANETS, ZODIAC_SIGNS constants
  - ASPECT_ANGLES, BASE_ORBS, LUMINARY_BONUS constants
affects:
  - 01-03 (ephemeris.ts imports PlanetPosition, HouseCusp)
  - 01-04 (geocoding imports GeocodingResult)
  - 01-05 (aspects.ts imports Aspect, AspectType, BASE_ORBS, LUMINARY_BONUS)
  - 01-06 (persistence.ts imports Person)
  - All downstream phases 2-7 import ChartData from this file

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Single-file type exports: all engine types live in src/engine/types.ts, imported via named exports
    - IANA timezone over UTC offset: ianaTimezone string field on Person, never raw UTC offset
    - Luminary bonus pattern: LUMINARY_BONUS constant (2 degrees) applied to Sun/Moon aspects
    - Chiron/NorthNode calculated but not displayed: DISPLAY_PLANETS excludes them, PLANET_IDS includes them

key-files:
  created:
    - src/engine/types.ts
  modified: []

key-decisions:
  - "IANA timezone stored as string (e.g. America/New_York) on Person, not UTC offset -- correctly handles DST for all historical dates"
  - "highLatitudeWarning field on ChartData encodes Reykjavik/Placidus edge case in the contract itself"
  - "DISPLAY_PLANETS separates displayed planets (10) from calculated planets (12) -- Chiron/NorthNode available for future phases"
  - "Aspect orbs locked as constants (BASE_ORBS, LUMINARY_BONUS) -- not magic numbers scattered across aspects.ts"

patterns-established:
  - "Pattern: Single source of truth for types -- all downstream phases import from src/engine/types.ts, never redefine"
  - "Pattern: Constants co-located with types -- ASPECT_ANGLES and BASE_ORBS live next to AspectType so they cannot diverge"

requirements-completed: [CALC-01, CALC-07]

# Metrics
duration: 2min
completed: 2026-03-19
---

# Phase 01 Plan 02: Type Contracts Summary

TypeScript type contracts for the full Phase 1 calculation engine, including Person storage schema, ChartData output shape, and all aspect/planet/house types with locked orb constants.

## Performance

- Duration: 2 min
- Started: 2026-03-19T21:11:25Z
- Completed: 2026-03-19T21:13:00Z
- Tasks: 1
- Files modified: 1

## Accomplishments
- Created src/engine/types.ts with 16 exported symbols, TypeScript compiler exits 0
- Person interface stores ianaTimezone (not UTC offset), includes usageCount/lastUsed for Phase 4 frequency sorting
- ChartData interface is the serializable output contract: planets, houses, aspects, ascendant, midheaven, julianDay, highLatitudeWarning
- Aspect orb constants (BASE_ORBS, LUMINARY_BONUS) co-located with AspectType to prevent divergence

## Task Commits

Each task was committed atomically:

1. Task 1: Create src/engine/types.ts with all Phase 1 type contracts - `c15b970` (feat)

Plan metadata: `bb5e25d` (docs: complete type-contracts plan)

## Self-Check: PASSED

- FOUND: src/engine/types.ts
- FOUND: c15b970 (feat commit)
- FOUND: bb5e25d (docs metadata commit)

## Files Created/Modified
- `src/engine/types.ts` - Central type contracts for calculation engine and geocoding pipeline; 16 exported symbols

## Decisions Made
- IANA timezone stored as string on Person record rather than UTC offset. DST transitions make raw offsets wrong for half the year; IANA zone names encode full historical DST rules.
- highLatitudeWarning field placed directly on ChartData rather than as a separate error type. Callers must handle it explicitly at the type level.
- Constants (BASE_ORBS, ASPECT_ANGLES, LUMINARY_BONUS) placed in types.ts alongside their associated types. This prevents aspects.ts from diverging from the locked orb values in CONTEXT.md.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 1 modules (ephemeris.ts, aspects.ts, photon.ts, persistence.ts) can now import their needed types from src/engine/types.ts
- Plan 01-03 (ephemeris.ts WASM wrapper) can begin immediately
- Plan 01-04 (geocoding pipeline) can begin immediately
- Plans 01-05, 01-06 unblocked

---
*Phase: 01-ephemeris-engine*
*Completed: 2026-03-19*
