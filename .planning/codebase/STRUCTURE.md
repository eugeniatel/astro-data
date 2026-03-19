# Codebase Structure

**Analysis Date:** 2026-03-19

## Directory Layout

```
gachi-pachi/                         # Project root (git repo)
├── .claude/                         # Claude Code project config (GSD framework)
│   ├── agents/                      # Named subagent definitions (18 files)
│   ├── commands/
│   │   └── gsd/                     # User-facing slash command stubs (44 files)
│   ├── get-shit-done/               # Core GSD framework files
│   │   ├── bin/
│   │   │   ├── gsd-tools.cjs        # CLI entrypoint (compiled, ~29KB)
│   │   │   └── lib/                 # Node.js CommonJS modules (14 files)
│   │   ├── references/              # Behavioral spec docs embedded in workflows
│   │   ├── templates/               # File templates for scaffolding
│   │   │   ├── codebase/            # Codebase map document templates
│   │   │   └── research-project/    # Research project document templates
│   │   └── workflows/               # Full workflow logic (one .md per command)
│   ├── hooks/                       # Claude Code lifecycle hooks (3 scripts)
│   ├── gsd-file-manifest.json       # Version manifest with file checksums
│   ├── package.json                 # Node.js type declaration (commonjs)
│   ├── settings.json                # Claude Code hook config
│   └── settings.local.json          # Local permissions override
└── .planning/                       # Project planning state (written at runtime)
    └── codebase/                    # Codebase analysis documents (this file)
```

## Directory Purposes

**`.claude/agents/`:**
- Purpose: Named subagent definitions that Claude Code can spawn via `Task(subagent_type="gsd-*")`
- Contains: One `.md` file per agent with YAML frontmatter (name, tools, color) + instructions
- Key files: `gsd-executor.md`, `gsd-planner.md`, `gsd-verifier.md`, `gsd-codebase-mapper.md`, `gsd-debugger.md`, `gsd-phase-researcher.md`, `gsd-plan-checker.md`, `gsd-integration-checker.md`, `gsd-nyquist-auditor.md`, `gsd-ui-researcher.md`, `gsd-ui-checker.md`, `gsd-ui-auditor.md`

**`.claude/commands/gsd/`:**
- Purpose: Thin stub files that forward user invocations to the workflow layer
- Contains: One `.md` per slash command (e.g., `plan-phase.md`, `execute-phase.md`)
- Key files: `new-project.md`, `plan-phase.md`, `execute-phase.md`, `map-codebase.md`, `progress.md`, `health.md`, `help.md`, `debug.md`, `verify-work.md`, `complete-milestone.md`

**`.claude/get-shit-done/bin/`:**
- Purpose: Node.js CLI tool that centralizes all file operations and state mutations
- Contains: `gsd-tools.cjs` (main executable), `lib/` directory with domain modules
- Key files: `gsd-tools.cjs`

**`.claude/get-shit-done/bin/lib/`:**
- Purpose: Domain-specific CommonJS modules required by `gsd-tools.cjs`
- Contains: 14 `.cjs` files, each handling one domain area
- Key files:
  - `core.cjs` - Path helpers, output/error utilities, config loading, shared internals
  - `state.cjs` - STATE.md read/write operations
  - `phase.cjs` - Phase CRUD, lifecycle, listing
  - `roadmap.cjs` - ROADMAP.md parsing and updates
  - `config.cjs` - `.planning/config.json` CRUD
  - `init.cjs` - Compound bootstrap commands (returns all context in one JSON call)
  - `milestone.cjs` - Milestone archival and completion
  - `model-profiles.cjs` - Agent-to-model mapping by profile
  - `frontmatter.cjs` - YAML frontmatter parsing and mutation
  - `verify.cjs` - SUMMARY.md validation logic
  - `template.cjs` - File scaffolding from templates
  - `commands.cjs` - CLI command dispatch and routing
  - `profile-output.cjs` - User profile formatting
  - `profile-pipeline.cjs` - User profile pipeline logic

**`.claude/get-shit-done/workflows/`:**
- Purpose: Full orchestration logic for every GSD command; these are what commands actually run
- Contains: One `.md` file per command with step-by-step instructions and bash blocks
- Key files: `new-project.md`, `plan-phase.md`, `execute-phase.md`, `execute-plan.md`, `verify-work.md`, `complete-milestone.md`, `health.md`, `help.md`, `progress.md`, `autonomous.md`, `debug.md`

**`.claude/get-shit-done/references/`:**
- Purpose: Authoritative behavioral specs embedded by workflows at runtime via `@path` includes
- Contains: 14 `.md` files on specific topics
- Key files: `planning-config.md`, `model-profiles.md`, `verification-patterns.md`, `checkpoints.md`, `git-integration.md`, `tdd.md`, `ui-brand.md`, `questioning.md`

**`.claude/get-shit-done/templates/`:**
- Purpose: Scaffolding templates used by `gsd-tools.cjs template` commands
- Contains: Planning document templates (Markdown) and config templates (JSON)
- Key files: `state.md`, `roadmap.md`, `project.md`, `requirements.md`, `milestone.md`, `phase-prompt.md`, `summary.md`, `UAT.md`, `DEBUG.md`, `config.json`, `codebase/` (7 codebase map templates)

**`.claude/hooks/`:**
- Purpose: Claude Code hook scripts triggered by session lifecycle events
- Contains: 3 Node.js scripts
- Key files: `gsd-check-update.js` (SessionStart), `gsd-context-monitor.js` (PostToolUse), `gsd-statusline.js` (statusLine)

**`.planning/`:**
- Purpose: Runtime-generated project planning state; written by GSD workflows and agents
- Generated: Yes (created by `/gsd:new-project` and subsequent commands)
- Committed: Yes by default (controlled by `commit_docs` config)
- Key files at runtime: `STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `config.json`, `PROJECT.md`, `phases/`, `codebase/`

## Key File Locations

**Entry Points:**
- `.claude/commands/gsd/*.md`: All user-invokable slash commands
- `.claude/get-shit-done/bin/gsd-tools.cjs`: CLI tool invoked by all workflows

**Configuration:**
- `.claude/settings.json`: Hook registrations (SessionStart, PostToolUse, statusLine)
- `.claude/settings.local.json`: Local permission overrides
- `.planning/config.json`: Per-project workflow settings (model_profile, commit_docs, branching, parallelization)
- `.claude/get-shit-done/bin/lib/model-profiles.cjs`: Agent-to-model profile mapping (source of truth)

**Core Logic:**
- `.claude/get-shit-done/workflows/execute-phase.md`: Wave-based parallel execution orchestration
- `.claude/get-shit-done/workflows/plan-phase.md`: Research-plan-check pipeline
- `.claude/get-shit-done/bin/lib/init.cjs`: Bootstrap commands (all context in one JSON call)
- `.claude/get-shit-done/bin/lib/state.cjs`: STATE.md operations

**Agent Definitions:**
- `.claude/agents/gsd-executor.md`: Plan execution agent
- `.claude/agents/gsd-planner.md`: Plan creation agent
- `.claude/agents/gsd-verifier.md`: Post-execution verification agent
- `.claude/agents/gsd-codebase-mapper.md`: Codebase analysis agent (the agent that wrote this file)

**Version Control:**
- `.claude/gsd-file-manifest.json`: SHA-256 checksums for all GSD files; used by update checker

## Naming Conventions

**Files:**
- Command stubs: kebab-case matching the command name (`plan-phase.md`, `execute-phase.md`)
- Workflow files: same kebab-case names as the commands they implement
- Library modules: kebab-case with `.cjs` extension (`model-profiles.cjs`, `profile-pipeline.cjs`)
- Agent files: `gsd-` prefix + hyphenated role (`gsd-executor.md`, `gsd-plan-checker.md`)
- Hook scripts: `gsd-` prefix + hyphenated purpose (`gsd-check-update.js`, `gsd-statusline.js`)
- Planning artifacts (runtime): UPPERCASE.md (`STATE.md`, `ROADMAP.md`, `PLAN.md`, `SUMMARY.md`)

**Directories:**
- Phase directories: zero-padded number + slug (`01-setup`, `02-authentication`)
- Milestone archives: `milestones/v{version}-phases/` (created by `complete-milestone`)

## Where to Add New Code

**New GSD command:**
1. Stub: `.claude/commands/gsd/{command-name}.md` (thin, just forwards to workflow)
2. Workflow: `.claude/get-shit-done/workflows/{command-name}.md` (full logic)
3. If new CLI operation needed: add to `.claude/get-shit-done/bin/lib/commands.cjs` or appropriate domain lib, expose via `gsd-tools.cjs` dispatch

**New subagent type:**
- Agent definition: `.claude/agents/gsd-{role}.md`
- Add to model profiles: `.claude/get-shit-done/bin/lib/model-profiles.cjs`
- Register in available_agent_types blocks in `execute-phase.md` and `plan-phase.md`

**New planning document template:**
- Codebase map templates: `.claude/get-shit-done/templates/codebase/{name}.md`
- General templates: `.claude/get-shit-done/templates/{name}.md`

**New reference document:**
- Location: `.claude/get-shit-done/references/{topic}.md`
- Include in workflows via `@/path/to/references/{topic}.md` in `<required_reading>` blocks

**New hook:**
- Script: `.claude/hooks/gsd-{purpose}.js`
- Register: `.claude/settings.json` under the appropriate hook type

**New config key:**
- Add to `VALID_CONFIG_KEYS` set in `.claude/get-shit-done/bin/lib/config.cjs`
- Add defaults to `loadConfig()` in `.claude/get-shit-done/bin/lib/core.cjs`
- Update `planning-config.md` reference doc

## Special Directories

**`.claude/`:**
- Purpose: Claude Code project configuration; contains all GSD framework code
- Generated: No (committed as part of GSD installation)
- Committed: Yes

**`.planning/`:**
- Purpose: Runtime project state written by GSD
- Generated: Yes (created by `/gsd:new-project`)
- Committed: Configurable via `commit_docs` in `.planning/config.json`

**`.planning/codebase/`:**
- Purpose: Codebase analysis documents written by `gsd-codebase-mapper` agents
- Generated: Yes (created by `/gsd:map-codebase`)
- Committed: Same as `.planning/` setting

**`.planning/phases/`:**
- Purpose: Per-phase planning artifacts (PLAN.md, SUMMARY.md, CONTEXT.md, RESEARCH.md)
- Generated: Yes
- Committed: Same as `.planning/` setting

---

*Structure analysis: 2026-03-19*
