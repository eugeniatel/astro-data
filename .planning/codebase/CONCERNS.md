# Codebase Concerns

**Analysis Date:** 2026-03-19

## Tech Debt

**Hardcoded model version strings:**
- Issue: `MODEL_ALIAS_MAP` in `core.cjs` maps alias names (`opus`, `sonnet`, `haiku`) to specific hardcoded model version strings (`claude-opus-4-0`, `claude-sonnet-4-5`, `claude-haiku-3-5`). Every Anthropic model release requires a manual update here.
- Files: `.claude/get-shit-done/bin/lib/core.cjs` (around line 30-40)
- Impact: Agents silently use outdated models after a new release. No fallback or dynamic resolution.
- Fix approach: Pull model aliases from a config file or call the Anthropic API to resolve the latest version per alias. Alternatively, add a version-check step to the update flow that flags stale aliases.

**Duplicate sources of truth for model profiles:**
- Issue: `model-profiles.cjs` and `references/model-profiles.md` define the same agent-to-profile mapping. The code contains a comment acknowledging this is a known duplicate.
- Files: `.claude/get-shit-done/bin/lib/model-profiles.cjs`, `.claude/get-shit-done/references/model-profiles.md`
- Impact: The markdown table is used as a human reference but drifts from the runtime source. Three agents (`gsd-ui-researcher`, `gsd-ui-checker`, `gsd-ui-auditor`) are present in the `.cjs` file but missing from the markdown table. One agent (`gsd-user-profiler`) exists in `.claude/agents/` but has no entry in `MODEL_PROFILES` at all, so it falls through to a default profile with no explicit assignment.
- Fix approach: Generate the markdown table from `model-profiles.cjs` at install/update time rather than maintaining it by hand.

**Silent error swallowing across lib files:**
- Issue: Approximately 50 bare `catch {}` or `catch (e) {}` blocks across all lib files swallow errors with no logging, no rethrow, and no user-visible feedback.
- Files: `.claude/get-shit-done/bin/lib/core.cjs`, `commands.cjs`, `config.cjs`, `frontmatter.cjs`, `init.cjs`, `verify.cjs`, `phase.cjs`, `state.cjs`, `profile-pipeline.cjs`
- Impact: Failures in file I/O, JSON parsing, and shell commands are invisible. Debugging failures requires adding temporary logging. User sees no error; GSD just silently does nothing.
- Fix approach: Replace silent catches with at minimum a `console.error` or a structured log call at `debug` level. For hook scripts where silent failure is intentional (statusline, context monitor), add an explicit comment explaining why.

**Custom YAML frontmatter parser:**
- Issue: `frontmatter.cjs` is a hand-rolled YAML parser (~300 lines) using a stack-based approach. No third-party library is used.
- Files: `.claude/get-shit-done/bin/lib/frontmatter.cjs`
- Impact: Handles common cases but is fragile with edge cases: multi-line strings, quoted colons in values, deeply nested maps, inline arrays. Agent frontmatter with non-trivial YAML may parse incorrectly or silently drop fields.
- Fix approach: Replace with `js-yaml` or `yaml` npm package. Both are small, well-tested, and handle the full YAML 1.2 spec.

**Silent auto-migration of deprecated config key:**
- Issue: `config.cjs` detects and silently rewrites `.planning/config.json` when it finds the deprecated `depth` key, replacing it with `granularity`. The user is not notified.
- Files: `.claude/get-shit-done/bin/lib/config.cjs`
- Impact: Config files are mutated without user awareness. If the migration logic has a bug, the config is corrupted silently.
- Fix approach: Log a deprecation warning to stderr and tell the user the key was migrated.

## Security Considerations

**Shell command string construction in init.cjs:**
- Risk: `init.cjs` builds a `find` shell command as a string and passes it to `execSync`. If any part of the path or input is interpolated into the string without sanitization, this is a shell injection vector.
- Files: `.claude/get-shit-done/bin/lib/init.cjs`
- Current mitigation: `core.cjs` has a path sanitization regex (`isGitIgnored`) using a character allowlist, but this is in a different function and may not cover all call sites in `init.cjs`.
- Recommendations: Use `execFileSync` with an argument array instead of `execSync` with a shell string. This eliminates shell injection entirely.

**Profile pipeline reads full session history:**
- Risk: `profile-pipeline.cjs` reads Claude session JSONL history files from `~/.claude/projects/` to build behavioral profiles of the user. These files contain the full text of every message and response in every Claude session.
- Files: `.claude/get-shit-done/bin/lib/profile-pipeline.cjs`
- Current mitigation: This runs locally and is not transmitted externally as far as the code shows, but the data is highly sensitive.
- Recommendations: Add an explicit user consent step before the first profile build. Document what data is read and how it is used. Provide a command to delete the profile.

**`settings.local.json` overly restricts permissions:**
- Risk: The project-level `settings.local.json` only allows `Skill(gsd:map-codebase)`. All other GSD commands (`/gsd:plan-phase`, `/gsd:execute-phase`, etc.) require tool permissions that this file does not grant. Users who rely on project-level permissions may find most of GSD silently blocked.
- Files: `.claude/settings.local.json`
- Current mitigation: None visible. The file appears to be a leftover from a scoped test run.
- Recommendations: Expand permissions to cover all GSD skill invocations or remove the restriction entirely if it was unintentional.

## Performance Bottlenecks

**Synchronous npm version check at session start:**
- Problem: `gsd-check-update.js` spawns a detached Node.js child that calls `execSync('npm view get-shit-done-cc version')` with a 10-second timeout. This blocks the child process for up to 10 seconds on every session start.
- Files: `.claude/hooks/gsd-check-update.js`
- Cause: `npm view` makes a network request to the npm registry synchronously inside the spawned process.
- Improvement path: The spawned process is already detached so the user is not blocked, but on slow or unavailable networks it still consumes resources. Consider a longer cache TTL (currently unknown) to reduce frequency.

**Large monolithic modules:**
- Problem: Several lib files exceed 700-900 lines with multiple distinct responsibilities bundled together.
- Files: `.claude/get-shit-done/bin/lib/phase.cjs` (939 lines), `.claude/get-shit-done/bin/lib/profile-output.cjs` (931 lines), `.claude/get-shit-done/bin/lib/state.cjs` (848 lines), `.claude/get-shit-done/bin/lib/verify.cjs` (842 lines), `.claude/get-shit-done/bin/lib/init.cjs` (782 lines)
- Cause: Functions that belong in separate modules have accumulated in single files over time.
- Improvement path: Extract domain-specific logic into smaller focused modules. `phase.cjs` in particular mixes phase parsing, plan generation, and file I/O.

## Fragile Areas

**`/tmp` bridge files never cleaned up:**
- Files: `.claude/hooks/gsd-statusline.js`, `.claude/hooks/gsd-context-monitor.js`
- Why fragile: Every session creates a file at `/tmp/claude-ctx-{session_id}.json`. These are never deleted. On long-running machines with many sessions, these accumulate indefinitely.
- Safe modification: Add a cleanup step in a SessionEnd hook, or use `os.tmpdir()` entries with a TTL check on read.
- Test coverage: No tests for hook scripts.

**Runtime detection via `GEMINI_API_KEY` env var:**
- Files: `.claude/hooks/gsd-context-monitor.js`
- Why fragile: The hook checks for `process.env.GEMINI_API_KEY` as a heuristic to detect whether it is running in a Gemini-based runtime versus Claude. This will produce false positives if a user happens to have `GEMINI_API_KEY` set in their environment for other reasons (e.g., a local AI project unrelated to GSD).
- Safe modification: Use a more explicit runtime detection mechanism (e.g., a dedicated env var set by GSD itself, or checking for Claude-specific env vars).
- Test coverage: No tests for hook scripts.

**`process.env.HOME` for path resolution:**
- Files: `.claude/get-shit-done/bin/lib/verify.cjs`
- Why fragile: `process.env.HOME` is not set on Windows. Using `os.homedir()` (as other modules do) is the cross-platform Node.js idiom.
- Safe modification: Replace `process.env.HOME` with `require('os').homedir()`. Low risk change.
- Test coverage: No platform-specific tests.

## Missing Critical Features

**No test suite:**
- Problem: There are no test files anywhere in the codebase. No `*.test.*`, `*.spec.*`, `jest.config.*`, or `vitest.config.*` files exist.
- Blocks: Any refactor or bug fix carries regression risk with no safety net. The custom YAML parser, model alias resolution, config migration, and profile pipeline are entirely untested.

**No error reporting or observability:**
- Problem: There is no structured logging, no error tracking service, and no way to surface failures to the user other than process crashes. The pervasive silent `catch {}` pattern means most failures are invisible.
- Blocks: Diagnosing production issues requires adding temporary `console.log` statements and re-running commands.

## Test Coverage Gaps

**All core logic untested:**
- What's not tested: YAML frontmatter parsing, model profile resolution, config migration, phase plan generation, state read/write, profile pipeline session history reading, tool verification logic.
- Files: All files under `.claude/get-shit-done/bin/lib/`
- Risk: Breaking changes in any of these areas are invisible until a user encounters a failure.
- Priority: High for `frontmatter.cjs` (custom parser), `core.cjs` (model resolution), and `config.cjs` (migration logic).

---

*Concerns audit: 2026-03-19*
