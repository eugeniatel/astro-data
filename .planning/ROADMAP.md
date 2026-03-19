# Roadmap: Gachi Pachi

## Overview

Gachi Pachi is a browser-only, terminal-aesthetic natal chart and transit tool. The build order is strict: accurate ephemeris calculations must exist before any rendering begins, the ASCII wheel renderer is the most technically uncertain piece and is built in isolation before integration, and the full natal chart screen must be complete before the transit overlay layer is added on top. Terminal UX and navigation are applied last because they depend on all screens existing. Seven phases, each delivering a coherent and independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Ephemeris Engine** - Accurate planetary calculations, house cusps, aspects, geocoding, and structured JSON output validated against a known reference chart
- [x] **Phase 2: ASCII Wheel Renderer** - Custom ASCII circular chart wheel built and validated in isolation with hardcoded test data
- [x] **Phase 3: Natal Chart Screen** - Full natal chart view wired to live data: Big Three header, split layout, planet table, aspect table
- [ ] **Phase 4: People Management** - Terminal-style birth data entry flow, localStorage persistence, and the saved people list
- [ ] **Phase 5: Natal Interpretations** - Static reference text for planet-in-sign, planet-in-house, and aspect placements, accessible from the chart view
- [ ] **Phase 6: Transit System** - Transit overlay on the chart wheel, transit aspect list with reference interpretations, and date selection
- [ ] **Phase 7: Terminal UX** - Animated landing screen, full keyboard navigation, first-time and return-visit flows, frequency sorting, and WebTUI aesthetic completeness

## Phase Details

### Phase 1: Ephemeris Engine
**Goal**: Accurate astrological calculations exist as a tested, validated layer that all other phases depend on, including birth data input, geocoding, and structured output
**Depends on**: Nothing (first phase)
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07
**Success Criteria** (what must be TRUE):
  1. Given a birth date, time, and city/country, the app geocodes to latitude/longitude/IANA timezone and calculates Sun, Moon, and Ascendant values matching astro.com within acceptable orb
  2. If geocoding fails or is offline, a user can enter latitude, longitude, and UTC offset manually and calculations still proceed
  3. Placidus house cusps are calculated correctly and match reference data for a standard test case, including a Reykjavik (64N) edge case producing valid output
  4. All 6 major aspects between natal planets are calculated with correct orbs
  5. Structured JSON output containing all planetary positions, house assignments, and aspects is produced for any valid birth data input
**Plans**: 6 plans

Plans:
- [x] 01-01-PLAN.md -- Project scaffold: Vite + TypeScript + swisseph-wasm + vitest setup
- [x] 01-02-PLAN.md -- Type contracts: ChartData, Person, PlanetPosition, Aspect, all Phase 1 interfaces
- [x] 01-03-PLAN.md -- Ephemeris core: swisseph-wasm wrapper, Julian Day, planet positions, Placidus houses
- [x] 01-04-PLAN.md -- Aspect detection: pure function, all 6 aspects, orb rules, luminary bonus
- [x] 01-05-PLAN.md -- Geocoding pipeline: Photon (primary), cities.json fallback, manual entry
- [x] 01-06-PLAN.md -- ChartData assembler: wires all modules, integration test against Einstein chart

### Phase 2: ASCII Wheel Renderer
**Goal**: A visually correct ASCII chart wheel can render any ChartData input, validated in isolation before integration with live data
**Depends on**: Phase 1
**Requirements**: CHART-01
**Success Criteria** (what must be TRUE):
  1. The wheel renders a circular shape (not an oval) in a monospace browser font, with correct character aspect ratio compensation applied
  2. Zodiac sign boundaries appear at the correct 30-degree intervals around the wheel
  3. House cusp lines appear at correct positions relative to the Ascendant at 9 o'clock
  4. Planet glyphs appear at their correct ecliptic positions, verified against astro.com for a known chart
**Plans**: TBD

### Phase 3: Natal Chart Screen
**Goal**: A user can see their complete natal chart in a single split-pane screen with all data panels
**Depends on**: Phase 2
**Requirements**: CHART-02, CHART-03, CHART-04, CHART-05
**Success Criteria** (what must be TRUE):
  1. The "This is [Name]" header appears with Sun sign, Moon sign, and Ascendant displayed prominently
  2. The planet positions table shows symbol, planet, house, sign, and degree for all 10 planets
  3. The aspects table shows all active natal aspects with correct aspect types
  4. The ASCII wheel appears on the left and the header plus tables appear on the right in a stable split layout
**Plans**: TBD

### Phase 4: People Management
**Goal**: Users can enter birth data through terminal-style prompts and return later to select from a list of saved people
**Depends on**: Phase 3
**Requirements**: UX-04, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. Birth data for multiple people is saved in browser localStorage and persists across page reloads and browser sessions
  2. On return visits, a numbered list of saved people appears, sorted so most-viewed charts appear first
  3. A user can select any saved person from the list and see their chart without re-entering data
**Plans**: TBD

### Phase 5: Natal Interpretations
**Goal**: Users can read reference text explanations for each placement and aspect in their natal chart
**Depends on**: Phase 3
**Requirements**: INTERP-01, INTERP-02, INTERP-03, INTERP-04
**Success Criteria** (what must be TRUE):
  1. A 2-3 sentence reference interpretation appears for each planet-in-sign placement in the current chart
  2. A 2-3 sentence reference interpretation appears for each planet-in-house placement in the current chart
  3. A 2-3 sentence reference interpretation appears for each active natal aspect
  4. The interpretations screen is accessible via an "Interpretations" option in the chart view bottom bar
**Plans**: TBD

### Phase 6: Transit System
**Goal**: Users can view current or future planetary transits overlaid on their natal chart with reference interpretations
**Depends on**: Phase 3
**Requirements**: TRANS-01, TRANS-02, TRANS-03, TRANS-04, TRANS-05
**Success Criteria** (what must be TRUE):
  1. The transit chart wheel shows current transiting planet positions overlaid on the natal wheel for today's date by default
  2. A user can type any past or future date and the transit overlay updates to that date
  3. A transit list appears showing active transit aspects with a 2-3 sentence reference interpretation for each
  4. The transit screen layout shows the wheel with overlay on the left and "This is [Name] - Transits" plus the transit list on the right
  5. The transit screen bottom bar offers "Back to chart" and "Exit" options
**Plans**: TBD

### Phase 7: Terminal UX
**Goal**: The app feels like a terminal program throughout, with animated landing, keyboard navigation, and terminal aesthetic applied consistently to every screen
**Depends on**: Phase 4, Phase 5, Phase 6
**Requirements**: UX-01, UX-02, UX-03, UX-07, UX-08, UX-09, UX-10
**Success Criteria** (what must be TRUE):
  1. The landing screen shows an animated rotating coin/circle on the Y-axis in a terminal space aesthetic, with a "Press Enter to see astro data" prompt
  2. First-time users are guided through birth data entry via terminal-style typed prompts, not form dropdowns
  3. All navigation throughout the app works via arrow keys and Enter with no mouse required
  4. The chart view bottom bar shows arrow-selectable options: "See transits", "Interpretations", "New person", "Exit"
  5. The WebTUI terminal CSS aesthetic is applied consistently across all screens
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Ephemeris Engine | 6/6 | Complete | 2026-03-19 |
| 2. ASCII Wheel Renderer | 1/1 | Complete | 2026-03-19 |
| 3. Natal Chart Screen | 1/1 | Complete | 2026-03-19 |
| 4. People Management | 0/TBD | Not started | - |
| 5. Natal Interpretations | 0/TBD | Not started | - |
| 6. Transit System | 0/TBD | Not started | - |
| 7. Terminal UX | 0/TBD | Not started | - |
