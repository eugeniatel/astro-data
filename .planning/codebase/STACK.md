# Technology Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary:**
- JavaScript (CommonJS) - All runtime tooling, hooks, and CLI logic in `.claude/get-shit-done/bin/`

**Secondary:**
- Markdown - All workflow definitions, agent instructions, templates, and planning artifacts

## Runtime

**Environment:**
- Node.js v22.14.0 - Confirmed active runtime on host machine

**Package Manager:**
- npm v11.4.1
- Lockfile: Not present (no application-level package.json with dependencies at project root)

**Module System:**
- CommonJS (`type: "commonjs"` in `.claude/package.json`)
- All library files use `.cjs` extension and `require()`/`module.exports`

## Frameworks

**Core:**
- None - The project is a Claude Code agent framework, not a web or app framework

**CLI Tool:**
- `gsd-tools.cjs` - Custom Node.js CLI at `.claude/get-shit-done/bin/gsd-tools.cjs`
  - Entry point for all GSD planning operations
  - Invoked as `node .claude/get-shit-done/bin/gsd-tools.cjs <command>`

**Hooks System:**
- Claude Code hooks (SessionStart, PostToolUse, statusLine) wired via `.claude/settings.json`
- Three hook scripts in `.claude/hooks/`: `gsd-check-update.js`, `gsd-context-monitor.js`, `gsd-statusline.js`

## Key Dependencies

**Critical:**
- Node.js built-ins only: `fs`, `path`, `os`, `child_process`, `readline` - no npm dependencies installed
- `node-fetch` / native `fetch` - Used in `.claude/get-shit-done/bin/lib/commands.cjs` for Brave Search API calls (Node 22 has native `fetch`)

**Infrastructure:**
- Git - Required for all commit operations, branch management, and `.planning/` tracking
- Claude Code CLI - The host runtime that executes hooks and agent commands

## Configuration

**Environment:**
- `BRAVE_API_KEY` - Optional env var enabling web search via Brave Search API
- `CLAUDE_CONFIG_DIR` - Optional override for config directory location (multi-account setups)
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` - Controls context compaction threshold

**Build:**
- No build step required
- All `.cjs` files are pre-compiled/authored as CommonJS and run directly with Node.js

**Project Config:**
- `.planning/config.json` - Per-project GSD settings (model profile, git branching, workflow toggles)
- `.claude/settings.json` - Claude Code hook registration
- `.claude/settings.local.json` - Local permission overrides

## Platform Requirements

**Development:**
- Node.js v16+ (native fetch requires v18+; v22 confirmed on host)
- Git installed and initialized in project directory
- Claude Code CLI installed

**Production:**
- Same as development - this is a local developer tooling framework
- No server deployment; runs entirely on developer machine inside Claude Code sessions

---

*Stack analysis: 2026-03-19*
