# Coding Conventions

**Analysis Date:** 2026-03-19

## Naming Patterns

**Files:**
- All source files use kebab-case with `.cjs` extension: `core.cjs`, `model-profiles.cjs`, `profile-pipeline.cjs`
- Entry point uses kebab-case: `gsd-tools.cjs`
- Planning document templates use SCREAMING_SNAKE_CASE: `PLAN.md`, `SUMMARY.md`, `STATE.md`, `ROADMAP.md`

**Functions:**
- Command handler functions use `cmd` prefix + PascalCase noun + verb: `cmdStateLoad`, `cmdPhaseAdd`, `cmdFindPhase`
- Internal helper functions use camelCase without prefix: `stateExtractField`, `stateReplaceField`, `normalizePhaseName`
- Boolean-returning helpers use descriptive names: `isGitIgnored`, `isInsideFencedBlock`, `isClosingFence`
- Private helpers are module-local (not exported)

**Variables:**
- camelCase throughout: `phaseDir`, `roadmapContent`, `completedPlanIds`
- Constants use SCREAMING_SNAKE_CASE: `MODEL_PROFILES`, `VALID_CONFIG_KEYS`, `FRONTMATTER_SCHEMAS`, `MODEL_ALIAS_MAP`
- Loop variables follow standard conventions: `i`, `j`, `m` (for regex match objects)

**Types/Schemas:**
- Schema objects stored in plain JS objects with descriptive keys: `FRONTMATTER_SCHEMAS.plan`, `FRONTMATTER_SCHEMAS.summary`
- Module exports are plain CommonJS: `module.exports = { fn1, fn2 }`

## Code Style

**Module System:**
- CommonJS throughout (`require`, `module.exports`)
- All files have `.cjs` extension to explicitly signal CommonJS in an ES module context
- The `.claude/package.json` declares `{ "type": "commonjs" }`

**Formatting:**
- 2-space indentation
- Single quotes for strings
- No trailing semicolons would look inconsistent — semicolons ARE used
- Short functions kept on single lines where clear: `if (!phase) { error('phase required'); }`
- Arrow functions used for callbacks and inline predicates

**Linting:**
- No linting configuration detected (no `.eslintrc`, `biome.json`, etc.)
- Style is enforced by convention only

## Import Organization

**Order:**
1. Node.js built-ins (`fs`, `path`, `child_process`, `os`, `readline`)
2. Internal library imports from `./core.cjs`, `./frontmatter.cjs`, etc.
3. No third-party npm dependencies in source files

**Pattern:**
```js
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const { output, error, safeReadFile } = require('./core.cjs');
const { extractFrontmatter } = require('./frontmatter.cjs');
```

**Destructuring:** Named imports are destructured from module requires.

## Error Handling

**Patterns:**
- Two shared helpers used everywhere: `output(result, raw, rawValue)` and `error(message)`
- `error()` writes to stderr and calls `process.exit(1)` — terminates the process
- `output()` serializes to stdout and calls `process.exit(0)` — terminates successfully
- All file I/O wrapped in `try/catch` with silent fallback or `error()` call
- `safeReadFile()` in `core.cjs` returns `null` instead of throwing
- Empty `catch {}` blocks used when failure is intentionally ignored (e.g., optional file reads)
- Precondition checks at function entry using `if (!param) { error('param required'); }`

**Example:**
```js
function cmdStateGet(cwd, section, raw) {
  const statePath = path.join(cwd, '.planning', 'STATE.md');
  try {
    const content = fs.readFileSync(statePath, 'utf-8');
    // ...
  } catch {
    error('STATE.md not found');
  }
}
```

## Logging

**Framework:** `process.stdout.write` and `process.stderr.write` directly

**Patterns:**
- All output goes through `output()` helper in `core.cjs` — never `console.log`
- Errors go through `error()` helper — never `console.error`
- Large JSON payloads (>50KB) written to a temp file, path returned with `@file:` prefix
- The `--raw` flag selects plain string output over JSON output

## Comments

**When to Comment:**
- Module-level JSDoc block at top of each file declaring module purpose
- Section dividers using `// ─── Section Name ────────────────` visual separators
- Inline comments on non-obvious logic, especially regex patterns and edge cases
- Multi-line comments preceding complex functions explaining intent and known issues

**JSDoc:**
- Used selectively on exported functions with complex signatures
- Parameters and return values documented in prose or `@param`/`@returns` tags
- Issue references included in comments: `// Fixes: #1102`, `// Fixes #1034`

**Example of section divider style:**
```js
// ─── Path helpers ────────────────────────────────────────────────────────────
// ─── Git utilities ────────────────────────────────────────────────────────────
// ─── Phase utilities ──────────────────────────────────────────────────────────
```

## Function Design

**Size:** Functions are medium-length (20-100 lines typical). Long functions like `cmdPhaseRemove` (~250 lines) exist for complex operations but are well-structured with inline comments.

**Parameters:**
- `cwd` (current working directory string) is always the first parameter for commands
- `raw` (boolean) is always the last parameter for commands — controls output format
- Options bundled into an `options` object for functions with many optional params

**Return Values:**
- Command functions never return values — they call `output()` or `error()` and exit
- Internal helpers return values normally
- Null-returning helpers documented (e.g., `findPhaseInternal` returns `null` when not found)

## Module Design

**Exports:**
- Single `module.exports = { fn1, fn2, ... }` at the bottom of each file
- Only public API exported — helper functions defined locally and not exported
- Constants exported when needed by other modules

**Barrel Files:**
- No barrel files — each module is imported directly
- `gsd-tools.cjs` acts as the CLI entry point and imports all modules explicitly

**Module Responsibilities:**
- `core.cjs`: shared utilities, path helpers, git utilities, markdown normalization, phase comparison
- `state.cjs`: STATE.md read/write and frontmatter sync
- `phase.cjs`: phase CRUD and lifecycle operations
- `frontmatter.cjs`: YAML frontmatter parsing and serialization
- `commands.cjs`: standalone utility commands (slug, timestamp, todos, websearch)
- `config.cjs`: `.planning/config.json` CRUD
- `milestone.cjs`: milestone and requirements lifecycle
- `roadmap.cjs`: ROADMAP.md parsing and update operations
- `verify.cjs`: verification and consistency checks
- `init.cjs`: compound context-loading commands for workflow bootstrap
- `template.cjs`: document template filling
- `model-profiles.cjs`: agent-to-model mappings per profile
- `profile-pipeline.cjs`: Claude session history scanning for user profiling

---

*Convention analysis: 2026-03-19*
