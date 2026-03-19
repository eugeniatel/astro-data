---
phase: 01-ephemeris-engine
plan: 01
subsystem: infra
tags: [vite, typescript, vitest, swisseph-wasm, jsdom, wasm]

# Dependency graph
requires: []
provides:
  - Vite + TypeScript project scaffold with vanilla-ts template
  - All Phase 1 dependencies installed (swisseph-wasm, tz-lookup, luxon, cities.json, vitest)
  - Vite configured to exclude swisseph-wasm from dependency optimization
  - vitest configured with jsdom environment and passWithNoTests
affects: [02, 03, 04, 05, 06]

# Tech tracking
tech-stack:
  added:
    - vite@8.0.1
    - typescript@5.9.3
    - swisseph-wasm@0.0.5
    - "@photostructure/tz-lookup@11.5.0"
    - luxon@3.7.2
    - cities.json@1.1.50
    - vitest@4.1.0
    - "@vitest/coverage-v8@4.1.0"
    - jsdom (vitest environment)
    - "@types/luxon"
  patterns:
    - vitest with jsdom environment and passWithNoTests for browser-targeted app
    - swisseph-wasm excluded from Vite optimizeDeps to preserve import.meta.url paths

key-files:
  created:
    - package.json
    - tsconfig.json
    - index.html
    - src/main.ts
    - vite.config.ts
    - vitest.config.ts
    - .gitignore
  modified: []

key-decisions:
  - "swisseph-wasm excluded from Vite optimizeDeps to prevent path rewriting that breaks WASM data file location"
  - "vitest jsdom environment chosen because app targets browser APIs (localStorage, fetch)"
  - "passWithNoTests:true added to vitest config so empty test suite exits 0"
  - "jsdom installed as explicit dev dependency (required by vitest jsdom environment)"

patterns-established:
  - "Pattern: swisseph-wasm always in optimizeDeps.exclude in vite.config.ts"
  - "Pattern: vitest runs with jsdom environment and globals:true for all test files"

requirements-completed: [CALC-04]

# Metrics
duration: 3min
completed: 2026-03-19
---

# Phase 01 Plan 01: Vite TypeScript Scaffold with swisseph-wasm + vitest Summary

Vite 8 + TypeScript project scaffolded with swisseph-wasm@0.0.5 (12MB ephemeris data confirmed), tz-lookup, luxon, cities.json, and vitest configured to run with jsdom and exit 0 on empty suite.

## Performance

- Duration: 3 min
- Started: 2026-03-19T21:05:20Z
- Completed: 2026-03-19T21:08:34Z
- Tasks: 2
- Files modified: 7

## Accomplishments

- Vite + TypeScript project created with vanilla-ts template structure
- All Phase 1 dependencies installed at verified versions: swisseph-wasm@0.0.5, @photostructure/tz-lookup@11.5.0, luxon@3.7.2, cities.json@1.1.50, vitest@4.1.0
- swisseph.data (12MB) and swisseph.wasm (531KB) confirmed present in node_modules
- Vite configured with optimizeDeps.exclude to prevent WASM path rewriting
- vitest exits 0 with no test files (passWithNoTests), jsdom environment ready

## Task Commits

Each task was committed atomically:

1. Task 1: Scaffold Vite TypeScript project and install dependencies - `8447394` (feat)
2. Task 2: Configure Vite and vitest to work with swisseph-wasm - `bd13fd2` (feat)

## Files Created/Modified

- `package.json` - Project manifest with all Phase 1 dependencies
- `tsconfig.json` - TypeScript config targeting ES2023 with strict mode
- `index.html` - Entry HTML with Gachi Pachi title
- `src/main.ts` - Minimal scaffold with WASM init comment
- `vite.config.ts` - Vite config excluding swisseph-wasm from optimization, serving .data files
- `vitest.config.ts` - Test framework config with jsdom, globals, passWithNoTests
- `.gitignore` - Excludes node_modules, dist, .DS_Store

## Decisions Made

- `vite.config.ts` uses `optimizeDeps.exclude: ['swisseph-wasm']` because Vite's esbuild optimizer rewrites `import.meta.url` paths, which breaks swisseph-wasm's runtime location of `swisseph.data`. Excluding it prevents this (confirmed in research as critical pitfall).
- `assetsInclude: ['**/*.data']` added so Vite serves the 12MB ephemeris data file as a static asset rather than trying to inline it.
- `vitest.config.ts` uses `environment: 'jsdom'` because the app targets browser APIs (localStorage, fetch).
- `passWithNoTests: true` added because vitest 4.1.0 exits with code 1 when no test files are found. The plan requires it to exit 0 in an empty project state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing jsdom dependency**
- Found during: Task 2 (vitest configuration)
- Issue: vitest 4.1.0 with `environment: 'jsdom'` requires jsdom as a peer dependency. It was not listed in the plan's install commands. Running vitest produced: "MISSING DEPENDENCY Cannot find dependency 'jsdom'"
- Fix: `npm install --save-dev jsdom`
- Files modified: package.json, package-lock.json
- Verification: vitest runs without the MISSING DEPENDENCY warning
- Committed in: bd13fd2 (Task 2 commit)

**2. [Rule 3 - Blocking] Added passWithNoTests to vitest config**
- Found during: Task 2 (vitest verification)
- Issue: vitest 4.1.0 exits with code 1 when no test files match the include pattern. The plan requires `npx vitest run` to exit 0.
- Fix: Added `passWithNoTests: true` to vitest.config.ts test config
- Files modified: vitest.config.ts
- Verification: `npx vitest run` outputs "exiting with code 0"
- Committed in: bd13fd2 (Task 2 commit)

**3. [Rule 2 - Missing Critical] Created .gitignore**
- Found during: Task 1 (after dependency install)
- Issue: No .gitignore existed. node_modules would be committed without it.
- Fix: Created .gitignore excluding node_modules, dist, .DS_Store, *.local
- Files modified: .gitignore (new)
- Verification: git status shows node_modules excluded
- Committed in: 8447394 (Task 1 commit)

---

Total deviations: 3 auto-fixed (2 blocking, 1 missing critical)
Impact on plan: All auto-fixes necessary for correctness and basic operation. No scope creep.

## Issues Encountered

- `npm create vite@latest . -- --template vanilla-ts --force` could not run non-interactively in the project directory (which was non-empty due to .git, .claude, .planning). The `--force` flag triggered an interactive overwrite prompt that couldn't be bypassed via stdin piping. Resolution: created template files manually by inspecting a fresh vanilla-ts scaffold in /tmp.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Project scaffold complete, all Phase 1 dependencies installed and verified
- swisseph.data and swisseph.wasm confirmed present at correct paths
- vitest ready to run test files as they are added in Plans 02-06
- Plan 02 (type contracts) can begin immediately

---
*Phase: 01-ephemeris-engine*
*Completed: 2026-03-19*

## Self-Check: PASSED

- package.json: FOUND
- vite.config.ts: FOUND
- vitest.config.ts: FOUND
- tsconfig.json: FOUND
- index.html: FOUND
- src/main.ts: FOUND
- .gitignore: FOUND
- 01-01-SUMMARY.md: FOUND
- Commit 8447394: FOUND (feat(01-01): scaffold Vite TypeScript project)
- Commit bd13fd2: FOUND (feat(01-01): configure Vite and vitest)
