# Requirements: Gachi Pachi

**Defined:** 2026-03-19
**Core Value:** See your natal chart and current transits clearly, in a single clean view, with no clutter or login walls.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Calculations

- [x] **CALC-01**: User can enter birth date (day/month/year), time, city, and country
- [ ] **CALC-02**: App geocodes city/country to latitude, longitude, and IANA timezone
- [ ] **CALC-03**: Manual lat/lon/timezone fallback if geocoding fails or is offline
- [x] **CALC-04**: Swiss Ephemeris WASM calculates positions for all 10 planets (Sun through Pluto)
- [ ] **CALC-05**: Placidus house cusps calculated from birth data
- [ ] **CALC-06**: Aspect calculations for 6 major aspects (conjunction, sextile, square, trine, quincunx, opposition) with standard orbs
- [x] **CALC-07**: Structured JSON data output of all chart data (AI-readable)

### Chart Display

- [ ] **CHART-01**: ASCII circular chart wheel with zodiac sign boundaries, house cusps, and planet glyphs at correct ecliptic positions
- [ ] **CHART-02**: Big Three header showing Sun sign, Moon sign, and Ascendant prominently
- [ ] **CHART-03**: Planet positions table with columns: symbol, planet, house, sign, degree
- [ ] **CHART-04**: Aspects table showing all active aspects between natal planets
- [ ] **CHART-05**: Split layout with chart wheel on left, "This is [Name]" header + Big Three + tables on right

### Natal Interpretations

- [ ] **INTERP-01**: Reference text for each planet-in-sign placement (2-3 sentences each)
- [ ] **INTERP-02**: Reference text for each planet-in-house placement (2-3 sentences each)
- [ ] **INTERP-03**: Reference text for each aspect between natal planets (2-3 sentences each)
- [ ] **INTERP-04**: Dedicated interpretations screen accessible via "Interpretations" option in chart view bottom bar

### Transits

- [ ] **TRANS-01**: Transit overlay showing current planet positions on the natal chart wheel
- [ ] **TRANS-02**: Transit list with 2-3 sentence reference interpretation per active transit aspect
- [ ] **TRANS-03**: Date defaults to today with a type-in field to pick any past or future date
- [ ] **TRANS-04**: Transit screen layout: wheel with overlay on left, "This is [Name] - Transits" + transit list on right
- [ ] **TRANS-05**: Transit screen bottom bar: "Back to chart" / "Exit"

### UX / Navigation

- [ ] **UX-01**: Animated landing screen with rotating coin/circle on Y-axis, terminal space aesthetic
- [ ] **UX-02**: "Press Enter to see astro data" prompt on landing screen
- [ ] **UX-03**: First-time flow: "What's your name?" prompt followed by birth data entry via terminal prompts
- [ ] **UX-04**: Return-visit flow: numbered list of saved people with arrow selection, plus "new person" option
- [ ] **UX-05**: All birth data and person profiles saved in browser localStorage
- [ ] **UX-06**: Frequency-sorted people list (most viewed charts appear first)
- [ ] **UX-07**: Full keyboard/arrow-key navigation throughout, no mouse required
- [ ] **UX-08**: Terminal-style typed prompts for all data entry (not form dropdowns)
- [ ] **UX-09**: Chart view bottom bar: "See transits" / "Interpretations" / "New person" / "Exit" (arrow-selectable)
- [ ] **UX-10**: WebTUI/terminal CSS aesthetic applied throughout all screens

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Extended Charts

- **EXT-01**: Synastry/compatibility chart comparing two saved people
- **EXT-02**: Progressions and solar return charts
- **EXT-03**: Additional house systems (Koch, Whole Sign)

### Extended Features

- **EXT-04**: Minor asteroid placements (Chiron, Lilith, North Node)
- **EXT-05**: Forming vs. separating indicators on transit aspects
- **EXT-06**: Aspect orb display (how tight each aspect is)
- **EXT-07**: Export chart to PDF or image

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts or login | Browser-only, no server, deliberate zero-friction design |
| Backend server | All computation and storage happens client-side |
| AI-generated interpretations | Reference text only, consistent and authoritative |
| Mobile app | Web-first, desktop viewport |
| Push notifications / daily horoscope | No server, no scheduled delivery |
| Social features (share, compare) | Requires backend and accounts |
| Real-time chat or community | Not aligned with personal tool vision |
| Multiple house systems | Placidus only for v1, defer to v2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CALC-01 | Phase 1 | Complete |
| CALC-02 | Phase 1 | Pending |
| CALC-03 | Phase 1 | Pending |
| CALC-04 | Phase 1 | Complete |
| CALC-05 | Phase 1 | Pending |
| CALC-06 | Phase 1 | Pending |
| CALC-07 | Phase 1 | Complete |
| CHART-01 | Phase 2 | Pending |
| CHART-02 | Phase 3 | Pending |
| CHART-03 | Phase 3 | Pending |
| CHART-04 | Phase 3 | Pending |
| CHART-05 | Phase 3 | Pending |
| UX-04 | Phase 4 | Pending |
| UX-05 | Phase 4 | Pending |
| UX-06 | Phase 4 | Pending |
| INTERP-01 | Phase 5 | Pending |
| INTERP-02 | Phase 5 | Pending |
| INTERP-03 | Phase 5 | Pending |
| INTERP-04 | Phase 5 | Pending |
| TRANS-01 | Phase 6 | Pending |
| TRANS-02 | Phase 6 | Pending |
| TRANS-03 | Phase 6 | Pending |
| TRANS-04 | Phase 6 | Pending |
| TRANS-05 | Phase 6 | Pending |
| UX-01 | Phase 7 | Pending |
| UX-02 | Phase 7 | Pending |
| UX-03 | Phase 7 | Pending |
| UX-07 | Phase 7 | Pending |
| UX-08 | Phase 7 | Pending |
| UX-09 | Phase 7 | Pending |
| UX-10 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
