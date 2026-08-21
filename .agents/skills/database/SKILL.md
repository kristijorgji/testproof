---
name: database
description: >-
  Drizzle and Postgres conventions for @testproof/db. Use when changing
  schema.ts, migrations, or seeds. Covers table style, the timestamps
  helper, check constraints, and generate-then-migrate.
---

# Database

Package: `@testproof/db` at `packages/db/`. **Drizzle ORM** + **Postgres** (`postgres` / `drizzle-orm/postgres-js`). Schema: [`packages/db/src/schema.ts`](../../../packages/db/src/schema.ts). Kit config: [`drizzle.config.ts`](../../../packages/db/drizzle.config.ts) (`out: ./migrations`).

`account.scope` is Better Auth's OAuth scope column. It is unrelated to the deleted ledger `scope` field — leave it alone.

## Commands

Always generate, review the SQL, then migrate:

```bash
pnpm db:generate    # drizzle-kit generate → packages/db/migrations
pnpm db:migrate     # node packages/db/dist/migrate.js (build db first if dist is stale)
pnpm db:seed        # build + node dist/seed.js
```

Do not hand-edit old migration files. Do not add a Knex or Prisma stack.

## Table conventions

- **JS export**: camelCase (`ledgerDocuments`, `flowCoverage`, `apiTokens`).
- **SQL name**: snake_case string in the column helper (`text('ledger_path')`, `timestamp('created_at', { withTimezone: true })`).
- **PKs**: `uuid(…).primaryKey().defaultRandom()` for product tables; Better Auth tables keep `text` ids.
- **FKs**: `projectId` → `projects.id` with `onDelete: 'cascade'` unless a weaker link is intentional (`sessions.runId`).
- **JSONB**: `patches`, `summary`, `demandedCells`, `coveredCells`, `files`, `dimensions`, `metadata`. Default `[]` or `{}`.
- **Indexes**: `index('…')` / `uniqueIndex('…')` on lookup pairs (`drafts_project_branch_author`, `api_tokens_hash`).

## Timestamps helper

Reuse the shared object — do not re-type `created_at` / `updated_at` on product tables:

```ts
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  // …
  ...timestamps,
});
```

Better Auth tables (`user`, `session`, `account`, `verification`) already declare timestamps inline; do not refactor those unless you are changing auth.

## Check constraints

Constrain enums in SQL, not only in TypeScript:

```ts
export const STORAGE_MODES = ['git', 'file', 'db'] as const;

export const projects = pgTable(
  'projects',
  {
    storage: text('storage').notNull().default('git'),
    // …
  },
  (table) => [check('projects_storage_check', sql`${table.storage} in ('git', 'file', 'db')`)],
);
```

Name checks `<table>_<column>_check`. Keep the TS union (`StorageMode`) in sync with the SQL list.

## Web usage

`apps/web` imports tables from `@testproof/db` and opens a client with `createDb` / `getDb()`. Those modules stay server-only. `DATABASE_URL` defaults to `postgres://testproof:testproof@127.0.0.1:5432/testproof` in local kit/web helpers.
