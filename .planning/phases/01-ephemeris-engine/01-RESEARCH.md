# Phase 1: Ephemeris Engine - Research

**Researched:** 2026-03-19
**Domain:** Swiss Ephemeris WASM, geocoding, timezone resolution, birth data validation
**Confidence:** HIGH (ephemeris API confirmed from source, versions verified on npm, geocoding options verified live)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Modern (moderate) orb system: 6 degrees for conjunction/opposition, 5 for trine/square, 3 for sextile/quincunx
- Sun and Moon get +2 degrees wider orbs than other planets
- 6 aspects: conjunction (0), sextile (60), square (90), trine (120), quincunx (150), opposition (180)
- Show exact orb value with each aspect (e.g. "Moon trine Venus (2.3 degrees)")
- Calculate positions for Chiron and North Node alongside the 10 main planets (for future use, not displayed in v1)
- Primary geocoding: Claude's discretion on which online geocoding service works best from browser
- Fallback: Bundled offline city database (~4,000 cities with 100K+ population, ~200KB)
- Last resort: Manual lat/lon/timezone entry if city not found in bundled database
- IANA timezone name storage: Claude's discretion

### Claude's Discretion

- Choice of primary geocoding API (Nominatim vs Geoapify vs other)
- Whether to store IANA timezone name or UTC offset per person
- Birth data validation edge cases (unknown birth time handling, ambiguous city disambiguation)
- JSON output structure and field naming
- Test validation strategy for verifying calculation accuracy against astro.com

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CALC-01 | User can enter birth date (day/month/year), time, city, and country | Birth data schema defined in Architecture research; TypeScript types established here become downstream contract |
| CALC-02 | App geocodes city/country to latitude, longitude, and IANA timezone | Photon API (photon.komoot.io) confirmed for lat/lon; @photostructure/tz-lookup confirmed for IANA from lat/lon |
| CALC-03 | Manual lat/lon/timezone fallback if geocoding fails or is offline | cities.json (CC-BY-3.0, GeoNames-based) recommended for bundled fallback; manual entry as last resort |
| CALC-04 | Swiss Ephemeris WASM calculates positions for all 10 planets (Sun through Pluto) | swisseph-wasm 0.0.5 confirmed on npm, calc_ut() API verified, planet constants SE_SUN through SE_PLUTO confirmed |
| CALC-05 | Placidus house cusps calculated from birth data | houses(jd, lat, lon, 'P') confirmed; cusps[1..12] and ascmc[0]=ascendant, ascmc[1]=MC verified from Swiss Ephemeris source |
| CALC-06 | Aspect calculations for 6 major aspects with standard orbs | Custom post-calculation logic; orb constants locked by user; Sun/Moon +2 degree modifier documented |
| CALC-07 | Structured JSON data output of all chart data (AI-readable) | ChartData interface defined; JSON serialization from TypeScript types is trivial |

</phase_requirements>

---

## Summary

Phase 1 builds the pure calculation layer: birth data input, city-to-coordinates geocoding with IANA timezone resolution, Swiss Ephemeris planetary positions, Placidus house cusps, aspect detection, and structured JSON output. No UI. All other phases consume this layer's output types.

The key technical decisions for this phase are: (1) use Photon (photon.komoot.io) as the primary geocoder -- it is free, no API key required, and returns CORS-accessible responses from browser JavaScript, unlike Nominatim which blocks on HTTP 403/429 without CORS headers; (2) pair Photon with @photostructure/tz-lookup (72KB, offline, browser-compatible) to resolve IANA timezone from lat/lon without any API call; (3) swisseph-wasm 0.0.5 embeds all ephemeris data in a single `swisseph.data` file (11.5MB) -- no separate .se1 files to serve, but Vite must be configured to exclude swisseph-wasm from dependency optimization.

The swisseph-wasm package was published 2026-02-25 (3 weeks ago at research date) and resolves correctly on npm. The prior research risk of the 403 npm page is resolved.

**Primary recommendation:** Use Photon + @photostructure/tz-lookup for geocoding/timezone. Store IANA timezone name (not UTC offset) in the Person record -- IANA names correctly handle DST for all historical dates; raw UTC offsets do not.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| swisseph-wasm | 0.0.5 | Swiss Ephemeris planetary calculations in browser | Only zero-dependency Swiss Ephemeris WASM for direct browser use. Embeds WASM + data. GPL-3.0. Published 2026-02-25. |
| @photostructure/tz-lookup | 11.5.0 | IANA timezone from lat/lon, offline, in browser | 72KB, no API key, browser-compatible, CC0 license. Published 2026-03-12. 10x smaller than geo-tz. |
| luxon | 3.7.2 | Birth time + IANA zone to UTC Julian Day | The standard replacement for Moment.js. IANA-aware date math. Handles DST correctly for historical dates. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cities.json | 1.1.50 | Bundled city fallback (~200KB subset) | When Photon API is unavailable or returns no match. Filter to 100K+ population at build time to hit ~200KB target. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Photon (komoot) | Nominatim (openstreetmap.org) | Nominatim blocks with 403/429 without CORS headers. Photon has CORS enabled. Photon is the better choice. |
| Photon (komoot) | Geoapify | Geoapify requires an API key (even free tier), which gets embedded in browser bundle. Avoid. |
| @photostructure/tz-lookup | geo-tz | geo-tz is 892KB and not intended for browser use. tz-lookup is 72KB and browser-compatible. |
| luxon | date-fns-tz | Both work. Luxon is more commonly cited in ephemeris integration examples. Either is fine; pick one and use it consistently. |

**Installation:**
```bash
# Project scaffold (run first)
npm create vite@latest gachi-pachi -- --template vanilla-ts
cd gachi-pachi

# Core calculation
npm install swisseph-wasm

# Timezone and geocoding
npm install @photostructure/tz-lookup luxon
npm install --save-dev @types/luxon

# Bundled city fallback
npm install cities.json

# Test framework
npm install --save-dev vitest
```

**Version verification (confirmed 2026-03-19):**
- swisseph-wasm: 0.0.5 (npm, published 2026-02-25)
- @photostructure/tz-lookup: 11.5.0 (npm, published 2026-03-12)
- luxon: 3.7.2 (npm)
- cities.json: 1.1.50 (npm)
- vitest: 4.1.0 (npm)

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope only)

```
src/
├── engine/
│   ├── types.ts          # ChartData, Person, PlanetPosition, HouseCusp, Aspect
│   ├── ephemeris.ts      # swisseph-wasm wrapper (init, calc_ut, houses, julday)
│   ├── aspects.ts        # Aspect detection logic (pure function, no WASM dependency)
│   └── houses.ts         # Planet-to-house assignment helpers
│
├── geocoding/
│   ├── photon.ts         # Photon API call + response parsing
│   ├── fallback.ts       # cities.json lookup for offline use
│   └── timezone.ts       # @photostructure/tz-lookup wrapper
│
├── store/
│   └── persistence.ts    # localStorage CRUD for Person profiles
│
└── main.ts               # Entry point: WASM init, scaffold only in Phase 1
```

### Pattern 1: WASM Singleton with Init Promise

**What:** Initialize swisseph-wasm once at app start. All code that needs ephemeris functions awaits this promise before calling any `swe.*` method.

**When to use:** Every place that calls `calc_ut`, `houses`, or `julday` -- which is all of `engine/ephemeris.ts`.

**Example:**
```typescript
// engine/ephemeris.ts
// Source: swisseph-wasm README + src/swisseph.js analysis

import SwissEph from 'swisseph-wasm';

let sweInstance: InstanceType<typeof SwissEph> | null = null;
let initPromise: Promise<void> | null = null;

export async function initEphemeris(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    sweInstance = new SwissEph();
    await sweInstance.initSwissEph();
  })();
  return initPromise;
}

export function getSwe(): InstanceType<typeof SwissEph> {
  if (!sweInstance) throw new Error('Ephemeris not initialized. Call initEphemeris() first.');
  return sweInstance;
}
```

### Pattern 2: Geocode-then-Timezone Pipeline

**What:** Geocoding and timezone resolution are separate steps. Photon returns lat/lon. @photostructure/tz-lookup converts lat/lon to IANA timezone name. Luxon converts birth datetime + IANA name to UTC Julian Day.

**When to use:** At birth data entry. Called once per person, result stored in localStorage.

**Example:**
```typescript
// geocoding/photon.ts
export async function geocodeCity(city: string, country: string): Promise<{lat: number, lon: number} | null> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(city + ' ' + country)}&limit=1&layer=city`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.features?.length) return null;
  const [lon, lat] = data.features[0].geometry.coordinates;
  return { lat, lon };
}

// geocoding/timezone.ts
import tzlookup from '@photostructure/tz-lookup';
export function ianaTimezone(lat: number, lon: number): string {
  return tzlookup(lat, lon);
}

// Convert birth datetime to UTC for Julian Day
import { DateTime } from 'luxon';
export function birthToJulianDay(
  date: string,    // "YYYY-MM-DD"
  time: string,    // "HH:MM"
  ianaZone: string
): number {
  const dt = DateTime.fromISO(`${date}T${time}`, { zone: ianaZone }).toUTC();
  const swe = getSwe();
  return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60);
}
```

### Pattern 3: Aspect Detection as Pure Function

**What:** After WASM returns all planet longitudes, aspect detection is pure math. No WASM call needed. This keeps aspects testable without a WASM environment.

**When to use:** After assembling `PlanetPosition[]` from WASM output.

**Orb rules (locked by user):**
```typescript
// engine/aspects.ts
const BASE_ORBS: Record<number, number> = {
  0: 6,    // conjunction
  60: 3,   // sextile
  90: 5,   // square
  120: 5,  // trine
  150: 3,  // quincunx
  180: 6,  // opposition
};
const LUMINARY_BONUS = 2; // +2 degrees for Sun and Moon
const LUMINARIES = new Set(['Sun', 'Moon']);

function allowedOrb(aspectDegrees: number, p1: string, p2: string): number {
  const base = BASE_ORBS[aspectDegrees];
  const bonus = (LUMINARIES.has(p1) || LUMINARIES.has(p2)) ? LUMINARY_BONUS : 0;
  return base + bonus;
}
```

### Pattern 4: IANA Zone Storage (not UTC offset)

**What:** Store the IANA timezone name (e.g., `"America/New_York"`) in the Person record. Never store a raw UTC offset like `-5`.

**Why this matters:** UTC offsets are static. IANA zone names encode the full DST history. A person born in New York in July was UTC-4 (EDT), not UTC-5 (EST). Storing the zone name and re-computing the offset at calculation time is always correct. Storing `-5` is wrong for half the year.

```typescript
interface Person {
  id: string;
  name: string;
  birthDate: string;     // "YYYY-MM-DD"
  birthTime: string;     // "HH:MM" or null for unknown
  birthCity: string;
  birthCountry: string;
  lat: number;
  lon: number;
  ianaTimezone: string;  // e.g., "America/New_York" -- NOT a raw UTC offset
  usageCount: number;
  lastUsed: number;
}
```

### Anti-Patterns to Avoid

- **Calling calc_ut before initSwissEph resolves:** Silent blank chart. No visible error. Enforce via the getSwe() guard that throws if not initialized.
- **Storing UTC offset instead of IANA name:** Wrong charts for DST transitions and pre-1970 dates. Always store the zone name.
- **Geocoding without offline fallback:** If Photon is unreachable, birth entry is blocked. Always route through the fallback chain: Photon -> cities.json -> manual entry.
- **Caching ChartData in localStorage:** Ephemeris recalculation is fast (<100ms). Caching couples storage schema to calculation output. Store only Person records.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IANA timezone from lat/lon | Custom lat/lon to timezone polygon lookup | @photostructure/tz-lookup | Timezone boundaries are irregular polygons. The lookup data is 72KB. Rolling this is a multi-day project with edge cases near borders. |
| DST-aware date math | Manual UTC offset arithmetic | luxon with IANA zone | DST transition rules vary by country and change over time. The US changed rules in 2007. Manual math silently produces wrong Julian Days for historical dates. |
| WASM binary loading | Custom fetch + WebAssembly.instantiate | swisseph-wasm's initSwissEph() | WASM loading has environment-specific quirks (Node vs browser, MIME type, streaming vs buffered). The library handles this. |
| City-to-lat/lon database | Custom city database | cities.json (filtered) | The GeoNames database has 50+ years of editorial effort. Hand-curating a fallback is unnecessary when a CC-licensed package exists. |

**Key insight:** The hardest correctness problem in this phase is timezone/DST accuracy. Every hour of offset error shifts the Ascendant by 15 degrees. Use libraries with IANA zone databases; don't do date math manually.

---

## Common Pitfalls

### Pitfall 1: WASM Initialization Race Condition

**What goes wrong:** `swe.calc_ut()` is called before `initSwissEph()` resolves. The function doesn't exist yet and throws (or returns garbage) silently.

**Why it happens:** JavaScript developers expect npm imports to be synchronous. WASM requires async binary loading.

**How to avoid:** Single `initEphemeris()` function called in `main.ts` before any chart calculation. Downstream code calls `getSwe()` which throws a clear error if called too early -- better than silent garbage output.

**Warning signs:** "swe_calc_ut is not a function", all planets at 0 degrees, works in dev but fails in production.

### Pitfall 2: Vite Dependency Optimizer Breaks swisseph-wasm

**What goes wrong:** Vite's dependency optimizer (esbuild-based) processes swisseph-wasm and breaks the `import.meta.url` path that locates `swisseph.data` and `swisseph.wasm`. The WASM module loads but the data file is not found, so calculations silently fall back to lower precision or fail.

**Why it happens:** swisseph-wasm uses `new URL('./wasm/swisseph.data', import.meta.url)` to locate the data file at runtime. Vite's optimizer rewrites module paths and breaks this relative URL.

**How to avoid:** Add to `vite.config.ts`:
```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['swisseph-wasm']
  },
  server: {
    fs: { allow: ['..'] }
  }
})
```

**Warning signs:** WASM initializes without error but planet positions are wrong (slightly off from reference), or console shows data file fetch errors.

### Pitfall 3: Nominatim CORS Errors

**What goes wrong:** Using Nominatim (nominatim.openstreetmap.org) as the primary geocoder. Nominatim sends CORS headers only with successful responses -- when rate-limited (HTTP 429) or blocked (HTTP 403), no CORS headers are sent, so the browser blocks the response as a CORS error. The user sees a geocoding failure that looks like a network error.

**Why it happens:** The Nominatim public instance is heavily used and aggressively rate-limits browser clients.

**How to avoid:** Use Photon (photon.komoot.io) instead. It is built on OpenStreetMap data, free, no API key, and is confirmed to serve CORS headers. Photon is the correct primary geocoder for this project.

**Warning signs:** Intermittent geocoding failures, "CORS policy" errors in browser console, failures that correlate with high-traffic periods.

### Pitfall 4: Timezone DST Error Produces Silently Wrong Ascendant

**What goes wrong:** User born in New York in July (EDT, UTC-4) but the app uses the winter offset (EST, UTC-5). The Julian Day passed to the ephemeris is off by 1 hour. The Ascendant shifts 15 degrees. The chart looks plausible but is wrong.

**Why it happens:** Using `new Date()` or hardcoded UTC offset instead of IANA-aware date resolution.

**How to avoid:** Use luxon with the IANA zone name stored on the Person record. `DateTime.fromISO(dateTime, { zone: ianaZone }).toUTC()` always returns the historically correct UTC equivalent.

**Warning signs:** Ascendant and house cusps are wrong vs astro.com reference, but planet signs are correct (planets change signs over days; houses change over minutes of time).

### Pitfall 5: Placidus Calculation Failure at High Latitudes

**What goes wrong:** `swe.houses(jd, lat, lon, 'P')` returns garbage cusps for births above approximately 60 degrees north or south. Placidus relies on the horizon intersecting ecliptic planes, which fails near the poles.

**Why it happens:** The Placidus algorithm is mathematically undefined at high latitudes. The Swiss Ephemeris library falls back to Porphyry houses automatically when this occurs, returning SweConst.ERR (-1) as the function return value.

**How to avoid:** Check the return value of `houses()`. If it indicates an error, surface a warning: "Placidus houses cannot be calculated for this birth location. Consider using Whole Sign houses (v2 feature)." For the Reykjavik test case (64N), verify the error is caught and handled gracefully rather than displaying garbage cusps.

**Warning signs:** House cusps at irregular intervals, multiple cusps at the same degree, no error thrown but cusps look obviously wrong.

---

## Code Examples

Verified patterns from source analysis and official Swiss Ephemeris documentation:

### Full Planet Calculation

```typescript
// Source: swisseph-wasm QUICK_REFERENCE.md + src/swisseph.js analysis
import { initEphemeris, getSwe } from './engine/ephemeris';
import { DateTime } from 'luxon';

const PLANETS = [
  { id: 0, name: 'Sun' },
  { id: 1, name: 'Moon' },
  { id: 2, name: 'Mercury' },
  { id: 3, name: 'Venus' },
  { id: 4, name: 'Mars' },
  { id: 5, name: 'Jupiter' },
  { id: 6, name: 'Saturn' },
  { id: 7, name: 'Uranus' },
  { id: 8, name: 'Neptune' },
  { id: 9, name: 'Pluto' },
  { id: 11, name: 'NorthNode' }, // True Node
  { id: 15, name: 'Chiron' },
];

await initEphemeris();
const swe = getSwe();

const jd = swe.julday(1990, 6, 15, 14.5); // June 15, 1990, 14:30 UT

for (const { id, name } of PLANETS) {
  const result = swe.calc_ut(jd, id, 2); // flag 2 = SEFLG_SWIEPH
  const longitude = result[0]; // 0-360 ecliptic degrees
  const speed = result[3];     // degrees/day; negative = retrograde
  const isRetrograde = speed < 0;
}
```

### Placidus Houses

```typescript
// Source: swisseph-wasm src/swisseph.js + Swiss Ephemeris ascmc documentation
const lat = 40.7128;  // New York
const lon = -74.0060;
const result = swe.houses(jd, lat, lon, 'P'); // 'P' = Placidus

// cusps[0] is unused; cusps[1..12] are house 1..12 longitudes
const houseCusps = Array.from(result.cusps).slice(1, 13);

// ascmc indices (Swiss Ephemeris standard):
const ascendant = result.ascmc[0];  // Ascendant longitude
const midheaven = result.ascmc[1];  // MC (Midheaven) longitude
// ascmc[2] = ARMC, ascmc[3] = Vertex, etc.
```

### Geocoding Pipeline

```typescript
// Source: Photon API (photon.komoot.io) -- verified live 2026-03-19
// Source: @photostructure/tz-lookup v11.5.0 README
import tzlookup from '@photostructure/tz-lookup';

async function resolveLocation(city: string, country: string) {
  // Step 1: Photon geocoding (no API key, CORS-enabled)
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(city + ' ' + country)}&limit=3&layer=city`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Photon unavailable');

  const data = await res.json();
  if (!data.features?.length) return null;

  const feature = data.features[0];
  const [lon, lat] = feature.geometry.coordinates;

  // Step 2: Offline IANA timezone lookup from coordinates
  const ianaTimezone = tzlookup(lat, lon);

  return { lat, lon, ianaTimezone };
}
```

### Degree-to-Sign Conversion

```typescript
// Standard astrological convention (no library needed)
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
               'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { sign: SIGNS[signIndex], degree };
}
```

### Aspect Detection

```typescript
// engine/aspects.ts -- pure function, no WASM dependency
const ASPECT_ANGLES = [0, 60, 90, 120, 150, 180];
const BASE_ORBS: Record<number, number> = { 0:6, 60:3, 90:5, 120:5, 150:3, 180:6 };
const LUMINARIES = new Set(['Sun', 'Moon']);

function detectAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i], p2 = planets[j];
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const angle of ASPECT_ANGLES) {
        const orb = Math.abs(diff - angle);
        const luminaryBonus = (LUMINARIES.has(p1.planet) || LUMINARIES.has(p2.planet)) ? 2 : 0;
        const maxOrb = BASE_ORBS[angle] + luminaryBonus;
        if (orb <= maxOrb) {
          aspects.push({ planet1: p1.planet, planet2: p2.planet,
                         type: ASPECT_NAMES[angle], orb, isApplying: false });
        }
      }
    }
  }
  return aspects;
}
```

### ChartData JSON Output (CALC-07)

```typescript
// The JSON output is the TypeScript object serialized with JSON.stringify
// No special serialization library needed

interface ChartData {
  person: Person;
  calculatedAt: string;    // ISO timestamp
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: number;
  midheaven: number;
}

// AI-readable output: JSON.stringify(chartData, null, 2)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Serving separate .se1 files | swisseph-wasm bundles swisseph.data (11.5MB) | v0.0.5 (2026-02-25) | No need to copy .se1 files to /public/ephe/. The data file is served via import.meta.url automatically. |
| Moment.js for timezone | Luxon with IANA zones | ~2021 (Moment.js deprecated) | Luxon is the correct replacement. Moment.js is frozen/deprecated. |
| Nominatim as default browser geocoder | Photon (komoot) for browser use | Ongoing CORS issue with Nominatim | Nominatim CORS failures are a known, unresolved problem. Photon is the practical browser-safe alternative. |
| geo-tz for browser timezone lookup | @photostructure/tz-lookup | geo-tz never supported browser well | tz-lookup is 72KB vs geo-tz 892KB, browser-compatible, CC0. |

**Deprecated/outdated:**
- Moment.js: Do not use. Use Luxon.
- Serving .se1 files in /public/ephe/: Not needed with swisseph-wasm 0.0.5 which bundles swisseph.data internally.
- Nominatim as primary browser geocoder: CORS issues make it unreliable. Use Photon.

---

## Open Questions

1. **Photon API rate limits and reliability**
   - What we know: Photon is free, no API key, and is the public demo server run by komoot. It is used in production by various open-source projects.
   - What's unclear: Rate limits are not formally published. For a personal-use app with geocoding cached in localStorage after first use, this is unlikely to matter.
   - Recommendation: Cache geocoding results in localStorage keyed by normalized `${city}|${country}`. The same city will never be geocoded twice per browser.

2. **swisseph.data file size and initial load**
   - What we know: The swisseph.data file is 11.52MB. It is loaded by the WASM module via import.meta.url on first init.
   - What's unclear: Whether Vite bundles this file inline or serves it as a separate asset. It should be served as a separate static asset (Vite's default for large binary files) and cached by the browser.
   - Recommendation: Verify in dev that the file is fetched once and cached. Add a loading indicator in the UI during WASM init. The init is a one-time cost per browser session.

3. **Photon multi-result disambiguation**
   - What we know: "Springfield" is a valid city in many US states. Photon returns up to N results with city + country + state fields.
   - What's unclear: How to present disambiguation in a terminal-style UI without breaking the typed-prompt flow.
   - Recommendation: If Photon returns multiple results for the same city name and country, surface up to 3 options with state/region as disambiguation. This is a CALC-01 edge case the planner should handle in the onboarding flow.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | vitest.config.ts (none yet -- Wave 0 gap) |
| Quick run command | `npx vitest run src/engine` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CALC-01 | Birth date/time/city/country validates correctly | unit | `npx vitest run src/engine/types.test.ts` | Wave 0 |
| CALC-02 | Geocoding returns lat/lon + IANA timezone from city name | integration | `npx vitest run src/geocoding/photon.test.ts` | Wave 0 |
| CALC-03 | Manual fallback returns correct values when Photon unavailable | unit | `npx vitest run src/geocoding/fallback.test.ts` | Wave 0 |
| CALC-04 | Sun position for J2000 epoch (2000-01-01 12:00 UTC) matches reference | unit | `npx vitest run src/engine/ephemeris.test.ts` | Wave 0 |
| CALC-05 | Ascendant and Midheaven match astro.com reference for known chart | unit | `npx vitest run src/engine/ephemeris.test.ts` | Wave 0 |
| CALC-06 | Aspect detection finds Sun-Moon opposition within orb | unit | `npx vitest run src/engine/aspects.test.ts` | Wave 0 |
| CALC-06 | Orb rules: Sun gets +2 degree luminary bonus | unit | `npx vitest run src/engine/aspects.test.ts` | Wave 0 |
| CALC-07 | ChartData serializes to valid JSON with all required fields | unit | `npx vitest run src/engine/chart.test.ts` | Wave 0 |
| CALC-05 | Reykjavik (64N) Placidus edge case handled gracefully without crash | unit | `npx vitest run src/engine/ephemeris.test.ts` | Wave 0 |

### Known Reference Chart for Validation

Use this as the ground truth for CALC-04 and CALC-05 accuracy tests. Source: astro.com (public data).

**Test case: Albert Einstein**
- Birth: 1879-03-14, 11:30 AM LMT (local mean time), Ulm, Germany (48N24, 9E59)
- Expected Sun: ~23 Pisces
- Expected Moon: ~14 Sagittarius
- Expected Ascendant: ~11 Cancer

**Test case: Reykjavik edge case**
- Use any date with lat=64.15, lon=-21.94 (Reykjavik, Iceland)
- Expected: houses() returns error indicator; app handles gracefully without crash

### Sampling Rate

- Per task commit: `npx vitest run src/engine`
- Per wave merge: `npx vitest run`
- Phase gate: Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/engine/ephemeris.test.ts` -- covers CALC-04, CALC-05 (planetary positions + houses)
- [ ] `src/engine/aspects.test.ts` -- covers CALC-06 (aspect detection + orb rules)
- [ ] `src/engine/chart.test.ts` -- covers CALC-07 (ChartData JSON output)
- [ ] `src/geocoding/photon.test.ts` -- covers CALC-02 (geocoding integration)
- [ ] `src/geocoding/fallback.test.ts` -- covers CALC-03 (offline fallback)
- [ ] `vitest.config.ts` -- vitest configuration with jsdom environment
- [ ] Framework install: `npm install --save-dev vitest` -- if not already present

---

## Sources

### Primary (HIGH confidence)

- swisseph-wasm npm registry (registry.npmjs.org/swisseph-wasm) -- version 0.0.5, published 2026-02-25, confirmed resolves on npm (prior 403 risk resolved)
- github.com/prolaxu/swisseph-wasm/blob/main/src/swisseph.js -- confirmed houses() return structure, initSwissEph() pattern, import.meta.url usage for data file location
- github.com/prolaxu/swisseph-wasm README.md -- confirmed Vite config requirements (optimizeDeps.exclude, assetsInclude)
- cdn.jsdelivr.net/npm/swisseph-wasm@0.0.5/wasm/ -- confirmed swisseph.data (11.52MB), swisseph.wasm (531KB), no separate .se1 files
- npm view @photostructure/tz-lookup -- version 11.5.0, published 2026-03-12, CC0-1.0, no dependencies
- npm view luxon -- version 3.7.2 confirmed
- photon.komoot.io/api/?q=New+York -- live test confirmed GeoJSON response with coordinates, no timezone field
- Swiss Ephemeris ascmc array documentation (rstub.github.io/swephR/reference/Section13.html) -- confirmed ascmc[0]=ascendant, ascmc[1]=MC

### Secondary (MEDIUM confidence)

- github.com/osm-search/Nominatim/discussions/2488 -- confirmed Nominatim CORS only on successful responses, not on 403/429. CORS issues are a known operational problem.
- WebSearch results for Photon CORS behavior -- CORS enabled on photon.komoot.io confirmed by multiple sources; self-hostable with -cors-any flag

### Tertiary (LOW confidence)

- cities.json npm (1.1.50) -- confirmed exists, CC-BY-3.0, GeoNames-based. Size of filtered 100K+ subset not verified -- build-time filter step will determine actual payload.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified on npm registry 2026-03-19
- WASM API: HIGH -- confirmed from source code analysis of swisseph-wasm/src/swisseph.js
- Geocoding/timezone: HIGH -- Photon API tested live; tz-lookup confirmed on npm
- Architecture: HIGH -- consistent with established ARCHITECTURE.md patterns; no new unknowns
- Pitfalls: HIGH -- Vite optimizeDeps issue confirmed by Vite issue tracker; CORS issue confirmed by Nominatim discussions

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (30 days for stable libraries; swisseph-wasm is actively developed, check for updates)
