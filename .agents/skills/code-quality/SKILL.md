---
name: code-quality
description: >-
  Code quality and pre-commit conventions for this monorepo.
  Use after completing any planned changes to ensure code quality gates pass.
  Covers Husky, lint-staged, Knip, --max-warnings 0, and the verification commands.
---

# Code Quality

## After Every Set of Changes

Run these from the repo root. Do not skip gates that apply to the files you touched.

```bash
pnpm lint
pnpm knip
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @testproof/web storybook:build
node packages/cli/dist/index.js validate
node packages/cli/dist/index.js generate --check
```

`pnpm lint` is `turbo lint`. Every package lint script passes `--max-warnings 0`, so a warning is a failure.

When the change is narrow, you may scope `typecheck` / `test` / `build` with `--filter`, then still run root `pnpm lint` and `pnpm knip`.

The demo CLI gates use the root [`testproof.config.ts`](../../../testproof.config.ts) (`examples/demo`). `generate --check` must stay byte-identical; do not Prettier-format `examples/demo/flows-coverage.md` or `examples/demo/.generated/`.

Also run `pnpm exec prettier --check .` before opening a PR. CI runs it in the `quality` job.

## Pre-Commit Hooks (Husky)

[`.husky/pre-commit`](../../../.husky/pre-commit) runs:

1. **lint-staged** — Prettier write + ESLint `--fix --max-warnings 0` on staged files ([`lint-staged.config.mjs`](../../../lint-staged.config.mjs)). Generated demo artifacts are excluded.
2. **`pnpm knip`** — unused files, exports, and dependencies ([`knip.jsonc`](../../../knip.jsonc)).
3. **Incremental `typecheck` + `test`** — `turbo typecheck test --filter='...[HEAD]'`.

[`.husky/commit-msg`](../../../.husky/commit-msg) enforces Conventional Commits. See [commit-message](../commit-message/SKILL.md).

Hooks catch mistakes on the way in, but `git commit --no-verify` still bypasses them. The unbypassable gate is the `ci-ok` required status check on protected `main`. Hooks and CI must run the same checks.

## Tools

| Tool        | Config                    | Purpose                                       |
| ----------- | ------------------------- | --------------------------------------------- |
| ESLint      | `packages/eslint-config/` | Lint; `--max-warnings 0` on every lint script |
| Prettier    | `.prettierrc`             | Formatting                                    |
| Knip        | `knip.jsonc`              | Unused files, exports, dependencies           |
| Husky       | `.husky/`                 | Git hooks                                     |
| lint-staged | `lint-staged.config.mjs`  | Pre-commit file checks                        |
| Turborepo   | `turbo.json`              | `build`, `typecheck`, `lint`, `test`          |
| Vitest      | per-package `vitest`      | Unit tests                                    |

Knip runs from the root only. Do not add it to `turbo.json`. Prefer deleting unused code over adding `ignore*` entries. Every `ignoreDependencies` / `ignoreIssues` line in `knip.jsonc` must have a `//` comment naming the channel Knip cannot see.

## Quality Checklist

- [ ] `pnpm lint` exits 0 with no warnings (`--max-warnings 0`)
- [ ] `pnpm knip` reports nothing unused
- [ ] `pnpm typecheck`, `pnpm test`, and `pnpm build` pass
- [ ] Storybook build passes if `apps/web` UI changed
- [ ] Demo `validate` and `generate --check` pass if ledger, scanners, or renderers changed
- [ ] No hardcoded user-facing strings in `apps/web` (see [i18n-management](../i18n-management/SKILL.md))
