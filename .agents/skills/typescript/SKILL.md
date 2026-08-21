---
name: typescript
description: >-
  TypeScript best practices and coding standards for this monorepo.
  Use when writing, reviewing, or refactoring TypeScript code. Covers
  no any, no non-null assertions, type-only imports, explicit return types,
  and no pure type aliases.
---

# TypeScript

Enforced by `@testproof/eslint-config` (`explicitTypes: true`, `codeQuality: true`) plus the shared `baseConfig` rules.

## Required

- **No `any`.** Use a real type, `unknown`, or a generic. `@typescript-eslint/no-explicit-any` is an error.
- **No non-null assertions (`!`).** Narrow with a check or throw. `@typescript-eslint/no-non-null-assertion` is an error.
- **Type-only imports.** `import type { Ledger } from '@testproof/core'`. `@typescript-eslint/consistent-type-imports` prefers `type` imports.
- **Explicit return types** on exported functions and on non-TSX module boundaries. `explicitTypes: true` turns this on for `.ts` files.
- **No pure type aliases** for object shapes. Write `interface FlowCoverage { … }`, not `type FlowCoverage = { … }`. Use `type` for unions, intersections, mapped types, and `z.infer<…>` results.

```ts
// Good
export interface DeriveCoverageOptions {
  scanners: PlatformScannerConfig[];
}

// Bad — pure object alias (kj/no-pure-type-alias)
export type DeriveCoverageOptions = {
  scanners: PlatformScannerConfig[];
};

// Good — union / infer
export type FlowTarget = z.infer<typeof targetSchema>;
export type StorageMode = (typeof STORAGE_MODES)[number];
```

TSX files in `apps/web` turn off `@typescript-eslint/explicit-module-boundary-types`. Stories and tests also relax explicit-return-type. Do not copy those exceptions into `packages/*`.

## Also follow

- Search the repo before adding a helper or type. Import from `@testproof/core`, `@testproof/core/schema`, `@testproof/core/parse`, or `@testproof/db` — do not redeclare ledger or DB shapes.
- Prefix unused bindings with `_`. `@typescript-eslint/no-unused-vars` ignores `^_`.
- `const` by default. Early returns. `async`/`await` over callbacks.
- No default exports except Next.js `page.tsx` / `layout.tsx` / `route.ts` and Storybook `export default meta`.
- No barrel `index.ts` in `apps/web` components. Package entrypoints (`packages/core/src/index.ts`, `packages/db/src/index.ts`) are the exception.
- Never use `@ts-ignore` / `@ts-expect-error` without a one-line reason.
