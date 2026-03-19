# Testing Patterns

**Analysis Date:** 2026-03-19

## Test Framework

**Runner:**
- No test framework is currently installed or configured
- No `jest.config.*`, `vitest.config.*`, or `*.test.*` / `*.spec.*` files exist in the project

**Assertion Library:**
- None installed

**Run Commands:**
```bash
# No test commands configured
# No scripts section in .claude/package.json
```

## Test File Organization

**Location:**
- No test files exist at time of analysis

**Naming:**
- No convention established yet

**Structure:**
```
(no test directories exist)
```

## TDD Reference Documentation

While no tests are implemented, the GSD framework ships a detailed TDD reference at `.claude/get-shit-done/references/tdd.md` that prescribes how tests should be written when TDD plans are executed.

**Prescribed Test Structure (from tdd.md):**

```typescript
// Test behavior, not implementation
// One concept per test
// Descriptive names: "should reject empty email", "returns null for invalid ID"
// Test public API, not internal state
```

**Prescribed File Naming:**
- `*.test.ts` or `*.spec.ts` co-located with source
- Or `__tests__/` directory
- Or `tests/` directory at root

## Mocking

**Framework:** Not configured

**Prescribed Patterns (from tdd.md):**
- Mock external services, not internal helpers
- Do not mock private methods or internal state
- Tests should survive refactors (no implementation detail coupling)

**What to Mock:**
- External I/O (filesystem, network) when testing pure logic

**What NOT to Mock:**
- Private methods
- Internal state
- Implementation details that callers don't depend on

## Fixtures and Factories

**Test Data:**
- No fixture infrastructure exists

**Location:**
- Not established

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# No coverage tooling configured
```

## Test Types

**Unit Tests:**
- Not implemented; prescribed for business logic, data transformations, parsing, validation, utility functions, state machines (per tdd.md)

**Integration Tests:**
- Not implemented; prescribed for API endpoints with request/response contracts

**E2E Tests:**
- Not used

## TDD Workflow (Prescribed Pattern)

When a TDD plan is executed, the GSD framework mandates the Red-Green-Refactor cycle:

**RED Phase:**
```bash
# 1. Write failing test describing expected behavior
# 2. Run test — it MUST fail
# 3. Commit: test({phase}-{plan}): add failing test for [feature]
```

**GREEN Phase:**
```bash
# 1. Write minimal code to pass the test
# 2. Run test — it MUST pass
# 3. Commit: feat({phase}-{plan}): implement [feature]
```

**REFACTOR Phase (optional):**
```bash
# 1. Clean up implementation
# 2. Run tests — must still pass
# 3. Commit: refactor({phase}-{plan}): clean up [feature]
```

## Commit Pattern for Tests

Tests follow the same commit format as all GSD commits:

```
test({phase}-{plan}): add failing test for email validation
feat({phase}-{plan}): implement email validation
refactor({phase}-{plan}): extract regex to constant
```

## When to Use TDD (Prescribed Guidance)

**Use TDD for:**
- Business logic with defined inputs/outputs
- API endpoints with request/response contracts
- Data transformations, parsing, formatting
- Validation rules and constraints
- Algorithms with testable behavior
- State machines and workflows
- Utility functions with clear specifications

**Skip TDD for:**
- UI layout, styling, visual components
- Configuration changes
- Glue code connecting existing components
- One-off scripts and migrations
- Simple CRUD with no business logic
- Exploratory prototyping

**Decision heuristic:** Can you write `expect(fn(input)).toBe(output)` before writing `fn`?

## Framework Setup (When Needed)

When a TDD plan is executed and no test framework exists, set it up as part of the RED phase:

| Project | Framework | Install |
|---------|-----------|---------|
| Node.js | Jest | `npm install -D jest @types/jest ts-jest` |
| Node.js (Vite) | Vitest | `npm install -D vitest` |
| Python | pytest | `pip install pytest` |
| Go | testing | Built-in |
| Rust | cargo test | Built-in |

The codebase uses CommonJS (`.cjs`), so if tests are added to the Node.js library files in `.claude/get-shit-done/bin/`, Jest with CommonJS support is the appropriate choice.

---

*Testing analysis: 2026-03-19*
