# Pitfalls Research

**Domain:** Browser-based astrology birth chart app (ASCII rendering, Swiss Ephemeris WASM, localStorage)
**Researched:** 2026-03-19
**Confidence:** MEDIUM (most findings verified across 2+ sources; some WASM-specific behaviors confirmed by official docs and community reports)

---

## Critical Pitfalls

### Pitfall 1: Swiss Ephemeris WASM Initialization Treated Like a Normal npm Import

**What goes wrong:**
Developers import the WASM module and call calculation functions immediately, expecting synchronous behavior. The module fails silently or throws cryptic errors because WASM requires asynchronous binary loading before any function calls work. The result is a blank chart with no visible error to the user.

**Why it happens:**
JavaScript developers expect npm packages to be ready after import. WASM modules are different: the `.wasm` binary must be fetched and compiled asynchronously before the exported functions exist. The Swiss Ephemeris wrapper (sweph-wasm) exposes an initialization function that most developers skip.

**How to avoid:**
- Wrap all WASM initialization in an async function that awaits `WebAssembly.instantiateStreaming()` or the library's equivalent init call before any calculation.
- Build a single ephemeris service module that initializes once on app load and exposes a promise-based API. All chart components await this promise.
- Never call `swe_calc_ut()` or any Swiss Ephemeris function before the init promise resolves.

**Warning signs:**
- "swe_calc_ut is not a function" errors in the console
- Charts that render with 0 degrees for all planets
- Works in Vite dev server but fails on production static hosting

**Phase to address:**
Phase 1 (Core calculation engine). Establish the WASM initialization pattern before any other code touches ephemeris functions.

---

### Pitfall 2: Ephemeris Data Files (.se1) Not Served or Missing

**What goes wrong:**
The Swiss Ephemeris WASM module needs three binary data files to perform calculations: `sepl_18.se1` (planets), `semo_18.se1` (moon), and `seas_18.se1` (asteroids). If these files are missing from the public directory or not referenced correctly, calculations silently fall back to a lower-precision internal table or fail entirely. Planet positions can be off by arc-minutes to degrees.

**Why it happens:**
Developers install the npm package and assume all data is bundled. It is not. The `.se1` files are separate assets that must be copied to the public directory and configured via `swe_set_ephe_path()`. The WASM module runs in a sandboxed virtual filesystem and cannot access the local filesystem directly.

**How to avoid:**
- Copy all three `.se1` data files to `/public/ephe/` (or equivalent) during project setup.
- Call `swe_set_ephe_path('/ephe/')` before any calculation.
- Verify data file loading with a single test calculation (Sun position for a known date) and compare against astro.com's output.
- Add the `ephe/` directory to the build configuration so bundlers include it as static assets.

**Warning signs:**
- Planet calculations that are "close but not quite right" compared to reference apps
- Console warnings about missing ephemeris path
- Moon positions that look correct but planets are slightly off

**Phase to address:**
Phase 1 (Core calculation engine). Verification against astro.com reference data should be a phase completion criterion.

---

### Pitfall 3: Timezone/DST Errors in Birth Data Produce Silently Wrong Charts

**What goes wrong:**
A user born in New York at 3:00 PM on a summer date is actually born at 3:00 PM EDT (UTC-4), not EST (UTC-5). If the app passes the wrong UTC offset to the ephemeris, the Ascendant shifts by 15 degrees (one hour = 15 degrees of sky rotation). The chart looks plausible and the user has no way to detect the error.

**Why it happens:**
Developers use `new Date()` or manual UTC offset math instead of IANA timezone-aware libraries. Historical DST rules are inconsistent — the US changed DST transition dates in 2007, and before 1970 timezone data is unreliable. The browser's reported timezone is the user's *current* timezone, not the timezone of their birth location at the time of birth.

**How to avoid:**
- Use Luxon (which wraps the browser's built-in Intl API) to resolve IANA timezone names. Do not use Moment.js (deprecated).
- Always prompt the user to confirm their birth timezone explicitly, not just birth city. Provide a "Timezone at birth" selector populated from the geocoded location.
- Convert birth time to UTC using the historically accurate IANA zone for the birth location before passing to the ephemeris.
- Treat pre-1970 birth data as low confidence and surface a warning in the UI.
- Never add/subtract raw hours to simulate timezone. Always use IANA-aware date objects.

**Warning signs:**
- Ascendant and house cusps are wrong compared to astro.com, but planet signs are correct (planet signs are less time-sensitive than houses)
- Off-by-one-hour errors for US users born near DST transition dates
- Charts for users born before 1970 that cannot be verified against paper records

**Phase to address:**
Phase 1 (Birth data entry and validation). Timezone handling must be locked in before any chart output is shown.

---

### Pitfall 4: ASCII Circle Rendering Distorted by Character Aspect Ratio

**What goes wrong:**
A chart wheel rendered with monospace characters looks like an oval, not a circle. The wheel appears compressed vertically. Planets and house cusps land in visually wrong positions on the ring even though the underlying math is correct.

**Why it happens:**
Monospace font characters are taller than they are wide. A standard terminal character cell is roughly 1:2 (width:height). A circle drawn by placing characters at equal angular increments will appear as a vertical oval because the same number of steps covers more vertical distance than horizontal. Most ASCII art circle tutorials ignore this problem.

**How to avoid:**
- Account for the character cell aspect ratio in the circle-drawing algorithm. For a circle of radius R characters wide, the vertical radius should be approximately R/2 in character rows.
- Use CSS `line-height` tuning to approach square character cells in the browser context, but do not rely on this alone.
- Test the rendered wheel in the actual target font (Courier New, JetBrains Mono, or whichever monospace font the app uses) before finalizing the algorithm.
- Build a standalone circle test before integrating planet placement logic.

**Warning signs:**
- The chart wheel appears as an obvious oval when you look at it in a browser
- Planet positions that should be "across from each other" (opposition) are not visually opposite on the wheel

**Phase to address:**
Phase 2 (ASCII chart rendering). The circle drawing algorithm must be validated visually before any planet placement is added.

---

### Pitfall 5: Planet Placement on the ASCII Wheel Uses Wrong Angular Mapping

**What goes wrong:**
Planets placed on the chart wheel appear in the wrong house or sign segment. The wheel looks correct as a circle but the 360-degree-to-character-position mapping has an offset error or direction reversal. A planet at 0 degrees Aries (the vernal equinox, typically placed at the 9 o'clock position in Western charts with Ascendant on the left) lands at the wrong spot.

**Why it happens:**
The mapping from ecliptic longitude (0-360 degrees) to a position on a character grid requires careful orientation. The Ascendant (1st house cusp) goes on the left, the chart rotates counterclockwise through signs, and the coordinate system of a character grid (origin top-left, y increases downward) doesn't match the counterclockwise mathematical convention. Developers often use the wrong starting angle or direction.

**How to avoid:**
- Establish the coordinate mapping as an explicit, tested function early: `eclipticLongitude -> (x, y) on character grid`.
- Verify with known reference points: Ascendant at 9 o'clock, Midheaven at 12 o'clock, Descendant at 3 o'clock.
- Cross-check planet placement by generating a chart for a well-known birth (public figures whose charts are published on astro.com) and comparing visually.
- Keep the mathematical conversion and the rendering separate so each can be tested independently.

**Warning signs:**
- The Ascendant does not appear on the left side of the wheel
- Planets in the same sign cluster visually appear in different zodiac segments
- Opposition aspects (180 degrees apart) don't look across from each other

**Phase to address:**
Phase 2 (ASCII chart rendering). The angle-to-grid mapping must be tested before the chart is considered functionally correct.

---

### Pitfall 6: Geocoding City Names Has No Offline Fallback

**What goes wrong:**
The app calls a third-party geocoding API to convert "Boston" to latitude/longitude/timezone. If the API is down, rate-limited, or the user is offline, the birth data entry flow breaks entirely. The user cannot proceed. Since this is a browser-only app with no backend, there is no retry queue.

**Why it happens:**
Geocoding is assumed to be a trivial lookup. Developers wire in a free API without considering failure modes, rate limits, or network unavailability. Many free geocoding APIs have rate limits of 100-2500 requests per day, which is fine for a small user base but fails silently if the limit is hit.

**How to avoid:**
- Cache geocoding results in localStorage keyed by city name. A city entered once never needs to be re-geocoded.
- Provide a manual coordinate entry fallback: "City not found? Enter latitude, longitude, and UTC offset manually."
- Use a geocoding API with a permissive free tier (Nominatim/OpenStreetMap is free with no hard daily limit for low-volume apps).
- Store the full location object (city, country, lat, lon, timezone name) in localStorage alongside chart data.

**Warning signs:**
- Birth entry form hangs on the city lookup step with no visible spinner or error
- Users in rural areas or small towns whose city is not in the geocoder's database get stuck

**Phase to address:**
Phase 1 (Birth data entry). The geocoding fallback must be part of the initial form implementation.

---

### Pitfall 7: localStorage Data Lost on Browser Clear With No Warning

**What goes wrong:**
A user has 10 saved charts. They clear browser data or use a private window and all charts vanish. The app shows an empty "who are you?" screen with no explanation. The data is permanently gone.

**Why it happens:**
localStorage is treated as persistent storage when it is actually ephemeral. Browsers clear it on "clear site data" actions. Private/incognito windows have a separate localStorage that disappears when the window closes. The app has no backup mechanism because there is no server.

**How to avoid:**
- Show a clear data warning in the UI: "Your charts are saved in this browser. Clearing browser data will delete them."
- Provide a JSON export button so users can save their data externally.
- On first load, detect if the storage is empty and show a recovery option ("Import saved data").
- Catch `QuotaExceededError` on every `localStorage.setItem()` call and show a meaningful message rather than silently failing.

**Warning signs:**
- Users reporting "all my charts disappeared" after clearing browser cache
- App silently fails to save new entries when localStorage is full

**Phase to address:**
Phase 1 (Data persistence). Export/import and error handling should be built alongside initial storage logic, not deferred.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding orb values for aspects | Faster to build | Can't tune for accuracy; different astrologers use different orbs | Never — use named constants from the start |
| Using `new Date()` for timezone math | Avoids library dependency | Silently wrong for DST and historical dates | Never for birth data |
| Skipping ephemeris data file verification test | Faster to ship | Charts may be subtly wrong; hard to debug later | Never — add one test calculation in Phase 1 |
| Inline ASCII rendering logic mixed with calculation | Simpler file structure | Untestable; rendering and math become coupled | Only for a throwaway prototype, not the real build |
| Treating localStorage as always available | Simpler code | Crashes in private browsing; data loss with no warning | Never — wrap all storage calls in try/catch |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Swiss Ephemeris WASM | Calling calculation functions before awaiting module init | Expose an init() promise; all code awaits it before calling swe_* functions |
| Swiss Ephemeris WASM | Forgetting to call `swe_close()` after calculations | Call swe_close() in a cleanup function; call it when the app unloads |
| Swiss Ephemeris WASM | Serving `.wasm` file as wrong MIME type | Configure server/bundler to serve `.wasm` as `application/wasm` |
| Geocoding API | No error handling when API is offline | Always have a manual lat/lon fallback input |
| Geocoding API | Not caching results | Cache in localStorage keyed by normalized city+country string |
| Luxon/date-fns-tz | Using `DateTime.local()` for birth time | Use `DateTime.fromObject(..., { zone: 'America/New_York' })` with the birth city's IANA zone |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-initializing WASM on every chart view | Noticeable lag (500ms+) on navigation between people | Initialize once at app start, keep the module in memory | Every chart render |
| Recalculating full chart on every keystroke in the date field | UI feels unresponsive when typing birth year | Debounce the calculation trigger; only recalculate on blur or explicit submit | Any date input interaction |
| Loading all three .se1 data files upfront regardless of date range | Slow initial page load (files are large) | Use the moshier embedded ephemeris for planet calculations; it covers 3000 BCE to 3000 CE with no external files | First page load on slow connections |
| Rendering ASCII wheel every time any data changes | Jank during transit date picker interaction | Separate natal chart render (static) from transit overlay render (reactive) | Transit date picker interactions |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing birth data in localStorage without user awareness | Data visible to any other script on the same origin; unexpected exposure if origin is shared | Show a storage disclosure on first use; do not store more than name + birth data |
| Importing geocoding API keys in client-side code | API key exposed in browser source; key gets rate-limited or billed by scrapers | Use only free/keyless geocoding APIs (Nominatim) for a browser-only app with no backend |
| No data export mechanism | User has no copy of their data; data loss is permanent | Build JSON export from the start |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Not confirming timezone at birth entry | Charts are silently wrong for users born near DST transitions | After city entry, show the resolved timezone and ask "Is this correct?" |
| No "birth time unknown" option | Users without birth times cannot use the app | Add a "time unknown" checkbox that defaults to noon and shows houses as approximate |
| ASCII wheel with no sign labels | Users cannot orient themselves on the wheel | Mark the 12 zodiac sign boundaries with their glyphs or abbreviations around the ring |
| Empty state shows nothing when localStorage is cleared | Users think the app is broken | Show a welcoming "First time? Let's add someone." prompt when no data exists |
| Transit date picker that accepts any input without validation | Users type invalid dates; app silently shows wrong positions | Validate date on blur; show the calculated transit date clearly |

---

## "Looks Done But Isn't" Checklist

- [ ] WASM initialization: Verify with a known reference calculation (Sun at 0 Aries equinox) before calling it done
- [ ] Timezone handling: Test a birth in New York in July (EDT) vs January (EST) and confirm the Ascendant changes by the correct amount
- [ ] ASCII circle: View the wheel in the actual browser font and confirm it looks round, not oval
- [ ] Planet placement: Generate a chart for a known public figure and compare house placements against astro.com
- [ ] Aspects table: Verify that a Sun-Moon opposition (180 degrees) is detected and a wide Sun-Moon semi-sextile (30 degrees) is not included unless intended
- [ ] localStorage persistence: Close and reopen the browser tab and confirm all saved people are still listed
- [ ] Quota handling: Fill localStorage to near-capacity and confirm the app shows a graceful error, not a white screen
- [ ] Geocoding fallback: Disconnect from the internet and confirm the manual lat/lon entry path works
- [ ] Transit overlay: Verify that transit planet positions for today match the current planetary positions on astro.com within a reasonable margin
- [ ] Placidus houses: Test a chart for a birth in Iceland or Norway (latitude ~65N) and confirm the app does not crash or show garbage house cusps

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| WASM not initializing in production | MEDIUM | Add explicit MIME type config to host; verify .wasm file is served; add console logging to init sequence |
| Ephemeris data files missing from build | LOW | Copy .se1 files to public directory; add build check to verify they are present |
| Timezone errors discovered post-ship | HIGH | Requires re-entry of birth data by users; add a "recalculate with confirmed timezone" flow |
| ASCII wheel is an oval (aspect ratio bug) | LOW | Adjust the radius calculation constants; does not require data changes |
| localStorage data loss reported by user | HIGH | No recovery possible for lost data; add export function immediately as mitigation |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| WASM async initialization | Phase 1: Core calculation engine | Test Sun position for J2000 epoch against known value before proceeding |
| Ephemeris .se1 data files missing | Phase 1: Core calculation engine | Reference test against astro.com for 3+ different birth dates |
| Timezone/DST errors in birth data | Phase 1: Birth data entry | Test summer vs. winter birth in same US city; Ascendant must differ correctly |
| ASCII circle aspect ratio distortion | Phase 2: Chart wheel rendering | View wheel in browser; confirm visual circle, not oval |
| Planet placement angular mapping | Phase 2: Chart wheel rendering | Generate known chart; compare planet positions visually against astro.com |
| Geocoding offline failure | Phase 1: Birth data entry | Disable network in DevTools; confirm manual fallback is reachable |
| localStorage data loss and quota | Phase 1: Data persistence | Test QuotaExceededError path; test private window behavior |
| Placidus failure at high latitudes | Phase 2: Chart calculation | Test with a birth in Reykjavik, Iceland (64N) |

---

## Sources

- [How to Use Swiss Ephemeris Wasm Module (Oreate AI)](https://www.oreateai.com/blog/how-to-use-swiss-ephemeris-wasm-module/)
- [sweph-wasm GitHub (u-blusky)](https://github.com/u-blusky/sweph-wasm)
- [swisseph-wasm GitHub (prolaxu)](https://github.com/prolaxu/swisseph-wasm)
- [ASCII Characters Are Not Pixels: A Deep Dive into ASCII Rendering (Alex Harri)](https://alexharri.com/blog/ascii-rendering)
- [Notes on Monospace, Fonts, ASCII, Unicode (wonger.dev)](https://wonger.dev/posts/monospace-dump)
- [Astrology API Integration Guide 2026 (astrology-api.io)](https://astrology-api.io/blog/astrology-api-integration-step-by-step-guide)
- [Astro.com FAQ: Timezones](https://www.astro.com/faq/fq_de_timezone_e.htm)
- [Placidus at High Latitudes (Skyscript Forum)](https://skyscript.co.uk/forums/viewtopic.php?t=10030)
- [CircularNatalHoroscopeJS GitHub](https://github.com/0xStarcat/CircularNatalHoroscopeJS)
- [Storage Quotas and Eviction Criteria (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Handling localStorage Errors (mmazzarolo.com)](https://mmazzarolo.com/blog/2022-06-25-local-storage-status/)
- [Luxon Timezone Zones Documentation](https://github.com/moment/luxon/blob/master/docs/zones.md)
- [SwissEph Download Page (Astrodienst)](https://www.astro.com/swisseph/swedownload_e.htm)

---
*Pitfalls research for: browser-based astrology birth chart app (Gachi Pachi)*
*Researched: 2026-03-19*
