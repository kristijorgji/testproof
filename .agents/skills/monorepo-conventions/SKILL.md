---
name: monorepo-conventions
description: >-
  Enforces monorepo structure, naming, and import conventions.
  Use when creating new apps, packages, files, or imports. Covers package
  names, workspace deps, @testproof/core subpath exports, and the turbo graph.
---

# Monorepo Conventions

## Layout

```text
root/
├── apps/web/                 # @testproof/web — Next.js + Hono /api/v1 + Storybook
├── packages/core/            # @testproof/core — ledger, coverage, renderers (published)
├── packages/cli/             # testproof — CLI bin (published)
├── packages/db/              # @testproof/db — Drizzle schema + migrations (private)
├── packages/eslint-config/   # @testproof/eslint-config — flat ESLint presets (private)
├── examples/demo/            # Fixture ledger + scanners for CLI CI
├── scripts/                  # Root tooling (set-version, sync-agent-skills)
└── .agents/skills/           # Repo skills (committed) + vendor/ (prepare)
```

Workspaces are `packages/*` and `apps/*` ([`pnpm-workspace.yaml`](../../../pnpm-workspace.yaml)).

## Package names

| Directory                | `package.json` `name`      | Public?               |
| ------------------------ | -------------------------- | --------------------- |
| `packages/core`          | `@testproof/core`          | Yes                   |
| `packages/cli`           | `testproof`                | Yes (bin `testproof`) |
| `packages/db`            | `@testproof/db`            | No                    |
| `packages/eslint-config` | `@testproof/eslint-config` | No                    |
| `apps/web`               | `@testproof/web`           | No                    |
| repo root                | `testproof-workspace`      | Private workspace     |

New packages: `@testproof/<name>`, directory `packages/<name>/`, included automatically by the glob.

## Imports

- Cross-package: the package name, never a relative path into another workspace.
- Inside `apps/web`: `@/` → `./src/`. Spell the file (`@/components/flow-tree/FlowDetail/FlowDetail`).
- `@testproof/core` subpath exports (use these when you only need that surface):

  | Specifier                   | Module                         |
  | --------------------------- | ------------------------------ |
  | `@testproof/core`           | full public API                |
  | `@testproof/core/parse`     | `parseLedger`, flatten helpers |
  | `@testproof/core/schema`    | Zod schemas and types          |
  | `@testproof/core/platforms` | platform tree helpers          |

- Workspace deps: `"@testproof/core": "workspace:*"` inside this repo. The published CLI depends on a semver range of `@testproof/core`.
- Add deps with `pnpm add` in the target package, or `pnpm add -Dw` at the root for shared tooling.

## Turbo ([`turbo.json`](../../../turbo.json))

| Task        | `dependsOn` | Cached                      |
| ----------- | ----------- | --------------------------- |
| `build`     | `^build`    | Yes (`dist/**`, `.next/**`) |
| `typecheck` | `^build`    | Yes                         |
| `test`      | `^build`    | Yes                         |
| `lint`      | none        | Yes                         |
| `fix`       | none        | Yes                         |
| `dev`       | none        | No (persistent)             |
| `clean`     | none        | No                          |

`typecheck` and `test` wait on dependency `build` because `@testproof/core` and `@testproof/db` are consumed via `dist/`. After changing those packages, build them (or run root `pnpm build`) before web/cli typecheck.

Knip is a root script, not a turbo task.

## File moves

Use `git mv` for tracked renames so history stays a rename, not delete+add.

## Env

Never commit `.env`. Document keys in `.env.example`. Root scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `knip`, `db:generate`, `db:migrate`, `db:seed`, `storybook`.
