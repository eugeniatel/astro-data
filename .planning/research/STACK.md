# Stack Research

**Domain:** Browser-based astrology chart web app (terminal/ASCII aesthetic)
**Researched:** 2026-03-19
**Confidence:** MEDIUM (ephemeris layer HIGH, CSS layer MEDIUM, ASCII rendering layer LOW — no prior art for ASCII chart wheels in JS)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.0.1 | Build tool and dev server | Industry standard for browser-only vanilla TS projects. v8 ships with Rolldown (Rust-based bundler), 10-30x faster builds, native WASM SSR support. `npm create vite@latest -- --template vanilla-ts` is the canonical starting point. No framework overhead. |
| TypeScript | 5.x (via Vite) | Language | Bundled with Vite vanilla-ts template. Essential for a data-heavy domain like astrology calculations where types prevent degree/radian/house-number mix-ups at compile time. |
| swisseph-wasm | 0.0.5 | Planetary and house calculations in the browser | Only zero-dependency Swiss Ephemeris WASM wrapper designed for direct browser use. Embeds WASM module, no external .se1 files needed. 106 tests, 86% coverage. Async init pattern. GPL-3.0-or-later license. |
| WebTUI (@webtui/css) | 0.1.6 | Terminal-aesthetic CSS layer | Most current (last published ~2 months ago as of research date). Character-cell layout model, monospace-first, ASCII box drawing built-in, vim-style keyboard hints in docs. Modular: import only what you need. Supports Gruvbox/Nord/Catppuccin themes. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| circular-natal-horoscope-js | latest (check npm) | High-level astrological data layer | Use as a supplementary data-structuring layer. It uses Moshier's ephemeris (not Swiss Ephemeris) but provides a clean JS API for aspects, houses, planet positions. Run in parallel with swisseph-wasm calculations and cross-check, or use as fallback for aspect calculations only. |
| figlet.js | 1.10.0 | ASCII art text fonts for UI chrome | Landing screen header, "Gachi Pachi" title, section labels. Browser-compatible. TypeScript support added in v1.9.0. Renders to string, display in `<pre>`. |
| terminal.css | 0.7.5 | Alternative/fallback CSS if WebTUI proves too opinionated | Pure CSS, 3KB gzipped, classless-ish. Good for forms, tables, typography. Last resort if WebTUI's character-cell layout model fights the split-pane chart layout. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite vanilla-ts template | Project scaffold | `npm create vite@latest gachi-pachi -- --template vanilla-ts`. Gives tsconfig, index.html, main.ts, vite.config.ts out of the box. |
| TypeScript strict mode | Catch calculation errors at compile time | Enable `"strict": true` in tsconfig. Especially important for ephemeris wrappers where wrong types silently return bad degree values. |
| ESLint | Code quality | Vite 8 has built-in ESLint config support. Worth adding for a project with complex calculation logic. |

## Installation

```bash
# Scaffold
npm create vite@latest gachi-pachi -- --template vanilla-ts
cd gachi-pachi

# Core ephemeris
npm install swisseph-wasm

# UI / CSS
npm install @webtui/css

# ASCII art text for terminal UI chrome
npm install figlet
npm install --save-dev @types/figlet

# Optional: high-level astrology data layer
npm install circular-natal-horoscope-js

# Dev dependencies (linting)
npm install -D eslint
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| swisseph-wasm | astro-sweph (astroahava/astro-sweph) | If you need a single embedded JS file (~1.9MB, all ephemeris data baked in) and want zero external file loading. Tradeoff: larger payload, less transparent API. Fork of u-blusky/sweph-wasm. |
| swisseph-wasm | circular-natal-horoscope-js as primary | Only if Swiss Ephemeris accuracy is not a hard requirement. Uses Moshier's ephemeris, which is less precise for historical dates and some edge cases. Simpler API but lower accuracy ceiling. |
| @webtui/css | terminal.css v0.7.5 | If WebTUI's character-cell layout model creates friction with the split-pane chart + tables layout. terminal.css is more conventional CSS with terminal aesthetics bolted on — easier to work with for irregular layouts. |
| @webtui/css | TuiCss v2.1.2 | Avoid. Last release July 2023, minimal recent activity. MS-DOS component style is more novelty than utility. |
| Vite vanilla-ts | No build tool (plain HTML/JS) | Only if bundle size is a serious concern and WASM loading needs tight manual control. Vite handles WASM imports natively, so this is not a real reason to skip it. |
| Custom ASCII wheel renderer | No library exists for this | There is no JavaScript library for astrological ASCII chart wheel rendering. This is custom code. See notes in "What NOT to Use" section. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| AstroChart (Kibo/AstroChart) | SVG-only output. Produces graphical chart wheels, not ASCII. Directly contradicts the core aesthetic constraint. | Custom ASCII renderer using `<pre>` tag with a grid-based circle algorithm |
| React / Vue / Svelte | Heavyweight for a single-page terminal app with no component library requirements. Adds bundle weight and complexity for zero benefit when vanilla TS + WebTUI gives full control. | Vite vanilla-ts |
| swisseph (Node.js binding, timotejroiko) | Node.js native addon. Cannot run in the browser. | swisseph-wasm |
| Google Maps Geocoding API | Requires API key, key would be exposed in browser bundle (security issue). Overkill for city-to-lat/long lookups. | Nominatim via nominatim.openstreetmap.org (see geocoding note below) |
| TuiCss v2.1.2 | Last release July 2023, stale. | @webtui/css 0.1.6 |
| NES.css / XP.css | 8-bit game / Windows XP aesthetic, not terminal. Wrong vibe entirely. | @webtui/css |

## Stack Patterns by Variant

**For the ASCII chart wheel (core differentiator):**
- There is no existing library. Build a custom renderer.
- The algorithm: allocate a 2D character grid (e.g., 60x30 chars), use the Bresenham circle-drawing algorithm or parametric `(x, y) = (r*cos(theta), r*sin(theta))` to plot concentric circles (outer zodiac ring, inner house ring, center region). Map planet degrees to character positions on the circles. Render to a string, display in a `<pre>` element with monospace font.
- The Astrolog desktop app (C, open source) has a proven ASCII wheel implementation using this exact approach -- reviewing its `-w` switch source code is worthwhile as a reference for layout constraints (house overflow, symbol placement).
- Character aspect: 60 chars wide maps cleanly to a terminal column width. Use `│ ─ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼` for box drawing, `○ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓` for zodiac symbols, `☉ ☽ ♂ ♀ ♃ ♄ ♅ ♆ ♇` for planets (Unicode support is broad in modern browsers).

**For geocoding (city name to lat/long):**
- Nominatim (nominatim.openstreetmap.org) is the right choice for a no-backend, no-API-key solution. IMPORTANT: the public Nominatim endpoint has CORS issues when called from browser JS directly -- this is a known problem (multiple open GitHub issues). Mitigations: (a) use a lightweight CORS proxy at build time, (b) accept manual lat/long entry as fallback, or (c) use the Geoapify free tier (requires API key but key can be public-read-only and rate-limited). Plan for manual lat/long entry as a fallback regardless.
- Confidence on this: LOW. Verify CORS behavior against nominatim.openstreetmap.org at build time.

**For localStorage state:**
- No library needed. Write a thin TypeScript wrapper: a typed `StorageService` class with `get<T>`, `set<T>`, and `remove` methods using `JSON.parse` / `JSON.stringify`. This is ~30 lines of code. Using a library for this is over-engineering.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| swisseph-wasm 0.0.5 | Vite 8.0.1 | WASM imports work natively in Vite 8. No special plugin needed. |
| @webtui/css 0.1.6 | Vite 8.0.1 | Pure CSS, no compatibility issues. |
| figlet 1.10.0 | TypeScript 5.x | Types included since v1.9.0. No @types/figlet needed separately (but installing it is harmless). |
| circular-natal-horoscope-js | Vite 8.0.1 | ES6 module, works with vanilla-ts template. No special configuration. |
| Node.js requirement | Vite 8.0.1 | Requires Node.js 20.19+ or 22.12+. |

## Sources

- https://github.com/prolaxu/swisseph-wasm -- swisseph-wasm library, confirmed browser support and zero-dependency WASM embed. MEDIUM confidence (npm page returned 403, version from jsDelivr CDN listing).
- https://github.com/astroahava/astro-sweph -- alternative Swiss Ephemeris WASM, confirmed Placidus support, single-file embed approach. MEDIUM confidence.
- https://github.com/0xStarcat/CircularNatalHoroscopeJS -- confirmed Moshier's ephemeris (not Swiss Ephemeris), Placidus support, raw data output only. MEDIUM confidence.
- https://webtui.ironclad.sh/start/installation/ -- WebTUI v0.1.6, confirmed character-cell layout, ASCII box drawing, active maintenance. HIGH confidence.
- https://terminalcss.xyz/ -- terminal.css v0.7.5, confirmed components and npm install. HIGH confidence.
- https://vite.dev/blog/announcing-vite8 -- Vite 8.0.1 released 2026-03-12, Rolldown integration, WASM SSR support. HIGH confidence.
- https://github.com/patorjk/figlet.js/ -- figlet v1.10.0, TypeScript since v1.9.0, browser compatible. HIGH confidence.
- https://github.com/osm-search/Nominatim/discussions/2488 -- Nominatim CORS issues confirmed by multiple GitHub threads. Treat geocoding as a known risk area. HIGH confidence on the risk.
- https://www.astrolog.org/ftp/astrolog.htm -- Astrolog ASCII wheel reference, confirmed `-w` switch produces text-based wheel output. MEDIUM confidence (useful as algorithm reference, not a JS library).

---
*Stack research for: browser-based astrology chart app with terminal/ASCII aesthetic*
*Researched: 2026-03-19*
