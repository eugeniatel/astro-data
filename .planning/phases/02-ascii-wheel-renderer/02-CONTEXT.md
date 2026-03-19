# Phase 2: ASCII Wheel Renderer - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Custom ASCII circular chart wheel renderer that takes ChartData and produces a text grid showing zodiac sign boundaries, house cusp lines, and planet glyphs at correct ecliptic positions. Built and validated in isolation with hardcoded test data before integration with live ephemeris data. This is the most technically uncertain piece of the project since there is no existing library for circular ASCII chart wheels in JS.

</domain>

<decisions>
## Implementation Decisions

### Rendering approach
- Pure functions: ChartData in, string[][] grid out. No DOM dependency in the renderer itself.
- Monospace character grid: all rendering targets a fixed-width font
- Character aspect ratio compensation: monospace characters are taller than wide (~2:1). Must scale x-coordinates to prevent oval output.
- Ascendant always at 9 o'clock position (left/west), following standard astrological wheel convention

### Coordinate system
- Single canonical conversion: eclipticToScreenAngle(longitude, ascendant) maps 0-360 ecliptic degrees to screen angle
- Screen angle 0 = right (3 o'clock), counter-clockwise. Ascendant placed at 9 o'clock = PI radians.
- The conversion rotates the ecliptic so that the Ascendant longitude maps to PI (9 o'clock)

### Visual elements
- Outer ring: zodiac sign boundaries at 30-degree intervals, with sign abbreviations (Ari, Tau, etc.)
- Inner ring: house cusp lines radiating from center
- Planet glyphs placed at their ecliptic longitude positions between inner and outer rings
- Unicode planet symbols where available, ASCII fallback letters otherwise

### Claude's Discretion
- Grid size (rows x columns) -- must be large enough for legibility but fit in a terminal viewport
- Exact character choices for ring boundaries, cusp lines, and decorative elements
- How to handle planet conjunction overlap (multiple planets at same degree)
- Whether to show degree markers at 10-degree intervals on the outer ring

</decisions>

<code_context>
## Existing Code

### Available from Phase 1
- src/engine/types.ts: ChartData, PlanetPosition, HouseCusp interfaces
- src/engine/chart.ts: calculateChart(person) returns ChartData
- All planetary data is in ecliptic longitude (0-360 degrees)

### Key types the renderer consumes
```typescript
ChartData.planets: PlanetPosition[] // each has .longitude (0-360), .planet name, .sign
ChartData.houses: HouseCusp[] // each has .house (1-12), .longitude (0-360)
ChartData.ascendant: number // longitude of ASC
ChartData.midheaven: number // longitude of MC
```

### Project structure placement
- src/render/wheel.ts -- the ASCII wheel generator
- src/render/wheel.test.ts -- tests validating the wheel output

</code_context>

<specifics>
## Specific Considerations

- The circular shape is the hardest part. Monospace fonts have ~2:1 height:width ratio, so raw polar-to-grid conversion produces an oval. Must multiply x-coordinates by ~2 to compensate.
- Planet overlap: when two planets are within a few degrees, their glyphs collide on the grid. Need a simple collision resolution (nudge outward or use stacking).
- The wheel must work with any valid ChartData, not just the Einstein test case.
- Grid should be roughly 40-50 rows tall to be readable in a standard terminal.

</specifics>
