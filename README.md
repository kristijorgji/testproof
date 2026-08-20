# Testproof

Git-native test case management. Flow **definitions** stay in YAML in your repo. **Runs**, coverage snapshots and manual sessions live in Postgres.

```bash
pnpm install
pnpm --filter @testproof/core test
npx testproof init
npx testproof validate
npx testproof generate
```

## Packages

| Package | Role |
| --- | --- |
| `@testproof/core` | Zod schema, YAML document editing, coverage, markdown/HTML renderers, result ingest |
| `testproof` | CLI: `init`, `validate`, `generate`, `report`, `push`, `migrate` |
| `@testproof/db` | Drizzle schema + migrations |
| `@testproof/web` | Next.js 16 app (Hono API, GitHub sync, editor, coverage, runs, sessions) |

## Self-host

```bash
cp .env.example .env
docker compose up
```

Open http://localhost:3100. The web UI commits ledger edits back to GitHub when a repo is connected. Coverage is computed in CI by the CLI and posted to `POST /api/v1/coverage`.

## Ledger

`version: 1` files (the original `scope: common|web|mobile` format) still parse. `testproof migrate` rewrites them to `version: 2` with a platform tree and optional dimensions.

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

Omitting `dimensions` on a target means the platform as a whole, not every combination.

## Licence

MIT
