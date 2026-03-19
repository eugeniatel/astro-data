---
phase: 1
slug: ephemeris-engine
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-19
---

# Phase 1 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | vitest |
| Config file | vitest.config.ts (created in Plan 01-01, Task 2) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |
| Estimated runtime | ~5 seconds |

---

## Sampling Rate

- After every task commit: Run `npx vitest run --reporter=verbose`
- After every plan wave: Run `npx vitest run --reporter=verbose`
- Before `/gsd:verify-work`: Full suite must be green
- Max feedback latency: 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01-01 | 1 | CALC-04 | install check | `cd /Users/euge/gachi-pachi && npm list swisseph-wasm @photostructure/tz-lookup luxon cities.json vitest 2>&1` | package.json | pending |
| 01-01-T2 | 01-01 | 1 | CALC-04 | runner check | `cd /Users/euge/gachi-pachi && npx vitest run --reporter=verbose 2>&1 | grep -E "(No test files|passed|failed|PASS|FAIL|RUN)" | head -5` | vite.config.ts, vitest.config.ts | pending |
| 01-02-T1 | 01-02 | 2 | CALC-01, CALC-07 | tsc | `cd /Users/euge/gachi-pachi && npx tsc --noEmit --skipLibCheck 2>&1 | head -20` | src/engine/types.ts | pending |
| 01-03-T1 | 01-03 | 3 | CALC-04, CALC-05 | tsc | `cd /Users/euge/gachi-pachi && npx tsc --noEmit --skipLibCheck 2>&1 | head -20` | src/engine/ephemeris.ts, src/engine/houses.ts | pending |
| 01-03-T2 | 01-03 | 3 | CALC-04, CALC-05 | vitest | `cd /Users/euge/gachi-pachi && npx vitest run src/engine/ephemeris.test.ts --reporter=verbose 2>&1 | tail -20` | src/engine/ephemeris.test.ts | pending |
| 01-04-T1 | 01-04 | 3 | CALC-06 | vitest | `cd /Users/euge/gachi-pachi && npx vitest run src/engine/aspects.test.ts --reporter=verbose 2>&1 | tail -25` | src/engine/aspects.ts, src/engine/aspects.test.ts | pending |
| 01-05-T1 | 01-05 | 3 | CALC-02, CALC-03 | tsc | `cd /Users/euge/gachi-pachi && npx tsc --noEmit --skipLibCheck 2>&1 | head -20` | src/geocoding/photon.ts, src/geocoding/timezone.ts, src/geocoding/geocode.ts | pending |
| 01-05-T2 | 01-05 | 3 | CALC-03 | vitest | `cd /Users/euge/gachi-pachi && npx vitest run src/geocoding/fallback.test.ts --reporter=verbose 2>&1 | tail -20` | src/geocoding/fallback.ts, src/geocoding/fallback.test.ts | pending |
| 01-05-T3 | 01-05 | 3 | CALC-02 | vitest | `cd /Users/euge/gachi-pachi && npx vitest run src/geocoding/photon.test.ts --reporter=verbose 2>&1 | tail -20` | src/geocoding/photon.test.ts | pending |
| 01-06-T1 | 01-06 | 4 | CALC-01, CALC-07 | tsc | `cd /Users/euge/gachi-pachi && npx tsc --noEmit --skipLibCheck 2>&1 | head -20` | src/engine/chart.ts | pending |
| 01-06-T2 | 01-06 | 4 | CALC-01, CALC-07 | vitest | `cd /Users/euge/gachi-pachi && npx vitest run src/engine/chart.test.ts --reporter=verbose 2>&1 | tail -30` | src/engine/chart.test.ts | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Wave 0 is complete. vitest and related tooling are configured in Plan 01-01.

- [x] `vitest` and `@vitest/coverage-v8` installed as dev dependencies (Plan 01-01 Task 1)
- [x] `vitest.config.ts` created with jsdom environment and `include: ['src/**/*.test.ts']` (Plan 01-01 Task 2)
- [x] Test files are placed under `src/` matching the vitest include pattern:
  - `src/engine/ephemeris.test.ts` (Plan 01-03 Task 2)
  - `src/engine/aspects.test.ts` (Plan 01-04 Task 1)
  - `src/geocoding/fallback.test.ts` (Plan 01-05 Task 2)
  - `src/geocoding/photon.test.ts` (Plan 01-05 Task 3)
  - `src/engine/chart.test.ts` (Plan 01-06 Task 2)
- [x] `swisseph-wasm` WASM init pattern verified: `initEphemeris()` singleton tested in ephemeris.test.ts

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Geocoding returns correct lat/lon for a known city | CALC-02 | Depends on external API availability | Enter "London, United Kingdom" and verify lat ~51.5, lon ~-0.12 |
| Chart output matches astro.com reference | CALC-04 | Visual comparison against external site | Calculate chart for known birth data and compare Sun/Moon/ASC positions |

---

## Validation Sign-Off

- [x] All tasks have automated verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all test infrastructure (vitest.config.ts, src/**/*.test.ts pattern)
- [x] No watch-mode flags in any verify command
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
