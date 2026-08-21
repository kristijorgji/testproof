---
name: core-library
description: >-
  Ledger schema and coverage semantics for @testproof/core. Use when changing
  schema.ts, parse.ts, patch.ts, coverage.ts, targets.ts or the renderers.
---

# Core library

`packages/core` is the v2 ledger. There is no v1 parser and no migrate path. **`scope` and `note` do not exist** — use `targets` and `notes`.

## Ledger shape

```text
Ledger (version: 2)
├── platforms?     PlatformNode[]     id / title / children?
├── dimensions?    Dimension[]        id / values / appliesTo?
├── sharedSteps?   SharedStep[]
├── parameters?    ParameterDef[]
└── areas[]
    ├── id, title, intro?, targets?
    └── groups[]
        └── flows[]   Flow (id FLOW-…, title, targets?, children?, …)
```

A target is a platform id string or `{ platform, dimensions? }`. Area `targets` are inherited by flows that omit their own (`attachImplicitTargets` in `parse.ts`). If neither flow nor area declares targets, the fallback is every root platform id (`rootPlatformIds`).

Flow ids match `FLOW-[A-Z0-9-]+`. Default platforms when the ledger omits `platforms`: `web` and `mobile`.

## `resolveTargets`

[`targets.ts`](../../../packages/core/src/targets.ts) expands `flow.targets` to **leaf cells**:

1. Resolve the platform id.
2. Replace a parent node with its leaves (`platformLeaves`). `targets: [mobile]` on a tree with `mobile.ios` / `mobile.android` becomes those two cells.
3. Cartesian-expand declared dimension values onto each leaf.
4. Dedup with `cellKey` (`platform` or `platform|k=v,…`).

`cellsMatch` treats a parent/child platform prefix as a match, and an empty dimension map as a wildcard.

## `statusFromCells` / `deriveCoverage`

`deriveCoverage(ledger, { scanners })` walks flattened flows, collects scanner hits, and sets:

| Condition                                     | Status      |
| --------------------------------------------- | ----------- |
| `flow.manual` or `flow.status === 'draft'`    | `manual`    |
| No demanded cells, at least one hit           | `automated` |
| No demanded cells, no hits                    | `todo`      |
| Every demanded cell matched by a covered cell | `automated` |
| Some demanded cells matched                   | `partial`   |
| None matched                                  | `todo`      |

A scanner named `mobile` covers demanded leaves `mobile.ios` / `mobile.android` when the demanded cell has no dimensions (`platformCovers`). Hits are recorded as `{ platform, dimensions: {} }`.

Scanners come from `TestproofConfig.platforms`: `regex-tag` (web/Playwright-style `FLOW-` tags) or `maestro-tags`.

## Patch-op catalogue

[`LedgerPatch`](../../../packages/core/src/patch.ts) is a discriminated union. Apply through the YAML document so comments and key order survive.

| `op`                                        | Purpose                                                                           |
| ------------------------------------------- | --------------------------------------------------------------------------------- |
| `set-flow-field`                            | `title` / `notes` / `owner` / `preconditions` / `postconditions` (`null` deletes) |
| `set-flow-enum`                             | `priority` / `severity` / `type` / `layer` / `behavior` / `status` / `automation` |
| `set-flow-flag`                             | `manual` / `flaky` / `muted`                                                      |
| `set-flow-number`                           | `estimateMinutes`                                                                 |
| `set-flow-list`                             | `tags` / `parameters` / `refs`                                                    |
| `set-flow-targets`                          | replace `targets`                                                                 |
| `add-flow` / `remove-flow` / `move-flow`    | tree edits                                                                        |
| `set-group-field`                           | `title` / `subtitle` / `notes`                                                    |
| `add-group` / `remove-group` / `move-group` |                                                                                   |
| `set-area-field`                            | `title` / `intro`                                                                 |
| `set-area-targets`                          | replace area `targets`                                                            |
| `add-area` / `remove-area` / `move-area`    |                                                                                   |
| `set-root-seq`                              | `platforms` or `dimensions`                                                       |

There are no `set-flow-manual`, `set-flow-refs`, or `set-area-scope` aliases. Do not write a `note` or `scope` key.

## Renderers and validate

Markdown and HTML are platform-generic: they loop demanded platforms (plus extra hit platforms) and expose `data-platforms`, not `data-scope`. `validateLedger` returns `idsByScanner`, `ledgerIds`, `missingFromLedger`, and `incompleteCoreIds`.
