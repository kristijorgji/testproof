# Testproof

Git-native test case management. Flow **definitions** stay in YAML in your repo.
**Runs**, coverage snapshots and manual sessions live in Postgres.

[![CI](https://github.com/kristijorgji/testproof/actions/workflows/ci.yml/badge.svg)](https://github.com/kristijorgji/testproof/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/testproof)](https://www.npmjs.com/package/testproof)

Install the CLI, write a `flows.yaml` ledger, and optionally run the web UI
against that file. Start with [Get started](#get-started).

## Table of contents

- [Install](#install)
- [Get started](#get-started)
- [Concepts](#concepts)
- [Ledger schema (v2)](#ledger-schema-v2)
- [`testproof.config.ts`](#testproofconfigts)
- [CLI reference](#cli-reference)
- [Ledger storage](#ledger-storage)
- [Integrations](#integrations)
  - [Playwright / web specs (`regex-tag`)](#playwright--web-specs-regex-tag)
  - [Maestro (`maestro-tags`)](#maestro-maestro-tags)
  - [Playwright JSON reporter (ingest)](#playwright-json-reporter-ingest)
  - [JUnit XML (ingest)](#junit-xml-ingest)
  - [Maestro run results (ingest)](#maestro-run-results-ingest)
  - [Tagging cheat sheet](#tagging-cheat-sheet)
- [Self-hosting the server](#self-hosting-the-server)
- [HTTP API](#http-api)
- [CI integration](#ci-integration)
- [Packages](#packages)
- [Contributing](#contributing)
- [Maintaining](docs/maintaining.md)
- [Releasing](#releasing)
- [Licence](#licence)

## Install

```bash
pnpm add -D testproof @testproof/core
```

The CLI (`testproof`) depends on `@testproof/core`. Install both so `testproof.config.ts`
can import `defineConfig` from the library.

## Get started

Work in **your product repository**. That is where `docs/testing/flows.yaml`,
`testproof.config.ts`, and every `npx testproof …` command live.

You do **not** clone this repository to run the CLI or the web UI. Pull the
published image (`ghcr.io/kristijorgji/testproof:0.4.2`) from a compose file
in the product repo. Clone this repo only when you are [developing the
image](#develop-the-image).

[`.env.example`](.env.example) is only for this repository’s in-tree compose.
A product repo uses its own env file for `BETTER_AUTH_SECRET`. Optional
`TESTPROOF_URL` / `TESTPROOF_TOKEN` / `TESTPROOF_PROJECT` tell the CLI how to
reach a running server — they are not a copy of this repo’s `.env`.

Pick how the web UI stores the ledger. The CLI works in every mode.

| Mode   | Source of truth                          | Pick it when                                                     |
| ------ | ---------------------------------------- | ---------------------------------------------------------------- |
| `git`  | `flows.yaml` in a connected GitHub repo  | You want every ledger edit to arrive as a commit or pull request |
| `file` | An absolute YAML path on the server host | You run the UI locally against your own working tree             |
| `db`   | A `ledger_documents` row in Postgres     | You want the UI to be authoritative and pull YAML out on demand  |

### Track A — CLI only, no server, no Docker

Run these in your **product** repository.

```bash
pnpm add -D testproof @testproof/core
npx testproof init
```

Edit `docs/testing/flows.yaml`, tag your specs with `FLOW-…` ids, then:

```bash
npx testproof validate
npx testproof generate
npx testproof report --open
```

In CI, run `testproof validate` and `testproof generate --check`.

| Command         | Reads                                                     | Writes                                                                                                  | Exit                                                                                                                                                                                 |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `init`          | cwd                                                       | `testproof.config.ts` and a starter `docs/testing/flows.yaml` when either is missing                    | always `0`                                                                                                                                                                           |
| `validate`      | `testproof.config.ts`, the ledger YAML, and scanner dirs  | nothing                                                                                                 | `1` when a scanned `FLOW-…` is missing from the ledger; `1` under `--strict` when a `coreAreaIds` flow is not fully automated; `0` otherwise (non-strict incomplete core → warnings) |
| `generate`      | same as `validate`                                        | `docs/testing/flows-coverage.md` and `docs/testing/.generated/flows.html` (paths overridable in config) | `1` if `--check` and the markdown drifted; `--check` compares **markdown only**, never the HTML                                                                                      |
| `report --open` | same as `validate`                                        | the HTML report only                                                                                    | `0`; `--open` tries `open`, then `xdg-open`, then `start`, and warns if none work                                                                                                    |
| `push`          | same as `validate`, plus `GITHUB_SHA` / `GITHUB_REF_NAME` | `POST /api/v1/coverage`                                                                                 | `0` and skip when `server.url` is unset; `1` when url is set but token/project are missing or the HTTP call fails                                                                    |
| `ledger pull`   | server ledger via `GET /api/v1/ledger`                    | `config.ledger`                                                                                         | `1` if local file changed (unless `--force`)                                                                                                                                         |
| `ledger push`   | local `config.ledger`                                     | `PUT /api/v1/ledger`                                                                                    | `1` on stale revision unless `--force`                                                                                                                                               |

### Track B — web UI in Docker, editing your own YAML (`file` mode)

In the **product** repo, add a compose file that pulls the pinned image and
mounts your ledger. Pin the version in the `image:` line. Do not use
`:latest` in copy-paste — a breaking ledger release would apply without you
choosing it.
`:latest` is still published on each `v*` tag if you want a floating tag.

```yaml
name: testproof
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: testproof
      POSTGRES_PASSWORD: testproof
      POSTGRES_DB: testproof
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U testproof']
      interval: 5s
      timeout: 5s
      retries: 10
  web:
    image: ghcr.io/kristijorgji/testproof:0.4.2
    ports:
      - '${TESTPROOF_PORT:-3100}:3100'
    volumes:
      - ./docs/testing/flows.yaml:/data/flows.yaml
    environment:
      DATABASE_URL: postgres://testproof:testproof@postgres:5432/testproof
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL:-http://localhost:3100}
      TESTPROOF_DEFAULT_STORAGE: file
      TESTPROOF_DEFAULT_LEDGER_FILE: /data/flows.yaml
    depends_on:
      postgres:
        condition: service_healthy
```

The container listens on 3100. Publish a different host port with
`TESTPROOF_PORT`. `BETTER_AUTH_URL` is the public origin of this web UI
(Better Auth is served from the same app) and must match the URL you open,
for example `http://localhost:3200` when `TESTPROOF_PORT=3200`.

`TESTPROOF_DEFAULT_STORAGE=file` plus `TESTPROOF_DEFAULT_LEDGER_FILE` seed
new projects so **Flows** opens the mounted YAML immediately. Without those
env vars, create a project then Settings → Storage → `file` and set the
absolute path inside the container (for the snippet above,
`/data/flows.yaml`).

Create an env file next to that compose (not this repo’s `.env.example`) and
set `BETTER_AUTH_SECRET` to at least 32 characters. Then from the product
repo:

```bash
docker compose --env-file .env.testproof up -d
```

The image entrypoint runs `node packages/db/dist/migrate.js` before the app
starts. Open http://localhost:3100 and sign up with email and password. Create
a project, then open **Flows** (with the default-storage env vars above the
ledger is already wired). Edit → Publish writes through the mount into
`docs/testing/flows.yaml`. Then:

```bash
git diff docs/testing/flows.yaml
npx testproof generate
```

**Without a bind mount:** mint a project API token in Settings. From the
product cwd:

```bash
TESTPROOF_URL=http://localhost:3100 TESTPROOF_TOKEN=… TESTPROOF_PROJECT=… npx testproof ledger pull
TESTPROOF_URL=http://localhost:3100 TESTPROOF_TOKEN=… TESTPROOF_PROJECT=… npx testproof ledger push
```

#### Develop the image

Clone this repository only to change the image. At this repo root,
`cp .env.example .env`, then in [`docker-compose.yml`](docker-compose.yml)
comment out `image:` and uncomment `build: { context: . }`.
`docker compose up --build` is single-arch for the machine you are on.

### Track C — `git` mode

Same compose as Track B, in the product repo. Add `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET` to that env file.

1. `docker compose --env-file .env.testproof up -d`
2. Sign in with GitHub.
3. Settings → connect owner/repo, set `ledgerPath` (for example
   `docs/testing/flows.yaml`). That path is **in the connected GitHub product
   repo**, not a file on the server disk.
4. Publish as a commit or a pull request.

### Track D — `db` mode

Requires a project already created on a running server (Track B or C).

1. Open that project and switch Storage to `db`. That seeds `ledger_documents`
   from the current source.
2. Edit in the UI. Postgres is now authoritative.
3. Export YAML from Settings, or from the **product** cwd:
   `npx testproof ledger pull`.

## Concepts

| Term          | Meaning                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------- |
| Ledger        | The YAML file of areas, groups and flows. Source of truth for **what must work**.             |
| Area          | A product slice (`AUTH`, `HOME`, …). Optional `targets` inherited by flows that declare none. |
| Group         | A titled bucket of flows inside an area.                                                      |
| Flow          | One case. Id must match `FLOW-[A-Z0-9-]+`.                                                    |
| Platform tree | Nested platforms (`web` → `web.chrome`). Parent ids expand to their leaves.                   |
| Dimension     | Orthogonal axis (`theme`, `locale`, …) that can apply to a subset of platforms.               |
| Target        | A platform (and optional dimension values) a flow is demanded on.                             |
| Cell          | One `{ platform, dimensions }` combination used for coverage.                                 |

Coverage status is derived in `@testproof/core` (`packages/core/src/coverage.ts`):

| Status      | When                                             |
| ----------- | ------------------------------------------------ |
| `manual`    | The flow is `manual: true` or `status: draft`.   |
| `automated` | Every demanded cell is matched by a scanner hit. |
| `partial`   | Some demanded cells are matched.                 |
| `todo`      | None of the demanded cells are matched.          |

A parent-platform scanner hit satisfies a leaf demand when the demanded cell
carries no dimensions (`platformCovers`). Omitting `dimensions` on a target
means the platform as a whole, not every combination.

`coreAreaIds` (in the config) marks areas whose incomplete flows warn on
`validate` and fail under `--strict`.

## Ledger schema (v2)

Ids:

- Flows: `/^FLOW-[A-Z0-9-]+$/`
- Shared steps: `/^STEP-[A-Z0-9-]+$/`
- Parameters: `/^PARAM-[A-Z0-9-]+$/`

### Root

| Field         | Required | Notes                                      |
| ------------- | -------- | ------------------------------------------ |
| `version`     | yes      | `2`                                        |
| `platforms`   | no       | If omitted, defaults to `web` and `mobile` |
| `dimensions`  | no       |                                            |
| `sharedSteps` | no       | Reusable step lists                        |
| `parameters`  | no       | Named value sets referenced by flows       |
| `areas`       | yes      | At least one                               |

### `platforms[]`

| Field      | Required                    |
| ---------- | --------------------------- |
| `id`       | yes, unique across the tree |
| `title`    | yes                         |
| `children` | no                          |

### `dimensions[]`

| Field       | Required | Notes                                  |
| ----------- | -------- | -------------------------------------- |
| `id`        | yes      |                                        |
| `title`     | no       |                                        |
| `values`    | yes      | At least one string                    |
| `appliesTo` | no       | Platform ids this dimension applies to |

### `sharedSteps[]`

| Field   | Required       |
| ------- | -------------- |
| `id`    | yes (`STEP-…`) |
| `title` | yes            |
| `steps` | yes            |

### `parameters[]`

| Field    | Required          |
| -------- | ----------------- |
| `id`     | yes (`PARAM-…`)   |
| `values` | yes, at least one |

### `areas[]`

| Field     | Required | Notes                                                                  |
| --------- | -------- | ---------------------------------------------------------------------- |
| `id`      | yes      |                                                                        |
| `title`   | yes      |                                                                        |
| `targets` | no       | Inherited by flows that declare none. Defaults to every root platform. |
| `intro`   | no       |                                                                        |
| `groups`  | yes      |                                                                        |

### `groups[]`

| Field      | Required |
| ---------- | -------- |
| `title`    | yes      |
| `subtitle` | no       |
| `notes`    | no       |
| `flows`    | yes      |

### `flows[]`

| Field             | Required | Values / pattern                                                                                                                    |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | yes      | `FLOW-[A-Z0-9-]+`                                                                                                                   |
| `title`           | yes      |                                                                                                                                     |
| `notes`           | no       |                                                                                                                                     |
| `manual`          | no       | `true` → coverage `manual`                                                                                                          |
| `refs`            | no       | String array                                                                                                                        |
| `children`        | no       | Nested sub-flows                                                                                                                    |
| `targets`         | no       | See below; implicit default applied on parse                                                                                        |
| `priority`        | no       | `low` \| `medium` \| `high` \| `critical`                                                                                           |
| `severity`        | no       | `trivial` \| `minor` \| `normal` \| `major` \| `critical` \| `blocker`                                                              |
| `type`            | no       | `functional` \| `smoke` \| `regression` \| `security` \| `usability` \| `performance` \| `accessibility` \| `acceptance` \| `other` |
| `layer`           | no       | `e2e` \| `integration` \| `api` \| `unit`                                                                                           |
| `behavior`        | no       | `positive` \| `negative` \| `destructive`                                                                                           |
| `status`          | no       | `draft` \| `active` \| `deprecated` — `draft` is treated like `manual` for coverage                                                 |
| `automation`      | no       | `automated` \| `to-be-automated` \| `manual`                                                                                        |
| `owner`           | no       |                                                                                                                                     |
| `tags`            | no       | Free-form metadata (not scanner tags)                                                                                               |
| `flaky`           | no       |                                                                                                                                     |
| `muted`           | no       |                                                                                                                                     |
| `estimateMinutes` | no       | ≥ 0                                                                                                                                 |
| `preconditions`   | no       |                                                                                                                                     |
| `postconditions`  | no       |                                                                                                                                     |
| `steps`           | no       | `{ action?, expected?, sharedStepId? }`                                                                                             |
| `links`           | no       | `{ type?, url, title? }[]`                                                                                                          |
| `parameters`      | no       | `PARAM-…` id refs                                                                                                                   |
| `custom`          | no       | `Record<string, string>`                                                                                                            |

### Targets

Each entry is either a platform id string or an object:

```yaml
targets:
  - web
  - mobile
  - platform: mobile.android
    dimensions:
      theme: [dark]
```

Dimension arrays expand to a cartesian product of cells.

**Implicit targets** when a flow has none:

- the area's `targets`, if set
- otherwise every root platform id (`web` and `mobile` when `platforms` is omitted)

```yaml
version: 2
platforms:
  - id: mobile
    title: Mobile
    children:
      - id: mobile.ios
        title: iOS
      - id: mobile.android
        title: Android
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-AUTH-LOGIN-SUCCESS
            title: Correct credentials
            targets: [web, mobile]
          - id: FLOW-PUSH-PERMISSION-RUNTIME
            title: Android 13+ notification permission
            targets: [mobile.android]
```

## `testproof.config.ts`

`defineConfig` is a typing helper. Config is discovered as `testproof.config.ts`,
`.js` or `.mjs` in the cwd, or via `--config`.

| Field              | Required | Default                                   |
| ------------------ | -------- | ----------------------------------------- |
| `ledger`           | yes      | —                                         |
| `platforms`        | yes      | scanner list                              |
| `coreAreaIds`      | no       | `[]`                                      |
| `output.markdown`  | no       | `docs/testing/flows-coverage.md`          |
| `output.html`      | no       | `docs/testing/.generated/flows.html`      |
| `markdown`         | no       | merged with `DEFAULT_MARKDOWN`            |
| `server.url`       | no       | unset → `push` skips (offline)            |
| `server.token`     | no       | typically `process.env.TESTPROOF_TOKEN`   |
| `server.projectId` | no       | typically `process.env.TESTPROOF_PROJECT` |

### `platforms[]` (`PlatformScannerConfig`)

| Field        | Required | Notes                                                                                         |
| ------------ | -------- | --------------------------------------------------------------------------------------------- |
| `name`       | yes      | Default platform id when no override tag is found                                             |
| `dir`        | yes      | Root directory to scan (resolved from cwd)                                                    |
| `extractor`  | yes      | `'regex-tag'` or `'maestro-tags'`                                                             |
| `ignore`     | no       | Directory names to skip. **`regex-tag` only.** Default: `['__screenshots__', 'node_modules']` |
| `linkPrefix` | no       | Prefix for file paths in coverage output. Default: `scanner.dir`                              |

### `markdown` (`MarkdownRenderConfig`)

| Field         | Default                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `title`       | `Test Flows & Coverage`                                                 |
| `banner`      | Generated-file warning comments                                         |
| `intro`       | Two paragraphs about definitions vs generated coverage                  |
| `goals`       | Functionality + Accessibility bullets                                   |
| `legendRows`  | Six rows explaining `FLOW-…`, `[x]`, `[ ]`, `todo`, `Partial`, `manual` |
| `footerHints` | Renderer fallback if omitted                                            |

```ts
import { defineConfig } from '@testproof/core';

export default defineConfig({
  ledger: 'docs/testing/flows.yaml',
  platforms: [
    { name: 'web', dir: 'apps/web-e2e/src/specs', extractor: 'regex-tag', ignore: ['__screenshots__'] },
    { name: 'mobile', dir: 'apps/mobile/.maestro/flows', extractor: 'maestro-tags' },
  ],
  coreAreaIds: ['AUTH', 'HOME'],
  output: {
    markdown: 'docs/testing/flows-coverage.md',
    html: 'docs/testing/.generated/flows.html',
  },
  server: {
    url: process.env.TESTPROOF_URL,
    token: process.env.TESTPROOF_TOKEN,
    projectId: process.env.TESTPROOF_PROJECT,
  },
});
```

## CLI reference

Program name `testproof`, version `0.4.2`. Unhandled errors print to stderr and
exit `1`.

| Command       | Flags                         | Exit codes                                                                                                                                                                    |
| ------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init`        | none                          | Always `0`                                                                                                                                                                    |
| `validate`    | `--strict`, `--config <path>` | `1` if a scanned FLOW id is missing from the ledger; `1` if `--strict` and a `coreAreaIds` flow is not fully automated; `0` otherwise (non-strict incomplete core → warnings) |
| `generate`    | `--check`, `--config <path>`  | `1` if `--check` and markdown drifted; `0` otherwise. `--check` compares **markdown only**, not HTML.                                                                         |
| `report`      | `--open`, `--config <path>`   | `0` (warns if `open` / `xdg-open` / `start` all fail)                                                                                                                         |
| `push`        | `--config <path>`             | `0` and skip when `server.url` is unset; `1` when url is set but token/project are missing or the HTTP call fails; `0` on success                                             |
| `ledger pull` | `--force`, `--config <path>`  | `1` if the server call fails or the local file has unsaved changes (unless `--force`); `0` on write                                                                           |
| `ledger push` | `--force`, `--config <path>`  | `1` on HTTP error or stale revision (retry with `--force`); `0` on success                                                                                                    |

`validate` success log:

```text
testproof validate: ok (web=N mobile=N ledger=N)
```

`push` reads `GITHUB_SHA` / `GITHUB_REF_NAME` for `commitSha` / `branch`, falling
back to `'local'`.

## Ledger storage

Each project picks one source of truth in Settings. Publishing from the web UI
always writes back to that source.

| Mode   | Source of truth                           | Sync-back from the UI           | How it reaches your machine                                       |
| ------ | ----------------------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| `git`  | `flows.yaml` in the connected GitHub repo | Commit or pull request          | GitHub                                                            |
| `file` | Per-project absolute YAML path            | Direct write                    | Volume-mount the file into the server, or `testproof ledger pull` |
| `db`   | `ledger_documents.yaml` row               | n/a (Postgres is authoritative) | Settings export, or `testproof ledger pull`                       |

`git` is the default. `file` requires an **absolute** path that exists and is
writable when you save Settings. In Docker, mount the host file into the
container and set that container path in Settings — see [Track B](#track-b--web-ui-in-docker-editing-your-own-yaml-file-mode).

`GET` / `PUT /api/v1/ledger` (Bearer project token) round-trip YAML for `file`
and `db` modes. Git mode returns `400` — commit to the repo instead. `PUT`
sends `{ yaml, baseRevision, message }` and returns `409` when `baseRevision`
is stale.

```bash
npx testproof ledger pull
npx testproof ledger push
```

The web UI can create, rename, move and delete flows, groups and areas, and
edit the modelled fields (priority, severity, type, owner, …). Drafts stay in
Postgres until you publish.

## Integrations

Two **scanners** walk source files and attach FLOW ids to platforms. Three
**ingest** parsers turn test-run output into `RunResult[]` for `POST /api/v1/runs`.

### Playwright / web specs (`regex-tag`)

Walks `dir` recursively. Extensions: `.ts`, `.tsx`, `.js`, `.mjs`. Skips
directory names in `ignore` (default `__screenshots__`, `node_modules`).

Flow tag regex: `@FLOW-[A-Z0-9-]+`. The `@` is **required in source** and
stripped in the ledger id. Optional per-file platform override
`@platform:([A-Za-z0-9._-]+)` — first match wins and applies to every flow id
in that file.

Tags may live in comments, test titles or the Playwright `tag:` array. The
scanner reads the whole file as UTF-8.

```ts
// @FLOW-AUTH-LOGIN-SUCCESS
// @FLOW-AUTH-LOGIN-INVALID
describe('login', () => {
  test('correct credentials', async ({ page }) => {
    /* … */
  });
});

test('home', { tag: ['@FLOW-HOME-OPENS'] }, async ({ page }) => {
  /* … */
});

// @platform:web.chrome
test('chrome-only', { tag: ['@FLOW-AUTH-LOGIN-SUCCESS'] }, async ({ page }) => {
  /* … */
});
```

### Maestro (`maestro-tags`)

Walks `dir` recursively. Extensions: `.yaml`, `.yml`. No `ignore` option — every
YAML file under `dir` is scanned.

Tags come from the top-level `tags:` block in the **header** document, **before**
the `---` separator. Each list entry must be indented so body commands like
`- launchApp` are not mistaken for tags. **No `@` prefix.** Only entries
starting with `FLOW-` count as flow ids. Optional `platform:<id>` entry.

```yaml
appId: com.example.app
tags:
  - FLOW-AUTH-LOGIN-SUCCESS
  - platform:mobile.android
---
- launchApp
```

### Playwright JSON reporter (ingest)

Input is the Playwright **JSON reporter** output (nested suite tree). Flow ids
are read from `spec.title`, `spec.tags`, `test.tags`, `test.annotations[].type`
and `test.annotations[].description`, accepting `@FLOW-…` or bare `FLOW-…`.

Status mapping (last entry in `test.results[]`, else `test.status`):

| Playwright               | Testproof |
| ------------------------ | --------- |
| `passed`                 | `pass`    |
| `failed`, `timedOut`     | `fail`    |
| `skipped`, `interrupted` | `skip`    |
| `flaky`                  | `flaky`   |
| default                  | `fail`    |

`platform` falls back to `test.projectName`, then the parser argument (default
`'web'`). One `RunResult` per flow id per test; `flowId: null` if none found.

### JUnit XML (ingest)

`FLOW-` ids are matched in the testcase `name`, `classname` and body (so ids in
failure text count).

| XML                      | Status |
| ------------------------ | ------ |
| `<failure>` or `<error>` | `fail` |
| `<skipped>`              | `skip` |
| otherwise                | `pass` |

`time` is seconds and is converted to `durationMs`. Default `platform` argument:
`'web'`.

### Maestro run results (ingest)

Not raw Maestro CLI stdout. The caller supplies structured records plus
`flowsDir`:

```ts
interface MaestroRunFile {
  path: string;
  status: 'pass' | 'fail' | 'blocked' | 'skip' | 'retest' | 'flaky';
  durationMs?: number;
  errorText?: string;
}
```

Paths are matched against the tag inventory exactly, then by suffix/prefix.
Default `platform` argument: `'mobile'`.

### Tagging cheat sheet

| Integration                  | Where to tag                    | Syntax                            | Example                                |
| ---------------------------- | ------------------------------- | --------------------------------- | -------------------------------------- |
| Playwright specs (scan)      | anywhere in `.ts/.tsx/.js/.mjs` | `@FLOW-…`, optional `@platform:…` | `// @FLOW-AUTH-LOGIN-SUCCESS`          |
| Playwright JSON (ingest)     | title, tags, annotations        | `@FLOW-…` or bare `FLOW-…`        | `{ tag: ['@FLOW-HOME-OPENS'] }`        |
| JUnit XML (ingest)           | testcase name/classname/body    | bare `FLOW-…`                     | `name="login FLOW-AUTH-LOGIN-SUCCESS"` |
| Maestro YAML (scan + ingest) | header `tags:` list             | `FLOW-…`, optional `platform:…`   | `- FLOW-AUTH-LOGIN-SUCCESS`            |

## Self-hosting the server

The default path is [Track B](#track-b--web-ui-in-docker-editing-your-own-yaml-file-mode):
a compose file **in the product repo** that pulls
`ghcr.io/kristijorgji/testproof:0.4.2` (linux/amd64 and linux/arm64). Do not
copy this repository’s `.env.example` into the product repo.

This repo’s [`docker-compose.yml`](docker-compose.yml) is for contributors. It
pins the same image tag as the snippet above. Uncomment `build: .` only when
iterating on the image locally ([Develop the image](#develop-the-image)).
The image is not a Next.js standalone build — it ships the monorepo and
runs `next start` on port 3100.

```bash
cd /path/to/testproof
cp .env.example .env
docker compose up
```

Open http://localhost:3100 (or `http://localhost:$TESTPROOF_PORT` if you
changed the host port). Sign up, create a project, connect a GitHub
repository in Settings (owner + repo name) and mint a project API token. The
web UI commits ledger edits back to GitHub when a repo is connected. Coverage
is computed in CI by the CLI and posted to `POST /api/v1/coverage`.

Environment (from `.env.example`):

| Variable                                                  | Purpose                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`                                            | Postgres                                                            |
| `BETTER_AUTH_SECRET`                                      | Session secret (≥ 32 characters)                                    |
| `TESTPROOF_PORT`                                          | Host port mapped to the container’s 3100 (default 3100)             |
| `BETTER_AUTH_URL`                                         | Public origin of this web UI; must match the URL you open           |
| `TESTPROOF_DEFAULT_STORAGE`                               | When `file`, new projects use file storage (with ledger path below) |
| `TESTPROOF_DEFAULT_LEDGER_FILE`                           | Absolute path inside the container for new file-mode projects       |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`               | OAuth                                                               |
| `GITHUB_WEBHOOK_SECRET`                                   | HMAC for `POST /api/webhooks/github`                                |
| `TESTPROOF_URL` / `TESTPROOF_TOKEN` / `TESTPROOF_PROJECT` | CLI `push` and `ledger pull` / `ledger push`                        |

## HTTP API

The API is [Hono](https://hono.dev) with `@hono/zod-openapi`, mounted at
[`apps/web/src/app/api/[[...route]]/route.ts`](apps/web/src/app/api/[[...route]]/route.ts)
from the `OpenAPIHono` app in
[`apps/web/src/server/api/index.ts`](apps/web/src/server/api/index.ts).

Auth for `/api/v1/*` is `Authorization: Bearer <project token>`
([`apps/web/src/server/api/middleware/token.ts`](apps/web/src/server/api/middleware/token.ts)).
The token is SHA-256 hashed and looked up on `api_tokens`. The body `projectId`
must match the token's project (403 otherwise).

| Method       | Path                   | Auth                       | Purpose                                                    |
| ------------ | ---------------------- | -------------------------- | ---------------------------------------------------------- |
| `GET`        | `/api/v1/openapi.json` | none                       | OpenAPI 3.1 spec                                           |
| `POST`       | `/api/v1/coverage`     | Bearer project token       | Ingest a coverage snapshot                                 |
| `GET`        | `/api/v1/ledger`       | Bearer project token       | Read the current ledger (`file`/`db`; `400` in `git` mode) |
| `PUT`        | `/api/v1/ledger`       | Bearer project token       | Replace the ledger (`file`/`db`; `409` on stale revision)  |
| `POST`       | `/api/v1/runs`         | Bearer project token       | Ingest a test run                                          |
| `POST`       | `/api/webhooks/github` | `x-hub-signature-256` HMAC | Mark open drafts stale when the ledger path is pushed      |
| `GET`/`POST` | `/api/auth/*`          | better-auth session        | Sign-in / sign-up (separate Next handler)                  |

### `POST /api/v1/coverage`

```json
{
  "projectId": "…",
  "commitSha": "abc123",
  "branch": "main",
  "summary": { "automated": 10, "partial": 2, "todo": 5, "manual": 1 },
  "flows": [
    {
      "id": "FLOW-AUTH-LOGIN-SUCCESS",
      "status": "automated",
      "demanded": [{ "platform": "web", "dimensions": {} }],
      "covered": [{ "platform": "web", "dimensions": {} }],
      "platforms": { "web": ["apps/web-e2e/src/specs/auth.spec.ts"] }
    }
  ]
}
```

### `POST /api/v1/runs`

```json
{
  "projectId": "…",
  "source": "playwright",
  "commitSha": "abc123",
  "branch": "main",
  "results": [{ "flowId": "FLOW-AUTH-LOGIN-SUCCESS", "platform": "web", "status": "pass", "durationMs": 1200 }]
}
```

`source` is `playwright` \| `junit` \| `maestro` \| `manual`. Result status is
`pass` \| `fail` \| `blocked` \| `skip` \| `retest` \| `flaky`.

### GitHub webhook

`POST /api/webhooks/github` verifies `x-hub-signature-256` against
`GITHUB_WEBHOOK_SECRET`. On a push that touches the project's ledger path, open
drafts are marked `stale`.

## CI integration

Composite action
[`kristijorgji/testproof/.github/actions/testproof`](.github/actions/testproof):

```yaml
- uses: kristijorgji/testproof/.github/actions/testproof@main
  with:
    url: ${{ secrets.TESTPROOF_URL }}
    token: ${{ secrets.TESTPROOF_TOKEN }}
    project: ${{ secrets.TESTPROOF_PROJECT }}
    config: testproof.config.ts
```

It resolves `node_modules/.bin/testproof` or falls back to `npx --yes testproof@latest`,
then runs `validate` and `push`.

Or call the CLI directly:

```yaml
- run: npx testproof validate
- run: npx testproof generate --check
```

## Packages

| Package           | Role                                                                                | Published    |
| ----------------- | ----------------------------------------------------------------------------------- | ------------ |
| `@testproof/core` | Zod schema, YAML document editing, coverage, markdown/HTML renderers, result ingest | yes          |
| `testproof`       | CLI: `init`, `validate`, `generate`, `report`, `push`, `ledger pull`, `ledger push` | yes          |
| `@testproof/db`   | Drizzle schema + migrations                                                         | no (private) |
| `@testproof/web`  | Next.js 16 app (Hono API, GitHub sync, editor, coverage, runs, sessions)            | no (private) |

## Contributing

```bash
pnpm install
pnpm lint
pnpm knip
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @testproof/web storybook
```

Node ≥ 22, pnpm 9.15.4. Storybook lives in `apps/web`.

A Husky pre-commit hook runs `lint-staged`, `knip`, and an incremental
`typecheck`/`test` on affected packages. `git commit --no-verify` still
bypasses the hook. Protected `main` requires `quality`, `ledger`, and the
`ci-ok` rollup. Owner and maintainer gates (ruleset, Dependabot rebase token,
auto-merge, releases) are in [docs/maintaining.md](docs/maintaining.md).

## Releasing

`@testproof/core` and `testproof` publish in lockstep from GitHub Actions on
`v*` tags via [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
(OIDC, no `NPM_TOKEN`). The same tag also creates a GitHub Release and pushes
`ghcr.io/kristijorgji/testproof:<version>` plus `:latest`. The workflow fails if
the tag does not match `packages/core/package.json` version.

```bash
pnpm set-version 0.2.0
git commit -am "chore(release): 0.2.0"
git tag v0.2.0
git push --follow-tags
```

The first publish of each package is a one-time `npm publish --access public`
from `packages/core` and `packages/cli` after `npm login`. Then attach a trusted
publisher on npmjs.com: GitHub user `kristijorgji`, repository `testproof`,
workflow filename `release.yml`.

## Licence

MIT
