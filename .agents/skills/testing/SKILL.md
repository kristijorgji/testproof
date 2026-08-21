---
name: testing
description: >-
  Vitest and test-data conventions. Use when writing or editing
  *.test.ts, *.test.tsx, or *.spec.*. Covers the @test/* alias, createX
  factories, fixtures, and MSW handler naming.
---

# Testing

Vitest is the runner in every package (`vitest run`). Package tests sit in `packages/<name>/test/` next to `src/`. Web unit tests are `apps/web/src/**/*.test.ts` plus `.storybook/**/*.test.ts`.

## Web `@test/*`

Shared web test infrastructure lives in `apps/web/test/`, imported as `@test/*` (tsconfig, Vitest, and Storybook aliases):

```text
apps/web/test/
  factories/     createLedger, createFlow, createProject, …
  fixtures/      byte-stable YAML / DEMO_LEDGER
  msw/           HTTP handler factories
  server.ts      setupServer()
  utils/         Vitest MSW lifecycle
```

Do not add new helpers under `src/test-utils` or `src/mocks`. Core/CLI/DB tests keep using local `test/` folders and `@testproof/core` types — they must not depend on `apps/web`.

## Factories: `createX(overrides = {})`

```ts
export function createFlow(overrides: Partial<Flow> = {}): Flow {
  return {
    id: 'FLOW-AUTH-LOGIN-SUCCESS',
    title: 'Correct credentials open the dashboard',
    targets: ['web', 'mobile'],
    ...overrides,
  };
}
```

Deterministic defaults, trailing spread, no faker. Types come from `@testproof/core` or `@/server/*` — never redeclare them.

## Factories vs fixtures

|          | Factory                                        | Fixture                                                                  |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| Use when | Defaults plus a few field overrides are enough | The payload must be identical every run (snapshots, YAML diffs, publish) |
| Example  | `createFlow({ id: 'FLOW-X' })`                 | `DEMO_LEDGER_YAML` / `DEMO_LEDGER`                                       |

Promote a literal to a factory or fixture when a second test or story needs the same shape.

## MSW: `xHandler(data, options)`

```ts
export function ledgerGetHandler(
  body: { yaml: string; revision: number; storage: 'git' | 'file' | 'db' },
  options?: MswHandlerOptions,
): ReturnType<typeof http.get> {
  return http.get(mswUrl('/api/v1/ledger'), async () => {
    const error = await applyMswOptions(options);
    return error ?? HttpResponse.json(body);
  });
}
```

Data first, `MswHandlerOptions` (`delayMs`, `status`) second. Shared helpers live in `apps/web/test/msw/_utils.ts`. Wire Vitest with `setupMsw()` (`onUnhandledRequest: 'bypass'`).

## Package tests

- `packages/core/test` covers parse, patch, coverage, render, round-trip. Ledger YAML fixtures stay under `packages/core/test/fixtures/`.
- After renderer or demo-config changes, rebuild the CLI and run `node packages/cli/dist/index.js generate --check`.
- Prefer asserting `filesByPlatform`, `targets`, and `notes`. Do not reintroduce `scope` or `note`.
