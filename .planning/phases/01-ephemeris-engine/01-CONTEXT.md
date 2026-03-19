# Phase 1: Ephemeris Engine - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Accurate astrological calculation engine: birth data input, geocoding to lat/lon/timezone, Swiss Ephemeris WASM for planetary positions, Placidus house cusps, aspect calculations, and structured JSON output. This is a pure calculation layer with no UI rendering. All other phases depend on this output.

</domain>

<decisions>
## Implementation Decisions

### Aspect orbs and selection
- Modern (moderate) orb system: 6 degrees for conjunction/opposition, 5 for trine/square, 3 for sextile/quincunx
- Sun and Moon get +2 degrees wider orbs than other planets
- 6 aspects: conjunction (0), sextile (60), square (90), trine (120), quincunx (150), opposition (180)
- Show exact orb value with each aspect (e.g. "Moon trine Venus (2.3 degrees)")
- Calculate positions for Chiron and North Node alongside the 10 main planets (for future use, not displayed in v1)

### Geocoding strategy
- Primary: Claude's discretion on which online geocoding service works best from browser (Nominatim or Geoapify, depending on CORS behavior)
- Fallback: Bundled offline city database (~4,000 cities with 100K+ population, ~200KB)
- Last resort: Manual lat/lon/timezone entry if city not found in bundled database
- IANA timezone name storage: Claude's discretion (pick what's most accurate for historical DST)

### Claude's Discretion
- Choice of primary geocoding API (Nominatim vs Geoapify vs other)
- Whether to store IANA timezone name or UTC offset per person (pick what produces most accurate charts)
- Birth data validation edge cases (unknown birth time handling, ambiguous city disambiguation)
- JSON output structure and field naming
- Test validation strategy for verifying calculation accuracy against astro.com

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project research
- `.planning/research/STACK.md` -- swisseph-wasm library details, version, WASM init pattern
- `.planning/research/PITFALLS.md` -- WASM initialization traps, timezone/DST errors, geocoding CORS, Placidus high-latitude failure
- `.planning/research/ARCHITECTURE.md` -- Component boundaries, data flow, calculation engine design
- `.planning/research/SUMMARY.md` -- Consolidated findings and phase ordering rationale

### Requirements
- `.planning/REQUIREMENTS.md` -- CALC-01 through CALC-07 requirement definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None relevant. Existing codebase is GSD framework tooling only (`.claude/` directory). No app code exists yet.

### Established Patterns
- Node.js v22 confirmed on host machine (native fetch available)
- CommonJS module system in existing tooling, but app will use ESM via Vite

### Integration Points
- This is the first app code. No existing integration points.
- Output types (ChartData, PersonData) defined here become the contract for all downstream phases.

</code_context>

<specifics>
## Specific Ideas

- Calculation accuracy must be verifiable against astro.com for a known birth chart
- The Reykjavik (64N) edge case for Placidus houses is a required test case (from research)
- swisseph-wasm npm accessibility should be verified at scaffold time (returned 403 during research)

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 01-ephemeris-engine*
*Context gathered: 2026-03-19*
