---
name: cli-commands
description: >-
  Testproof CLI command contract. Use when changing packages/cli or
  testproof.config.ts: what each command reads, writes, and exits with,
  and how config.platforms maps to scanners.
---

# CLI commands

The published bin is `testproof` (`packages/cli`). Commands load [`TestproofConfig`](../../../packages/core/src/config.ts) via `loadConfig`: `testproof.config.ts` (or `.js` / `.mjs`) relative to cwd, unless `--config` is passed. Jiti compiles the file and aliases `@testproof/core`.

## `config.platforms` → scanners

Each entry becomes a `PlatformScannerConfig`:

| Field        | Meaning                                                           |
| ------------ | ----------------------------------------------------------------- |
| `name`       | Scanner / platform key in `idsByScanner` and hit `platform`       |
| `dir`        | Resolved against cwd before scanning                              |
| `extractor`  | `regex-tag` (source files tagged with `FLOW-…`) or `maestro-tags` |
| `ignore`     | Optional glob fragments for `regex-tag`                           |
| `linkPrefix` | Optional path prefix written into coverage file lists             |

`ledger` is the YAML path. `coreAreaIds` feeds `incompleteCoreIds`. `output.markdown` / `output.html` default to `docs/testing/flows-coverage.md` and `docs/testing/.generated/flows.html`. `server.{url,token,projectId}` (often `TESTPROOF_URL` / `TESTPROOF_TOKEN` / `TESTPROOF_PROJECT`) is required for `push` and `ledger *`.

This repo's root config points at `examples/demo` for CI.

## Commands

| Command       | Reads                        | Writes                                                         | Exit                                                                                                                                                                           |
| ------------- | ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `init`        | cwd                          | `testproof.config.ts` and `docs/testing/flows.yaml` if missing | 0 (does not overwrite)                                                                                                                                                         |
| `validate`    | ledger YAML + scanner dirs   | stdout / stderr                                                | **1** if any `FLOW-` in source is missing from the ledger; **1** if `--strict` and a core-area flow is not `automated`; else **0** (core gaps are warnings without `--strict`) |
| `generate`    | ledger + scanners            | markdown + HTML                                                | **0**; `--check` is **1** when markdown would drift, **0** when identical                                                                                                      |
| `report`      | ledger + scanners            | HTML (`output.html`)                                           | **0**; `--open` tries `open` / `xdg-open` / `start`                                                                                                                            |
| `push`        | ledger + scanners + `server` | `POST {url}/api/v1/coverage`                                   | **0** and skip if `server.url` is unset; **1** if url is set but token/project are missing or the request fails                                                                |
| `ledger pull` | `GET {url}/api/v1/ledger`    | `config.ledger`                                                | **1** if server unset, HTTP error, or local file differs without `--force`                                                                                                     |
| `ledger push` | `config.ledger`              | `PUT {url}/api/v1/ledger` with `baseRevision`                  | **1** on 409 unless `--force` re-reads revision and retries; **1** on other HTTP errors                                                                                        |

`validate` success line is scanner-generic: `testproof validate: ok (web=N mobile=M ledger=K)`.

`generate --check` compares markdown only. Do not format generated demo files with Prettier.

When changing CLI output or exit codes, update `packages/cli/test` and the demo gates in [code-quality](../code-quality/SKILL.md).
