# Project Research Summary

**Project:** Gachi Pachi
**Domain:** Browser-only astrology birth chart app (terminal/ASCII aesthetic)
**Researched:** 2026-03-19
**Confidence:** MEDIUM (ephemeris layer HIGH, features HIGH, architecture HIGH, ASCII rendering LOW — no prior JS library for circular ASCII chart wheels)

## Executive Summary

Gachi Pachi is a browser-only natal chart and transit tool built around a terminal aesthetic. The defining constraint is that the chart wheel must be ASCII, not SVG — and no existing JavaScript library does this. Every other tool in the space (astro.com, Co-Star, TimePassages) outputs graphical SVG wheels. That makes the ASCII wheel renderer the single hardest custom piece in the project, and the one with the least prior art to draw from.

The recommended approach is: Vite with the vanilla-ts template, Swiss Ephemeris via the swisseph-wasm package for accurate planetary calculations, and WebTUI (@webtui/css) for the terminal CSS layer. The application should be structured in clearly separated layers — calculation engine (pure TypeScript, no DOM), state store, render functions (pure string-in/string-out), and screens. A finite state machine handles navigation. The key architectural principle is: calculate once when data changes, cache in state, render from cache. Never call WASM during rendering.

The most dangerous risks are silent errors: WASM initialization failures that produce blank charts, timezone/DST errors that produce plausible but wrong Ascendants, and geocoding failures that silently block data entry. All three must be addressed in Phase 1 before any rendering work begins. The ASCII circle aspect ratio distortion (monospace characters are taller than wide) is a rendering-layer risk that must be validated visually before any planet placement logic is added.

## Key Findings

### Recommended Stack

The stack is minimal by design: Vite 8 (vanilla-ts template) handles the build with native WASM support and no framework overhead. The Swiss Ephemeris WASM wrapper (swisseph-wasm 0.0.5) is the only viable zero-dependency browser ephemeris option. WebTUI provides the terminal CSS layer with character-cell layout and built-in ASCII box drawing. figlet.js handles ASCII text for UI chrome.

There is no JavaScript library for astrological ASCII wheel rendering. This is a custom build. The Astrolog desktop app's `-w` switch (C, open source) is the closest reference for the layout algorithm.

**Core technologies:**
- Vite 8.0.1 (vanilla-ts): build tool and dev server — no framework overhead, native WASM imports, canonical starting point for browser-only TS
- TypeScript 5.x: language — essential for preventing degree/radian/house-number mix-ups in a calculation-heavy domain
- swisseph-wasm 0.0.5: planetary and house calculations — only zero-dependency Swiss Ephemeris WASM wrapper for direct browser use, GPL-3.0
- @webtui/css 0.1.6: terminal aesthetic CSS — character-cell layout, ASCII box drawing built-in, actively maintained
- figlet 1.10.0: ASCII art text for UI chrome — landing screen header, section labels

### Expected Features

The feature set is well-understood. The domain is mature (natal charts have been standardized for decades), and the target features are a direct subset of what professional tools offer — minus login walls, social features, and mobile.

**Must have (table stakes):**
- Birth data entry (date, time, city) with geocoding and DST-aware timezone resolution — root dependency for everything
- Swiss Ephemeris calculations for planetary positions, Placidus house cusps, and aspects — accuracy is non-negotiable
- ASCII chart wheel (natal + transit overlay) — the project's defining aesthetic, still a required feature even in ASCII form
- Big Three display (Sun, Moon, Ascendant) — first thing any astrology user looks for
- Planet positions table (symbol, planet, sign, house, degree) — the readable text complement to the wheel
- Aspect table for natal planets (6 major aspects, standard orbs)
- Transit overlay for any date with a typed date field defaulting to today
- Transit list with 2-3 sentence reference interpretations (static text, not AI)
- localStorage persistence for multiple saved people with frequency sorting
- Animated terminal landing screen with first-time and return-visit flows
- Structured JSON output alongside the visual (AI-readability differentiator)

**Should have (competitive):**
- Keyboard/terminal UX — arrow keys, numbered lists, no mouse required; no major app has this
- Clean split layout (wheel left, transit list right) in a single scannable view
- No login wall — zero friction, deliberate contrast with astro.com and Co-Star
- Transit date type-in field — faster than calendar pickers, fits the aesthetic

**Defer (v2+):**
- Synastry/compatibility charts — doubles chart pipeline complexity; people list in v1 is the prerequisite
- Progressions and solar returns — separate chart types, distinct scope
- Multiple house systems (Koch, Whole Sign) — correct to default Placidus only for v1
- Asteroid placements (Chiron, Lilith) — ephemeris supports it, but add after core is solid

### Architecture Approach

The architecture is a layered vanilla TypeScript SPA with strict separation between calculation, state, rendering, and screens. A finite state machine in the router handles navigation between 5 screens (LANDING, ONBOARDING, PERSON_SELECT, CHART, TRANSIT). The key pattern is calculate-then-cache: WASM runs once on person selection or date change, the result is stored as a typed ChartData object, and all rendering reads from that cache synchronously. Rendering functions are pure (data in, string out), making the ASCII wheel testable in isolation.

**Major components:**
1. Ephemeris Service (engine/) — Swiss Ephemeris WASM wrapper, typed async API, zero DOM dependency
2. Application State Store (store/) — single source of truth, notify/subscribe pattern, no external library
3. ASCII Wheel Renderer (render/wheel.ts) — custom polar-to-character-grid algorithm, most complex piece
4. Screen State Machine (router.ts) — named states and transitions, screens emit events and never navigate directly
5. Persistence Layer (store/persistence.ts) — localStorage CRUD for Person profiles; ChartData is always recalculated, never cached
6. Input Handler (input.ts) — single global keydown listener, delegates to active screen
7. Text Panels (render/tables.ts, render/layout.ts) — planet table, aspect table, transit list as fixed-width strings

### Critical Pitfalls

1. **WASM async initialization skipped** — WASM requires awaiting binary load before any function call. Call calculation functions before init resolves and you get blank charts with no visible error. Fix: initialize once in main.ts, expose a promise, all calculation code awaits it. Verify with a known Sun position before writing any other chart code.

2. **Timezone/DST errors produce silently wrong Ascendants** — Using `new Date()` or raw UTC offset math instead of IANA-aware libraries gives wrong charts for anyone born near DST transitions. The Ascendant shifts 15 degrees per hour of timezone error. Fix: use Luxon with IANA zone names, confirm timezone at birth entry, never add/subtract raw hours.

3. **Geocoding has no fallback** — If the geocoding API fails or is offline, birth entry is blocked. Fix: cache results in localStorage, always build a manual lat/lon/UTC offset entry path alongside the API call.

4. **ASCII circle distorted by character aspect ratio** — Monospace characters are roughly 1:2 (width:height). A naive circle algorithm produces an oval. Fix: account for the aspect ratio in the circle-drawing math (vertical radius is R/2 in character rows). Validate visually in the actual browser font before adding any planet placement.

5. **Planet placement uses wrong angular mapping** — Ecliptic longitude (0-360) must map to screen angle with the Ascendant at 9 o'clock, rotating counterclockwise, in a coordinate system where y increases downward. Getting this wrong places planets in wrong houses. Fix: define one canonical `eclipticToScreenAngle()` function and verify with a known public figure's chart against astro.com.

## Implications for Roadmap

The dependency chain from FEATURES.md is unambiguous: birth data entry and ephemeris calculations must come first. Nothing works without them. The ASCII wheel is the hardest rendering task and should be built in isolation before integration. Transit overlay is a second rendering pass on top of a completed natal chart. The build order from ARCHITECTURE.md confirms this sequencing.

Based on combined research, five phases are suggested:

### Phase 1: Foundation (Data Entry, Calculations, Persistence)

**Rationale:** Every feature depends on accurate ephemeris output. Timezone errors and WASM initialization failures are silent killers — they must be solved before any rendering work begins. This phase has no external dependencies; it can be tested in isolation.

**Delivers:** Working ephemeris calculations validated against astro.com reference data, birth data entry with geocoding and timezone resolution, localStorage persistence with export/import, and the core TypeScript types used by all other layers.

**Addresses:** Birth data entry, Swiss Ephemeris calculations, Placidus houses, localStorage persistence, multiple saved people, structured JSON output.

**Avoids:** WASM async initialization failure, timezone/DST errors, geocoding offline failure, localStorage data loss.

### Phase 2: ASCII Chart Wheel

**Rationale:** The wheel is the project's core visual differentiator and the most technically uncertain piece. Building it in isolation (with hardcoded test data) before wiring it to live calculations reduces debugging complexity. The character aspect ratio problem must be solved here, not discovered after planet placement is integrated.

**Delivers:** A visually correct ASCII chart wheel with zodiac ring, house cusps, and planet glyphs placed at accurate positions. Validated against a known chart from astro.com.

**Uses:** swisseph-wasm output (ChartData), render/wheel.ts in isolation, figlet for label chrome.

**Avoids:** ASCII circle aspect ratio distortion, wrong angular mapping for planet placement, coordinate system confusion.

### Phase 3: Chart Screen (Natal View)

**Rationale:** With ephemeris and the wheel working independently, this phase wires them together into a complete natal chart screen. The text panels (planet table, aspect table) are lower complexity than the wheel and can be built here.

**Delivers:** The full CHART screen: ASCII wheel left, planet positions table and aspect table right. Big Three header. Return-visit flow from localStorage.

**Implements:** render/tables.ts, render/layout.ts, screens/chart.ts, router.ts, screens/person-select.ts.

### Phase 4: Transit Overlay

**Rationale:** Transit is a second rendering pass on the natal wheel — it depends on Phase 3 being complete. The transit date field and recalculation loop are contained here.

**Delivers:** Transit overlay on the chart wheel for any typed date, transit aspect list, 2-3 sentence reference interpretations per transit pairing, date field defaulting to today.

**Implements:** screens/transit.ts, data/interpretations.ts, second ephemeris call for transit date.

**Avoids:** Separating natal chart render (static) from transit overlay render (reactive) per the performance trap noted in PITFALLS.md.

### Phase 5: Terminal UX Polish

**Rationale:** The animated landing screen, keyboard navigation, frequency-sorted people list, and terminal chrome are cosmetic and interaction-layer work. They are best done last so they don't distract from core calculation and rendering correctness.

**Delivers:** Animated landing screen, full keyboard/arrow-key navigation, numbered people selection list sorted by frequency, terminal aesthetic completeness, and the structured JSON export.

**Implements:** screens/landing.ts, input.ts finalization, figlet title/header, @webtui/css polish.

### Phase Ordering Rationale

- Phases 1 and 2 are sequenced by the silent-failure risk: ephemeris and timezone errors are invisible in a rendered chart but obvious in unit tests. Solving them before rendering prevents debugging nightmares.
- The ASCII wheel (Phase 2) is isolated from live data intentionally. The character aspect ratio and angular mapping problems are rendering problems, not calculation problems — separating them makes each debuggable.
- Transits (Phase 4) are deliberately after the complete natal screen because the transit overlay is a second rendering pass, not a separate feature — it reuses the wheel renderer built in Phase 2 and 3.
- UX polish (Phase 5) comes last because keyboard navigation depends on all screens existing, and the landing screen is cosmetically important but not functionally blocking.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 1 (geocoding):** Nominatim CORS behavior from browser JS is a known problem with unresolved status. Verify actual behavior against nominatim.openstreetmap.org at build time. May need a CORS proxy or fallback to Geoapify free tier. Research confirmed the risk but not the solution.
- **Phase 2 (ASCII wheel algorithm):** No prior JS library exists. The Astrolog C source is the best reference but requires translation. Character aspect ratio correction constants may need empirical tuning per font. Plan extra time here.
- **Phase 4 (transit interpretations text):** Research did not produce a source for static reference interpretation text. This content needs to be authored or licensed before Phase 4 can complete.

Phases with standard patterns (skip research-phase):

- **Phase 1 (WASM initialization):** Well-documented in swisseph-wasm README and Oreate AI blog post. Follow the async init pattern exactly.
- **Phase 3 (chart screen layout):** Standard split-pane layout with WebTUI. No novel patterns needed.
- **Phase 5 (keyboard nav):** Standard keydown listener delegation pattern. No library needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Vite 8 and TypeScript are HIGH confidence. swisseph-wasm is MEDIUM — npm page returned 403, version confirmed via jsDelivr. WebTUI is HIGH. Nominatim CORS behavior is LOW. |
| Features | HIGH | Well-established domain. Feature expectations for astrology tools are consistent across competitors and user research. MVP scope is clear and bounded. |
| Architecture | HIGH | Component structure, data flow, and layer separation are verified patterns for browser-only WASM SPAs. The FSM router and render-on-state-change pattern are well-documented. |
| Pitfalls | MEDIUM | WASM, timezone, and geocoding pitfalls verified across 2+ sources each. ASCII aspect ratio distortion is confirmed by ASCII rendering references. Specific orb tuning values and interpretation text are not validated. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Nominatim CORS from browser:** Confirmed as a problem, no confirmed fix. Address at the start of Phase 1 by testing against the actual endpoint. Have Geoapify free tier as a ready fallback.
- **Transit interpretation text source:** No existing CC-licensed or public-domain library of 2-3 sentence transit interpretations was identified. This content must be authored before Phase 4. Flag as a planning risk.
- **swisseph-wasm npm page inaccessible during research:** Confirmed via jsDelivr CDN listing and GitHub. Verify the package still resolves via npm at project scaffold time.
- **Placidus at high latitudes:** Research flagged that Placidus house calculation can produce degenerate results near the Arctic Circle. A test case with Reykjavik (64N) birth data should be a Phase 1 exit criterion.

## Sources

### Primary (HIGH confidence)
- https://webtui.ironclad.sh/start/installation/ — WebTUI v0.1.6 confirmed, character-cell layout, ASCII box drawing
- https://vite.dev/blog/announcing-vite8 — Vite 8.0.1 release notes, Rolldown, WASM SSR support
- https://github.com/patorjk/figlet.js/ — figlet v1.10.0, TypeScript since v1.9.0, browser compatible
- https://terminalcss.xyz/ — terminal.css v0.7.5, fallback CSS option confirmed
- https://www.oreateai.com/blog/how-to-use-swiss-ephemeris-wasm-module/ — WASM init pattern, swe_set_ephe_path, async init requirement
- https://github.com/osm-search/Nominatim/discussions/2488 — Nominatim CORS issues confirmed by multiple threads

### Secondary (MEDIUM confidence)
- https://github.com/prolaxu/swisseph-wasm — swisseph-wasm 0.0.5, browser support, GPL-3.0 (npm page returned 403; confirmed via jsDelivr)
- https://github.com/astroahava/astro-sweph — alternative WASM option with single-file embed
- https://github.com/0xStarcat/CircularNatalHoroscopeJS — data model reference, Moshier ephemeris (less precise than Swiss Eph)
- https://jsdev.space/spa-vanilla-js/ — vanilla JS SPA routing patterns
- https://xiaoyunyang.github.io/post/modeling-ui-state-using-a-finite-state-machine/ — FSM UI modeling
- https://alexharri.com/blog/ascii-rendering — ASCII character aspect ratio and rendering constraints
- https://www.astro.com/faq/fq_de_timezone_e.htm — timezone handling requirements for ephemeris accuracy

### Tertiary (LOW confidence)
- https://www.astrolog.org/ftp/astrolog.htm — Astrolog ASCII wheel reference; useful algorithm reference but C source, not JS
- https://skyscript.co.uk/forums/viewtopic.php?t=10030 — Placidus failure at high latitudes (forum thread, needs verification with actual test case)

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
