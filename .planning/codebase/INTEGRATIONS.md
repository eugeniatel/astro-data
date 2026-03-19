# External Integrations

**Analysis Date:** 2026-03-19

## APIs & External Services

**Web Search:**
- Brave Search API - Optional web search for GSD research workflows
  - SDK/Client: Native `fetch()` (Node 22 built-in), called in `.claude/get-shit-done/bin/lib/commands.cjs` at line ~348
  - Endpoint: `https://api.search.brave.com/res/v1/web/search`
  - Auth: `BRAVE_API_KEY` environment variable
  - Behavior: When `BRAVE_API_KEY` is not set, the `websearch` command returns `{ available: false }` silently and agents fall back to Claude's built-in WebSearch tool
  - Config toggle: `brave_search: false` in `.planning/config.json` (off by default)

**Update Check:**
- npm Registry - Checked at session start to detect GSD version updates
  - Called via `npm view get-shit-done-cc version` in `.claude/hooks/gsd-check-update.js`
  - Runs in background as a detached child process; result cached to disk
  - Cache location: `~/.claude/cache/gsd-update-check.json`

## AI / LLM Provider

**Anthropic Claude API (via Claude Code):**
- All agent model calls are routed through Claude Code's built-in agent spawning
- GSD resolves which model tier to use per agent based on the active model profile
- Model tiers: `opus`, `sonnet`, `haiku`, or `inherit` (follows current session model)
- Profile table defined in `.claude/get-shit-done/bin/lib/model-profiles.cjs`
- Supports non-Anthropic providers (OpenRouter, local models) via `inherit` profile in `.planning/config.json`

## Data Storage

**Databases:**
- None - No database connections of any kind

**File Storage:**
- Local filesystem only
  - Planning artifacts stored under `.planning/` directory
  - Session history read from `~/.claude/projects/` (Claude Code's JSONL session logs)
  - Context bridge temp files written to `os.tmpdir()` as `claude-ctx-{session_id}.json`
  - Large tool output spills to `os.tmpdir()` as `gsd-{timestamp}.json`

**Caching:**
- Local file cache only at `~/.claude/cache/gsd-update-check.json`

## Authentication & Identity

**Auth Provider:**
- None - no authentication system
- The only credential in use is `BRAVE_API_KEY` (optional, for web search)

## Version Control

**Git:**
- Deep integration for all planning commit workflows
- Used via `execSync` / `spawnSync` from `child_process` in `.claude/get-shit-done/bin/lib/core.cjs`
- Supports branch strategies: `none`, `phase`, `milestone` (configured in `.planning/config.json`)
- `git check-ignore` used to detect whether `.planning/` is gitignored

## Monitoring & Observability

**Error Tracking:**
- None - errors written to stderr and exit with code 1

**Logs:**
- No persistent logging
- Context window metrics written to a session-scoped temp file by `gsd-statusline.js` and read by `gsd-context-monitor.js`

## CI/CD & Deployment

**Hosting:**
- No deployment - local developer tooling only

**CI Pipeline:**
- None

## Environment Configuration

**Required env vars:**
- None strictly required - framework operates without any env vars set

**Optional env vars:**
- `BRAVE_API_KEY` - Enables Brave Search web search integration
- `CLAUDE_CONFIG_DIR` - Override config directory (for multi-account or non-standard setups)
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` - Custom context compaction threshold

**Secrets location:**
- No secrets stored in the project; `BRAVE_API_KEY` must be set in the shell environment

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None (Brave Search is a request/response API call, not a webhook)

---

*Integration audit: 2026-03-19*
