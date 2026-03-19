# Architecture Research

**Domain:** Browser-only astrology chart app (terminal aesthetic, WASM calculations, ASCII rendering)
**Researched:** 2026-03-19
**Confidence:** HIGH for component structure and data flow; MEDIUM for ASCII wheel rendering specifics (no prior art for circular ASCII chart wheels in JS -- must be custom-built)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer                                  │
│                                                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │  Screen Router│  │  Screen Views │  │  Input Handler    │    │
│  │  (state mach) │  │  (land/chart/ │  │  (keyboard nav,   │    │
│  │               │  │   transit/etc)│  │   typed input)    │    │
│  └───────┬───────┘  └───────┬───────┘  └─────────┬─────────┘    │
│          │                  │                    │               │
├──────────┴──────────────────┴────────────────────┴──────────────┤
│                       Rendering Layer                            │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────────┐  │
│  │  ASCII Wheel       │  │  Text Panels                       │  │
│  │  Renderer          │  │  (planet table, aspects table,     │  │
│  │  (polar-to-grid,   │  │   transit list, identity header)   │  │
│  │   glyphs, overlay) │  └────────────────────────────────────┘  │
│  └────────────────────┘                                          │
├──────────────────────────────────────────────────────────────────┤
│                       Application State                          │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Active Screen   │  │  Active Chart│  │  UI Cursor / Nav  │  │
│  │  (enum)          │  │  Data        │  │  State            │  │
│  └──────────────────┘  └──────────────┘  └───────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                       Calculation Layer                          │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  Ephemeris Service (Swiss Ephemeris WASM)                  │   │
│  │  - julday() conversion                                     │   │
│  │  - calc_ut() per planet                                    │   │
│  │  - houses() for Placidus cusps                             │   │
│  │  - aspect detection (post-calculation)                     │   │
│  └───────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│                       Persistence Layer                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  localStorage                                             │    │
│  │  Key: "gachi-pachi-people"  Value: JSON array of Person   │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Screen Router | Tracks which screen is active, transitions between screens | Finite state machine with named states (LANDING, ONBOARDING, PERSON_SELECT, CHART, TRANSIT) |
| Input Handler | Captures keydown events, routes to active screen's handler | Single global keydown listener, delegates to current screen |
| ASCII Wheel Renderer | Converts planetary longitude data to a character grid; draws rings, glyphs, degree markers | Custom: convert polar coords to text-grid (x,y), place characters at computed positions |
| Text Panels | Renders tables and lists as fixed-width text blocks | String formatting functions; no DOM framework needed |
| Ephemeris Service | Wraps Swiss Ephemeris WASM; exposes typed async functions for positions, houses, aspects | Thin wrapper around `swisseph-wasm` that returns typed objects |
| Application State | Single source of truth for active screen, active person, active chart data, and nav cursor | Plain JS object with a notify/subscribe pattern; no external library needed |
| Persistence Layer | Read/write Person profiles and usage frequency to localStorage | Module with `loadPeople()`, `savePeople()`, `bumpFrequency()` functions |
| Geocoder / Timezone | Converts city+country input to lat/lon and UTC offset for ephemeris calls | Static lookup or browser-based fetch from a free API (only needed at data entry time) |

## Recommended Project Structure

```
src/
├── engine/               # Calculation -- no DOM, no UI
│   ├── ephemeris.ts      # Swiss Ephemeris WASM wrapper
│   ├── aspects.ts        # Aspect detection logic
│   ├── houses.ts         # Placidus house assignment helpers
│   └── types.ts          # ChartData, PlanetPosition, HouseCusp, Aspect interfaces
│
├── store/                # Application state
│   ├── state.ts          # State shape, mutation functions, subscriber notify
│   └── persistence.ts    # localStorage read/write for Person profiles
│
├── render/               # All rendering -- pure functions: data-in, string-out
│   ├── wheel.ts          # ASCII chart wheel generator
│   ├── tables.ts         # Planet table, aspect table, transit list formatters
│   └── layout.ts         # Split-panel compositor (wheel left, panels right)
│
├── screens/              # One file per screen
│   ├── landing.ts        # Animated landing screen
│   ├── onboarding.ts     # "What's your name?" + birth data entry
│   ├── person-select.ts  # Numbered list of saved people
│   ├── chart.ts          # Natal chart view
│   └── transit.ts        # Transit overlay view
│
├── router.ts             # Screen state machine + transition logic
├── input.ts              # Global keydown listener, delegation to active screen
├── main.ts               # Entry point: init WASM, load state, mount router
└── data/
    └── interpretations.ts # Static reference text for transit interpretations
```

### Structure Rationale

- `engine/`: Pure calculation, zero DOM dependency. This means it can be tested without a browser and swapped later without touching UI code.
- `render/`: Pure functions that take data and return strings. Keeps rendering logic separate from screen logic and makes the ASCII wheel testable in isolation.
- `screens/`: Each screen owns its display logic and its own key handler. The router swaps which screen is active.
- `store/`: Separating state from screens prevents screens from reaching into each other.

## Architectural Patterns

### Pattern 1: Screen State Machine

**What:** The app is modeled as a finite set of screens (states). The router holds the current state and exposes a `transition(event)` function. Screens do not navigate directly -- they emit events (e.g., `PERSON_SELECTED`, `BACK_TO_CHART`) and the router decides what comes next.

**When to use:** Any time the user experience has distinct modes with different key bindings and layouts. This app has at least 5 distinct screens.

**Trade-offs:** Adds a thin abstraction layer. Worth it: prevents screen code from becoming tangled with navigation logic.

**Example:**
```typescript
type Screen = 'LANDING' | 'ONBOARDING' | 'PERSON_SELECT' | 'CHART' | 'TRANSIT';
type Event = 'ENTER' | 'PERSON_SELECTED' | 'NEW_PERSON' | 'SEE_TRANSITS' | 'BACK';

const transitions: Record<Screen, Partial<Record<Event, Screen>>> = {
  LANDING:        { ENTER: 'PERSON_SELECT' },
  PERSON_SELECT:  { PERSON_SELECTED: 'CHART', NEW_PERSON: 'ONBOARDING' },
  ONBOARDING:     { PERSON_SELECTED: 'CHART' },
  CHART:          { SEE_TRANSITS: 'TRANSIT', NEW_PERSON: 'PERSON_SELECT' },
  TRANSIT:        { BACK: 'CHART' },
};
```

### Pattern 2: Render-on-State-Change

**What:** Rendering is triggered by state changes, not by events directly. When state mutates, a central render function calls the active screen's render function and writes the result to the DOM's single output element.

**When to use:** Terminal-style UIs where the whole screen redraws on each action. Avoids partial update bugs.

**Trade-offs:** Redraws the full terminal pane on each keypress. For an ASCII terminal this is instant and fine. Not suitable for pixel-perfect animation at high framerates.

**Example:**
```typescript
// state.ts
const subscribers: Array<() => void> = [];
export function notify() { subscribers.forEach(fn => fn()); }

// main.ts
subscribe(() => {
  const output = activeScreen().render(getState());
  document.getElementById('terminal')!.textContent = output;
});
```

### Pattern 3: Calculation-Then-Cache

**What:** Swiss Ephemeris calculations run once when a person is selected or a transit date changes. The result is stored in app state as a `ChartData` object. All rendering reads from that cached object -- nothing calls the WASM engine during render.

**When to use:** Any time the calculation and the display are on different timescales. Ephemeris calls are async and somewhat expensive; rendering must be synchronous and instant.

**Trade-offs:** Adds a "pending calculation" state to handle. Worth it: keeps the render layer simple and the UX snappy.

## Data Flow

### First-Time User Flow

```
User types name and birth data
    |
    v
Onboarding screen validates input
    |
    v
Geocoder converts city -> lat/lon + UTC offset
    |
    v
Ephemeris Service calculates:
  - Planet longitudes (calc_ut per body)
  - Placidus house cusps (houses function)
  - Aspects (post-calculation detection)
    |
    v
ChartData object assembled
    |
    v
State updated: { activePerson, chartData }
    |
    v
Person saved to localStorage
    |
    v
Router transitions to CHART screen
    |
    v
Render loop: chartData -> ASCII wheel + tables -> DOM
```

### Return User Flow

```
App loads
    |
    v
Persistence layer reads localStorage -> people[]
    |
    v
Router goes to PERSON_SELECT (people exist) or LANDING (first time)
    |
    v
User selects person from numbered list
    |
    v
Ephemeris Service recalculates for that person's birth data
(natal chart data could be cached in localStorage to skip this)
    |
    v
State updated -> CHART screen renders
```

### Transit Flow

```
User presses "See transits" from CHART
    |
    v
Router transitions to TRANSIT screen
    |
    v
Transit date defaults to today (Date.now())
    |
    v
Ephemeris Service calculates transit planet positions for that date
    |
    v
Aspect detection: transit planets vs natal planets
    |
    v
State updated: { transitData }
    |
    v
Render: natal wheel + transit overlay on left, transit aspect list on right
    |
    v
User edits date field -> recalculate transit -> re-render
```

### Key Data Interfaces

```typescript
// Core types flowing between layers

interface Person {
  id: string;           // uuid
  name: string;
  birthDate: string;    // ISO date string
  birthTime: string;    // "HH:MM"
  birthCity: string;
  birthCountry: string;
  lat: number;
  lon: number;
  utcOffset: number;
  usageCount: number;   // for frequency sorting
  lastUsed: number;     // timestamp
}

interface PlanetPosition {
  planet: string;       // "Sun", "Moon", etc.
  longitude: number;    // 0-360 ecliptic degrees
  sign: string;
  degree: number;       // 0-30 within sign
  house: number;        // 1-12
  isRetrograde: boolean;
}

interface HouseCusp {
  house: number;        // 1-12
  longitude: number;    // 0-360 ecliptic degrees
  sign: string;
  degree: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;         // "conjunction", "trine", etc.
  orb: number;          // degrees from exact
  isApplying: boolean;
}

interface ChartData {
  person: Person;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: number;    // longitude
  midheaven: number;    // longitude
}
```

## Scaling Considerations

This app is personal-scale (single user, small circle). The table below is included only to show that the chosen architecture is appropriate and not over- or under-engineered.

| Scale | Architecture Adjustment |
|-------|--------------------------|
| 1-10 users | Current approach is correct. localStorage, no server, WASM in browser. |
| 10-100 users | Still fine. localStorage per browser. No shared state problems. |
| 100+ users with sync | Would require a backend. Out of scope for this project. |

### Scaling Priorities (if scope expands)

1. First bottleneck: localStorage has a ~5MB limit. Person profiles are tiny (under 1KB each). The limit is not a real concern for personal use.
2. WASM initialization time: The WASM module loads once on first visit and is cached by the browser. Not a recurring cost.

## Anti-Patterns

### Anti-Pattern 1: Calling WASM During Render

**What people do:** Call `swe.calc_ut()` inside the rendering loop or on every keypress.
**Why it's wrong:** WASM calls are async and have non-trivial overhead. Blocking render on async calls causes jank. Making them synchronous is not possible.
**Do this instead:** Calculate once when data changes (person selected, date changed), store in state, render from cached `ChartData`.

### Anti-Pattern 2: Each Screen Manages Its Own State

**What people do:** Store selected person in the chart screen, store transit date in the transit screen, etc.
**Why it's wrong:** Screen transitions lose state. The chart screen can't pass the active person to the transit screen without a shared store.
**Do this instead:** All meaningful state lives in the central store. Screens read from it; they don't own data that persists across transitions.

### Anti-Pattern 3: Mixing Coordinate Systems in the Wheel Renderer

**What people do:** Mix ecliptic longitude (0-360 degrees, starting at 0 Aries) with screen angle (0 radians = right/east, going counter-clockwise) without a clear conversion layer.
**Why it's wrong:** Planets end up in wrong positions; house boundaries are visually misaligned. Debugging is painful.
**Do this instead:** Define one canonical conversion function `eclipticToScreenAngle(longitude: number): number` and use it everywhere in the wheel renderer. Comment the coordinate system clearly.

### Anti-Pattern 4: Storing Calculated Chart Data in localStorage

**What people do:** Cache the full `ChartData` object in localStorage to avoid recalculation.
**Why it's wrong:** Ephemeris recalculation is fast (< 100ms). Caching ChartData couples the storage schema to the calculation output, making schema changes painful. The Person data (birth info) is what must persist -- calculations are cheap to redo.
**Do this instead:** Only store `Person` profiles in localStorage. Recalculate `ChartData` on demand.

## Integration Points

### External Libraries

| Library | Integration Pattern | Notes |
|---------|---------------------|-------|
| swisseph-wasm | Async WASM init on app load; sync calls after init | Initialize once in `main.ts`, pass instance to ephemeris service. Call `swe.close()` on unload. |
| Geocoding (city -> lat/lon) | One-time fetch at data entry | Options: `nominatim.openstreetmap.org` (free, no key) or a bundled lookup for major cities. Fetch only needed at onboarding, not on chart load. |
| Timezone (lat/lon -> UTC offset) | One-time lookup at data entry | Can use `Intl.DateTimeFormat` with timezone name, or a bundled zone database. Accuracy matters for Ascendant calculation. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| engine/ to store/ | Ephemeris service resolves a Promise; store receives ChartData | Engine knows nothing about state or screens |
| store/ to screens/ | Screens call `getState()` and subscribe for re-render | Screens never mutate state directly -- call action functions in store/ |
| screens/ to render/ | Screen calls render functions, passes ChartData slice | Render functions are pure: same input = same output string |
| input.ts to screens/ | Router exposes `handleKey(key)` which delegates to active screen | Active screen's keyHandler returns events (strings), never transitions itself |

## Build Order Implications

Based on these dependencies, the suggested build order is:

1. `engine/types.ts` -- Define all interfaces first. Everything else depends on them.
2. `engine/ephemeris.ts` -- Get WASM working and returning typed data. Validate against a known chart.
3. `store/persistence.ts` -- Person CRUD against localStorage. Can be developed and tested independently.
4. `store/state.ts` -- Wire up state shape and notify pattern.
5. `router.ts` + `input.ts` -- Skeleton state machine with keyboard routing. Proves the navigation model before any real screens exist.
6. `screens/onboarding.ts` + `screens/person-select.ts` -- Data entry and person selection. Needs engine and persistence.
7. `render/wheel.ts` -- The ASCII wheel is the hardest and most custom piece. Build it in isolation with hardcoded test data first.
8. `render/tables.ts` + `render/layout.ts` -- Simpler; format data as fixed-width text.
9. `screens/chart.ts` -- Wire wheel + tables into the chart screen.
10. `screens/transit.ts` -- Transit overlay is a second rendering pass on the wheel.
11. `screens/landing.ts` -- The animated landing screen is cosmetic and can be done last.

## Sources

- swisseph-wasm package: https://github.com/prolaxu/swisseph-wasm
- AstroClock architecture overview (WASM + state + SPA): https://dev.to/7deadlysinsclock/astroclock-a-real-time-astrology-engine-powered-by-webassembly-wasm-4omh
- CircularNatalHoroscopeJS data model (ChartPosition, Aspects, Houses structure): https://github.com/0xStarcat/CircularNatalHoroscopeJS
- Swiss Ephemeris WASM usage patterns: https://www.oreateai.com/blog/how-to-use-swiss-ephemeris-wasm-module/
- Vanilla JS SPA routing patterns: https://jsdev.space/spa-vanilla-js/
- Finite state machine UI modeling: https://xiaoyunyang.github.io/post/modeling-ui-state-using-a-finite-state-machine/
- Polar coordinates for circular placement: https://varun.ca/polar-coords/

---
*Architecture research for: browser-only astrology chart app (gachi-pachi)*
*Researched: 2026-03-19*
