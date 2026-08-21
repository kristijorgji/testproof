# Agent instructions

Testproof is a pnpm + Turborepo monorepo for git-native test case management.

| Path                     | What it is                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `packages/core`          | Ledger schema, parse, patch, coverage, scanners, renderers, ingest                         |
| `packages/cli`           | The `testproof` CLI (`init`, `validate`, `generate`, `report`, `push`, `ledger pull/push`) |
| `packages/db`            | Drizzle schema and migrations for Postgres                                                 |
| `packages/eslint-config` | Shared flat ESLint configs (`base` and `react` presets)                                    |
| `apps/web`               | Next.js App Router UI, Hono API under `/api/v1`, Storybook                                 |
| `examples/demo`          | Fixture ledger used by CI to smoke-test the CLI                                            |

## Agent skills

Committed repo-specific skills live in [`.agents/skills/`](.agents/skills/). Read the
relevant `SKILL.md` before working in an area.

[`.agents/skills/vendor/`](.agents/skills/vendor/) holds generated copies of skills shipped
inside installed npm packages. It is filled by `prepare` / `pnpm install` via
[`scripts/sync-agent-skills.ts`](scripts/sync-agent-skills.ts). Do not edit it by hand.

Agent hard-ignore SSoT is [`.aiignore`](.aiignore); `.cursorignore`, `.codeiumignore`,
`.aiexclude`, `.clineignore` and `.geminiignore` are symlinks to it. Do not list
`.agents/skills/vendor/` there — agents must read vendored skills after prepare.

## Defaults

- Run all commands from the repo root unless a skill says otherwise.
- The ledger format is **version 2 only**. There is no v1 support and no migration path.
- Never hardcode user-facing strings in `apps/web`; use the i18n keys in `apps/web/src/i18n/locales/`.
- After any set of changes, follow [.agents/skills/code-quality/SKILL.md](.agents/skills/code-quality/SKILL.md).
