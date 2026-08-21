---
name: commit-message
description: Generate Conventional Commit messages that match this repository's commit-msg hook. Use when the user asks for commit message help, asks for a commit title/body, or invokes /commit-message.
disable-model-invocation: true
---

# Commit Message

## Purpose

Produce a commit message that passes [`.husky/commit-msg`](../../../.husky/commit-msg). Output it in a code block so the user can copy it.

## Repository Rules

First line must match:

```text
^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9._/-]+\))?!?: .+
```

Examples from this repo: `feat: keep only the v2 platform and target ledger model`, `refactor(web): nest components in folders and enforce zero lint warnings`, `chore: add knip, husky, and lint-staged quality gates`.

## Required Output Format

```text
type(scope): subject

- optional body line 1 (<=120 chars)
- optional body line 2 (<=120 chars)
```

Omit `(scope)` when it does not help. Subject is imperative and lowercase after the colon.

```text
chore: add agent skills, rules, and skill sync
```

## Allowed Types

`feat` `fix` `refactor` `perf` `test` `docs` `build` `ci` `chore` `style` `revert`

Useful scopes: `core`, `cli`, `web`, `db`, `deps`. Breaking change: `feat(core)!: …` (`!` before `:`).

## Workflow

1. `git status`, `git diff`, `git log -n 10 --oneline`
2. Pick `type` from intent (new behavior → `feat`, bug → `fix`, cleanup → `refactor`, tooling → `chore`)
3. One-line subject; body only for why
4. Return only the proposed message unless the user asks for alternatives

## Quality Checks

- First line matches the hook regex (space after `:`).
- Body lines <= 120 chars.
- Tone matches recent history: short, imperative, no trailing period on the subject.
