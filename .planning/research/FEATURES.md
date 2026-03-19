# Feature Research

**Domain:** Astrology chart application (natal chart + transits, personal tool, browser-only)
**Researched:** 2026-03-19
**Confidence:** HIGH for table stakes (well-established domain); MEDIUM for differentiators (specific to this project's aesthetic approach)

---

## Feature Landscape

### Table Stakes (Users Expect These)

These are the baseline of any credible astrology chart tool. Missing any of these makes the app feel broken or unfinished to even casual astrology users.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Birth data entry (date, time, city) | Every natal chart tool starts here | MEDIUM | Requires geocoding city to lat/lon + timezone. Historical DST handling is tricky. Atlas or lookup library needed. |
| Planetary positions by sign and house | The core output of any natal chart | HIGH | Requires Swiss Ephemeris or equivalent. Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto minimum. |
| "Big Three" display (Sun, Moon, Ascendant) | The first thing users ask about their chart. Universal cultural shorthand. | LOW | Pure display once positions are calculated. Must be prominent. |
| Circular chart wheel | Visual standard for natal charts since the printed age. Users expect to see the wheel. | HIGH | This project uses ASCII, which is a deliberate aesthetic choice. The rendering approach is different but the feature is still required. |
| House placements | Shows which life area each planet occupies | MEDIUM | Placidus is the correct default for this project. House cusps needed for wheel rendering. |
| Aspect table | Shows angular relationships between planets (conjunction, trine, square, opposition, sextile) | MEDIUM | Standard 6 major aspects minimum. Orb tolerance of 6-8 degrees for conjunctions/oppositions, 4-6 for others. |
| Transit overlay for a given date | Shows current sky on top of natal chart | HIGH | Requires second ephemeris calculation for the transit date. Today as default is expected. |
| Transit list with interpretations | Users want to know what transits mean, not just that they exist | MEDIUM | Reference text per transit pairing. Not AI-generated. Standard astrological meanings. |
| Saved charts (return visits) | Users don't want to re-enter birth data every time | LOW | localStorage is sufficient for this project's scale. |
| Multiple saved people | Astrology users routinely look up charts for family and friends | LOW | Simple array in localStorage. Frequency-based ordering adds polish. |

### Differentiators (Competitive Advantage)

These are not expected by every user, but they directly address the stated frustrations with existing tools (astro.com clutter, poor transit overlays, no AI-readable output) that motivated this project.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| ASCII chart wheel (not SVG) | Full terminal aesthetic. No other major tool does this. Visually distinctive and readable in terminal contexts. | HIGH | This is the core aesthetic differentiator. ASCII art of a circle with glyphs for planets is the hard part. |
| Clean split layout (wheel + data) | astro.com buries the transit list. This project shows natal wheel and transit interpretations in a single scannable view. | MEDIUM | Layout architecture decision, not a calculation challenge. |
| Structured/AI-readable data output | Screenshots from astro.com are not AI-readable. This project's structured data output is unique utility for users who work with LLMs. | LOW | JSON output alongside visual rendering. Useful for the target user. |
| Keyboard/terminal UX (arrow keys, typed input, no mouse required) | None of the major apps have this. Matches the aesthetic and creates a distinct interaction model. | MEDIUM | Arrow-key nav, numbered lists for people selection, Enter to confirm. Requires careful focus management. |
| Transit date picker (type-in field) | Most apps default to "today" with calendar pickers. A type-in field fits the terminal aesthetic and is faster for users who know what date they want. | LOW | Date parsing edge cases (invalid dates, future/past limits) need handling. |
| No login wall | astro.com and Co-Star both require accounts. This app has zero friction for entry. | LOW | Deliberate constraint, not a feature to build, but worth calling out as a differentiator. |
| Frequency-sorted people list | Small UX improvement that shows you value returning users | LOW | Sort by access count or last accessed. Simple localStorage metadata. |

### Anti-Features (Commonly Requested, Often Problematic)

These are features common in the astrology app space that this project should deliberately skip for the stated scope.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| AI-generated interpretations | Users want personalized, insightful readings | AI output is inconsistent, can be wrong, and loses the authoritative tone of traditional astrology text. The project explicitly uses reference text. | Curated, static reference text per planet-sign-house and transit combination. |
| Multiple house systems (Koch, Whole Sign, etc.) | Power users have strong preferences | Adds significant UI complexity and decision fatigue for new users. Out of scope for v1. | Placidus only for v1. Document the decision. Can add later. |
| Synastry / compatibility charts | Extremely common request, second thing people try after natal | Doubles the complexity of the chart calculation and rendering. Separate feature with its own scope. | Save as v2 feature. The people list lays groundwork. |
| Progressions and solar returns | Power users want this for deeper analysis | These are separate chart types requiring their own calculation logic, rendering, and interpretation text. Well beyond natal + transits. | Defer entirely. Not in scope. |
| Push notifications / daily horoscope | Co-Star and CHANI are built around this | Browser-only tool with no backend cannot reliably do push. No server = no scheduled delivery. | Out of scope by architecture constraint. |
| Social features (share chart, compare with friends) | Co-Star's core differentiator | Requires backend, accounts, and privacy model. Opposite of this project's philosophy. | Not compatible with browser-only, no-login approach. |
| Asteroid placements (Chiron, Lilith, etc.) | Enthusiasts care deeply about these | Adds rendering complexity to the wheel and interpretation text scope. Diminishing returns for a first version. | Include as a v1.x addition once core is solid. |
| Rectification tools | Some users don't know their birth time | Complex astrological specialty. Out of scope entirely. | Prompt user to enter best-known time or use noon as fallback. |
| Mobile app / PWA | Users want access on phone | Out of scope per project constraints. Web-first, desktop. | Responsive layout can help on tablets without dedicated mobile work. |

---

## Feature Dependencies

```
Birth data entry (date + time + city)
    └──requires──> Geocoding / atlas lookup (lat/lon + timezone)
                       └──requires──> Swiss Ephemeris calculation
                                          └──produces──> Planetary positions (sign + house + degree)
                                          └──produces──> House cusps (Placidus)
                                          └──produces──> Aspect table

Planetary positions
    └──required by──> ASCII chart wheel rendering
    └──required by──> Big Three display (Sun, Moon, ASC)
    └──required by──> Planet positions table
    └──required by──> Transit overlay

Transit overlay
    └──requires──> Second ephemeris calculation (transit date)
    └──requires──> Transit date input (defaults to today)
    └──produces──> Transit aspects (transit planet to natal planet)
    └──required by──> Transit interpretation list

Saved people (localStorage)
    └──required by──> Return visit flow (numbered list)
    └──required by──> Frequency-sorted ordering
    └──enhances──> Transit view (no re-entry of birth data)

Structured data output
    └──requires──> Planetary positions (already calculated)
    └──enhances──> AI-readability without extra calculation work
```

### Dependency Notes

- Birth data entry is the root dependency for everything. Getting geocoding right (especially historical DST) unblocks all calculations.
- The chart wheel and tables are siblings: both consume calculated positions but do not depend on each other. They can be developed in parallel.
- Transit overlay depends on the natal chart being complete. Build natal fully before layering transits.
- Structured data output is low-cost because it reuses calculations already being made. Serialize the calculation output to JSON as a side effect.
- Synastry (deliberately excluded) would require the entire natal chart pipeline to run twice. This confirms it belongs in v2.

---

## MVP Definition

### Launch With (v1)

This maps to what is listed as Active requirements in PROJECT.md.

- [ ] Birth data entry with city geocoding and timezone resolution -- without this nothing works
- [ ] Swiss Ephemeris (WASM) for all planetary position calculations -- accuracy is table stakes
- [ ] Placidus house system -- user's stated preference
- [ ] ASCII chart wheel rendering -- the defining aesthetic feature
- [ ] Big Three header (Sun, Moon, Ascendant) -- first thing users look for
- [ ] Planet positions table (symbol, planet, house, sign, degree) -- the readable data complement to the wheel
- [ ] Aspect table (major aspects between natal planets) -- standard expectation
- [ ] Transit overlay on the chart wheel for any date -- primary use case after natal
- [ ] Transit list with 2-3 sentence reference interpretations -- makes transits actionable
- [ ] Transit date field defaulting to today -- standard expectation
- [ ] localStorage persistence for saved people -- required for return visits
- [ ] Animated terminal landing screen + first-time and return-visit flows -- the UX that makes this feel like itself
- [ ] Structured/AI-readable JSON output alongside visual -- the stated differentiator for the target user

### Add After Validation (v1.x)

Features to add once core natal + transit is working and in use.

- [ ] Forming vs. separating indicator on transit aspects -- adds depth to transit interpretations, low cost once transits are working
- [ ] Aspect orb display (how tight the aspect is) -- power user detail, doesn't affect core flow
- [ ] Minor asteroids (Chiron, Lilith, North Node) -- commonly requested by enthusiast users; ephemeris library already supports this
- [ ] Keyboard shortcut reference (? key shows available commands) -- quality of life for terminal aesthetic

### Future Consideration (v2+)

Features to defer until the core is proven and in regular use.

- [ ] Synastry / compatibility chart -- requires full second chart pipeline; save people list in v1 is prerequisite
- [ ] Progressions and solar returns -- separate chart types, distinct scope
- [ ] Additional house systems -- user and circle may want this eventually; Placidus-only for v1 is correct
- [ ] Export to PDF or image -- low priority for personal tool; may matter if sharing charts

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Birth data entry + geocoding | HIGH | MEDIUM | P1 |
| Swiss Ephemeris calculations | HIGH | MEDIUM | P1 |
| Big Three display | HIGH | LOW | P1 |
| ASCII chart wheel | HIGH | HIGH | P1 |
| Planet positions table | HIGH | LOW | P1 |
| Aspect table | HIGH | MEDIUM | P1 |
| Transit overlay + list | HIGH | HIGH | P1 |
| localStorage persistence | HIGH | LOW | P1 |
| Terminal UX / keyboard nav | MEDIUM | MEDIUM | P1 |
| Structured JSON output | MEDIUM | LOW | P1 |
| Forming/separating indicators | MEDIUM | LOW | P2 |
| Aspect orb display | MEDIUM | LOW | P2 |
| Minor asteroids | MEDIUM | MEDIUM | P2 |
| Synastry chart | HIGH | HIGH | P3 |
| Progressions / solar returns | MEDIUM | HIGH | P3 |
| Additional house systems | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | astro.com | Co-Star | TimePassages | This App |
|---------|-----------|---------|--------------|----------|
| Natal chart wheel | SVG, small render, cluttered | Clean but minimal | Full featured | ASCII, terminal aesthetic, full screen |
| Planet positions table | Yes, dense | Simplified | Full with dignities | Yes, readable table |
| Transit overlay | Yes, hard to read | Yes, simplified | Yes, with orb detail | Wheel + text list in split view |
| Transit interpretations | Verbose, clutter | Short | Detailed | 2-3 sentence reference text |
| House systems | Multiple | Placidus | Multiple | Placidus only (v1) |
| Saved charts | Yes (account required) | Yes (account required) | Yes (local) | Yes (localStorage, no account) |
| Multiple people | Yes | Yes (friends feature) | Yes | Yes (numbered list) |
| Synastry | Yes | Yes (core feature) | Yes | Deferred to v2 |
| Progressions | Yes | No | Yes | Deferred to v2 |
| Asteroids | Yes (many) | No | Yes | Deferred to v1.x |
| AI-readable output | No (screenshot only) | No | No | Yes (structured JSON) |
| Login required | Optional but pushed | Required | No | Never |
| Terminal / keyboard UX | No | No | No | Yes (core differentiator) |
| Mobile | Yes | Yes (primary) | Yes | No (web desktop only) |

---

## Sources

- [astro.com transit tools](https://www.astro.com/faq/fq_fh_transits_e.htm) -- official astro.com documentation on transit features
- [TimePassages app features](https://www.astrograph.com/timepassages/advanced.php) -- full feature list for the most feature-complete mobile app
- [Co-Star feature overview](https://www.costarastrology.com/) -- primary competitor for social/casual users
- [Co-Star transit and orb explanation](https://www.costarastrology.com/how-does-astrology-work/transits-orbs) -- how they explain transit orbs
- [swisseph-wasm library](https://github.com/prolaxu/swisseph-wasm) -- WASM implementation for browser-based calculations
- [astro-sweph library](https://github.com/astroahava/astro-sweph) -- alternative WASM implementation
- [Aspect orbs and forming/separating](https://www.aquariuspapers.com/astrology/2024/03/aspect-orbs-natal-and-progressed-forming-and-separating.html) -- standard orb practice
- [Best astrology apps 2025 comparison](https://vama.app/blog/best-astrology-apps/) -- user expectations research
- [Geocoding and birth data entry best practices](https://timenomad.app/documentation/accurate-natal-birth-chart-calculator-software.html) -- accuracy requirements for location handling

---
*Feature research for: browser-based astrology chart app with terminal/ASCII aesthetic*
*Researched: 2026-03-19*
