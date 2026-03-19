---
phase: 1
slug: ephemeris-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | none -- Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| (populated during planning) | | | | | | | |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `vitest` and `@types/node` installed as dev dependencies
- [ ] `vitest.config.ts` created with TypeScript support
- [ ] `tests/` directory created with initial test stubs for CALC-01 through CALC-07
- [ ] `swisseph-wasm` installed and WASM initialization verified in test environment

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Geocoding returns correct lat/lon for a known city | CALC-02 | Depends on external API availability | Enter "London, United Kingdom" and verify lat ~51.5, lon ~-0.12 |
| Chart output matches astro.com reference | CALC-04 | Visual comparison against external site | Calculate chart for known birth data and compare Sun/Moon/ASC positions |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
