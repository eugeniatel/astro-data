# Gachi Pachi

## What This Is

A web app styled like a retro terminal that generates and displays astrological birth charts. Users punch in birth data, get an ASCII-rendered chart wheel with planet positions, aspects, and transit overlays. Built for a small circle of people, runs entirely in the browser with no login or server.

## Core Value

See your natal chart and current transits clearly, in a single clean view, with no clutter or login walls.

## Requirements

### Validated

(None yet -- ship to validate)

### Active

- [ ] Animated landing screen with rotating coin/circle on Y-axis, terminal space aesthetic, "Press Enter" to begin
- [ ] First-time flow: "What's your name?" prompt, then birth data entry (day/month/year, time, city, country)
- [ ] Return visit flow: numbered list of saved people to toggle between, plus "new person" option
- [ ] ASCII-rendered circular chart wheel showing planet positions by sign and house
- [ ] Planet positions table: symbol, planet, house, sign, degree placement
- [ ] Aspects table showing aspects between planets
- [ ] "This is [Name]" header with Sun, Moon, and Ascendant displayed prominently
- [ ] Split layout: wheel on left, identity + tables on right
- [ ] Bottom navigation bar with arrow-selectable options (See transits / New person / Exit)
- [ ] Transit view: wheel with transit overlay on left, transit list with 2-3 sentence reference interpretations on right
- [ ] Transit date defaults to today, with a type-in field to change to any date
- [ ] Transit screen bottom bar: "Back to chart" / "Exit"
- [ ] All birth data saved in browser local storage
- [ ] Frequently used charts appear first in the people list
- [ ] Astrological calculations via Swiss Ephemeris or equivalent library
- [ ] Placidus house system
- [ ] Structured/AI-readable data output (not just visual rendering)

### Out of Scope

- User accounts or login -- no server, browser-only
- OAuth or authentication of any kind
- Mobile app -- web-first
- AI-generated interpretations -- reference text only
- Multiple house systems -- Placidus only for v1

## Context

- Inspired by astro.com but frustrated by its clutter, small renders, and poor transit overlays
- Screenshots from astro.com are not AI-readable, so structured data matters
- Terminal/ASCII/retro space aesthetic throughout, not just the chrome but the chart wheel itself
- User flow modeled after terminal interactions: prompts, typed input, arrow-key navigation
- Small user base (personal + close circle), not a public product
- Existing codebase contains GSD framework tooling only (no app code yet)

## Constraints

- Tech: Browser-only, no backend server, all data in localStorage
- Calculations: Must use a proven ephemeris library for accuracy (Swiss Ephemeris WASM or similar)
- Rendering: Chart wheel must be ASCII art, not SVG or canvas
- Aesthetic: Retro terminal/space theme, no modern UI frameworks with flashy components

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ASCII chart wheel (not SVG) | Full commitment to terminal aesthetic, user's explicit preference | -- Pending |
| Browser localStorage | No server needed, small user base, simplicity | -- Pending |
| Placidus house system | User's preferred system | -- Pending |
| Reference text interpretations | User prefers standard astrological meanings over AI-generated content | -- Pending |
| Swiss Ephemeris or equivalent | Industry standard for accurate planetary calculations | -- Pending |

---
*Last updated: 2026-03-19 after initialization*
