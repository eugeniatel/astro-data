# Architecture

**Analysis Date:** 2026-03-19

## Pattern Overview

**Overall:** Agentic Workflow Framework (Claude Code Plugin)

**Key Characteristics:**
- Installed as a local Claude Code project config (`.claude/` directory), not a traditional application
- Orchestrator-subagent pattern: commands spawn named subagents, stay lean, delegate execution
- All persistent project state lives in `.planning/` (Markdown + JSON files)
- A compiled Node.js CLI (`gsd-tools.cjs`) handles all file operations, config, and state mutations
- Multi-runtime compatible: designed to work in Claude Code, GitHub Copilot, Gemini, OpenCode

## Layers

**Command Layer:**
- Purpose: Entry points that users invoke via slash commands (e.g., `/gsd:plan-phase 1`)
- Location: `.claude/commands/gsd/`
- Contains: Thin `.md` files that forward to workflow layer with argument parsing
- Depends on: Workflow layer
- Used by: End user (via Claude Code slash command interface)

**Workflow Layer:**
- Purpose: Full orchestration logic for each GSD command; reads context, spawns subagents, handles control flow
- Location: `.claude/get-shit-done/workflows/`
- Contains: Detailed `.md` files with `<process>`, `<step>`, and bash command blocks; one file per command
- Depends on: CLI tools layer (gsd-tools.cjs), subagent layer, planning state
- Used by: Command layer

**Subagent Layer:**
- Purpose: Specialized Claude agents that perform a single focused job (plan, execute, verify, etc.)
- Location: `.claude/agents/`
- Contains: `.md` files with YAML frontmatter (`name`, `tools`, `color`) and agent instructions
- Depends on: CLI tools layer, `.planning/` state files
- Used by: Workflow layer (spawned via `Task(subagent_type="gsd-*")`)

**CLI Tools Layer:**
- Purpose: Centralized Node.js utility replacing repetitive inline bash patterns across 50+ workflow files
- Location: `.claude/get-shit-done/bin/gsd-tools.cjs` (entrypoint)
- Contains: Single compiled executable that dispatches to `lib/` modules
- Depends on: `.planning/` state files, filesystem
- Used by: Workflow layer and subagent layer (called via `node .claude/get-shit-done/bin/gsd-tools.cjs <command>`)

**Library Layer:**
- Purpose: Modular Node.js CommonJS modules providing domain logic for CLI tools
- Location: `.claude/get-shit-done/bin/lib/`
- Contains: `core.cjs`, `state.cjs`, `phase.cjs`, `roadmap.cjs`, `config.cjs`, `init.cjs`, `milestone.cjs`, `model-profiles.cjs`, `frontmatter.cjs`, `template.cjs`, `verify.cjs`, `commands.cjs`, `profile-output.cjs`, `profile-pipeline.cjs`
- Depends on: Node.js `fs`, `path`, `child_process`; no external npm dependencies
- Used by: `gsd-tools.cjs` entrypoint

**Planning State Layer:**
- Purpose: Human-readable project memory and configuration persisted to disk
- Location: `.planning/`
- Contains: `STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `config.json`, `PROJECT.md`, `phases/`, `codebase/`
- Depends on: Nothing (pure data)
- Used by: All layers read from and write to this layer

**Hook Layer:**
- Purpose: Lifecycle automation triggered by Claude Code session events
- Location: `.claude/hooks/`
- Contains: `gsd-check-update.js` (SessionStart), `gsd-context-monitor.js` (PostToolUse), `gsd-statusline.js` (statusLine)
- Depends on: Claude Code hook API, tmpdir for inter-hook bridge files
- Used by: Claude Code runtime automatically

**Reference Layer:**
- Purpose: Documentation embedded into workflows and agents as authoritative behavioral specifications
- Location: `.claude/get-shit-done/references/`
- Contains: `planning-config.md`, `model-profiles.md`, `verification-patterns.md`, `checkpoints.md`, `git-integration.md`, `tdd.md`, `ui-brand.md`, `user-profiling.md`, `questioning.md`, and others
- Depends on: Nothing
- Used by: Workflows include references via `@path` syntax or direct reads

## Data Flow

**Phase Planning Flow:**

1. User invokes `/gsd:plan-phase 1` (command layer)
2. Workflow `.claude/get-shit-done/workflows/plan-phase.md` runs
3. Workflow calls `node gsd-tools.cjs init plan-phase 1` to load config, phase info, model assignments
4. Workflow optionally spawns `gsd-phase-researcher` subagent (produces `RESEARCH.md`)
5. Workflow spawns `gsd-planner` subagent (produces `PLAN.md` files in `.planning/phases/01-*/`)
6. Workflow spawns `gsd-plan-checker` subagent (reviews plan quality, returns pass/fail)
7. On fail, planner is re-invoked with checker feedback (max 3 revision loops)
8. Workflow commits planning artifacts to git (if `commit_docs: true`)

**Phase Execution Flow:**

1. User invokes `/gsd:execute-phase 1` (command layer)
2. Workflow `.claude/get-shit-done/workflows/execute-phase.md` runs
3. Workflow calls `node gsd-tools.cjs init execute-phase 1` to load plans, models, branching config
4. Workflow groups plans into dependency waves (parallel by default)
5. Each wave: spawns one `gsd-executor` subagent per plan (parallel)
6. Each executor reads `PLAN.md`, implements tasks, commits per-task, writes `SUMMARY.md`
7. After all waves: spawns `gsd-verifier` subagent to validate completion
8. Workflow updates `STATE.md` via `node gsd-tools.cjs state patch`

**State Management:**

- `.planning/STATE.md` is the single source of truth for project progress
- Workflows read state via `node gsd-tools.cjs state load` (returns JSON)
- Workflows write state via `node gsd-tools.cjs state patch --field value ...`
- State fields: current phase, phase status, last commit, active milestone
- YAML frontmatter in phase files (PLAN.md, SUMMARY.md) carries per-file metadata

**Model Resolution Flow:**

1. `config.json` stores `model_profile` (quality / balanced / budget)
2. `gsd-tools.cjs resolve-model <agent-type>` maps profile + agent to concrete model alias
3. Alias (opus/sonnet/haiku) is passed to subagent spawn calls
4. Source of truth: `.claude/get-shit-done/bin/lib/model-profiles.cjs`

## Key Abstractions

**PLAN.md:**
- Purpose: Executable task list for a single executor agent; a prompt, not a document
- Examples: `.planning/phases/01-setup/PLAN-01-setup.md`
- Pattern: Tasks grouped with dependencies, wave assignments, success criteria

**SUMMARY.md:**
- Purpose: Post-execution record produced by each executor; proof of completion
- Examples: `.planning/phases/01-setup/SUMMARY-01-setup.md`
- Pattern: YAML frontmatter with status, then human-readable summary of changes made

**STATE.md:**
- Purpose: Project-wide memory; survives `/clear` and session restarts
- Location: `.planning/STATE.md`
- Pattern: Markdown with structured fields readable by both humans and `gsd-tools.cjs`

**Model Profiles:**
- Purpose: Map cost-vs-quality tradeoff preferences to concrete models per agent type
- Location: `.claude/get-shit-done/bin/lib/model-profiles.cjs`
- Pattern: `{ 'gsd-executor': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' } }`

**Init Commands:**
- Purpose: Single-call bootstrapping that returns all context a workflow needs in one JSON payload
- Pattern: `node gsd-tools.cjs init execute-phase 1` returns models, phase info, plans, config flags
- Large payloads written to tmpfile, returned as `@file:/tmp/gsd-*.json` path

## Entry Points

**`/gsd:new-project`:**
- Location: `.claude/commands/gsd/new-project.md` (forwards to) `.claude/get-shit-done/workflows/new-project.md`
- Triggers: User typing `/gsd:new-project` in Claude Code
- Responsibilities: Questioning, research, requirements definition, roadmap creation, state initialization

**`/gsd:plan-phase`:**
- Location: `.claude/commands/gsd/plan-phase.md` (forwards to) `.claude/get-shit-done/workflows/plan-phase.md`
- Triggers: User typing `/gsd:plan-phase <N>`
- Responsibilities: Research, plan creation via `gsd-planner`, plan verification via `gsd-plan-checker`

**`/gsd:execute-phase`:**
- Location: `.claude/commands/gsd/execute-phase.md` (forwards to) `.claude/get-shit-done/workflows/execute-phase.md`
- Triggers: User typing `/gsd:execute-phase <N>`
- Responsibilities: Wave-based parallel execution via `gsd-executor`, post-execution verification

**`gsd-tools.cjs`:**
- Location: `.claude/get-shit-done/bin/gsd-tools.cjs`
- Triggers: Called via `node` by any workflow or agent bash block
- Responsibilities: All file I/O, state mutations, config reads, phase operations, git commits

**SessionStart Hook:**
- Location: `.claude/hooks/gsd-check-update.js`
- Triggers: Every new Claude Code session
- Responsibilities: Background check for GSD version updates, writes result to cache

## Error Handling

**Strategy:** Fail-fast with actionable error messages; most errors exit with code 1 and a plain-English message.

**Patterns:**
- `gsd-tools.cjs` writes errors to stderr via `error(message)` which calls `process.exit(1)`
- Workflow files check init output for `phase_found: false`, `plan_count: 0`, etc. and display error banners before exiting
- Subagent spawn failures fall back to sequential inline execution (runtime compatibility)
- Context window exhaustion is proactively warned by `gsd-context-monitor.js` hook at 35% and 25% remaining

## Cross-Cutting Concerns

**Logging:** No structured logging. Workflows output formatted banners to Claude's conversation. Hooks write metrics to tmpfiles.

**Validation:** `gsd-tools.cjs validate health [--repair]` checks `.planning/` integrity. Called by `/gsd:health`.

**Authentication:** None. GSD is a local tool with no external auth. Credentials for services (Brave Search API) are stored as environment variables.

---

*Architecture analysis: 2026-03-19*
