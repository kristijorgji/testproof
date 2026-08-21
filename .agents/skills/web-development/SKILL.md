---
name: web-development
description: >-
  Next.js App Router conventions for apps/web. Use when creating pages,
  components, or API routes. Covers the page.tsx plus XPageContent split,
  server-only DB modules, Tailwind CSS variables, and one-folder-per-component.
---

# Web Development

Package: `@testproof/web` at `apps/web/`. Next.js App Router, Tailwind v4, Hono under `/api/v1`, Better Auth, react-i18next.

## Server vs client

- **Server Components are the default.** `page.tsx` and `layout.tsx` stay server-side: auth (`requireUser`), Drizzle queries, and `getServerTranslation` when the page still renders copy. After the `XPageContent` split, copy lives in the client component via `useTranslation`.
- Mark a file `'use client'` only when it needs state, events, or a browser hook.
- Modules that touch the database, GitHub tokens, or the filesystem must `import 'server-only'` (see `src/server/ledger-source.ts`). Do the same for new DB helpers under `src/server/`.
- Never import `@testproof/db` or `src/server/*` from a client component. Pass serializable props down.

## `page.tsx` + `XPageContent`

Keep the route file thin. Data loading stays in `src/app/**/page.tsx`. JSX lives in a client content component:

```text
src/app/(app)/projects/page.tsx
  → src/components/pages/ProjectsPageContent/ProjectsPageContent.tsx
```

| Route                                | Content component        | Typical props                                 |
| ------------------------------------ | ------------------------ | --------------------------------------------- |
| `/`                                  | `HomePageContent`        | none                                          |
| `/sign-in`                           | `SignInPageContent`      | `{ nextPath }`                                |
| `/share/[token]`                     | `SharePageContent`       | `{ rows }`                                    |
| `/projects`                          | `ProjectsPageContent`    | `{ projects, createAction }`                  |
| `/projects/[projectId]`              | `ProjectOverviewContent` | `{ projectId, name }`                         |
| `/projects/[projectId]/flows`        | `FlowEditor`             | ledger + coverage from the page               |
| `/projects/[projectId]/coverage`     | `CoveragePageContent`    | `{ projectId, name, coverage }`               |
| `/projects/[projectId]/runs`         | `RunsPageContent`        | `{ projectId, name, runs }`                   |
| `/projects/[projectId]/runs/[runId]` | `RunDetailContent`       | `{ results }`                                 |
| `/projects/[projectId]/sessions`     | `SessionsPageContent`    | `{ projectId, name, sessions, createAction }` |
| `/projects/[projectId]/settings`     | `SettingsPageContent`    | storage fields + actions                      |

Content components live at `src/components/pages/<Name>/<Name>.tsx`. Translations use `useTranslation` in the content component so Storybook can render them. If the page shows `ProjectNav`, render it in the content component and pass `name` / `projectId`.

## One component per folder

```text
src/components/flow-tree/FlowDetail/FlowDetail.tsx
src/components/flow-tree/FlowDetail/FlowDetail.stories.tsx
src/components/auth/SignInForm/SignInForm.tsx
```

- **No `index.ts` barrels.** Import the file: `import { FlowDetail } from '@/components/flow-tree/FlowDetail/FlowDetail'`.
- Private helpers stay in the same folder (`FlowDetailAdvancedFields.tsx`, `useSignInActions.ts`).
- Use `git mv` when relocating a tracked component.
- Split when ESLint hits `kj/no-multi-comp`, `max-lines-per-function`, or `max-lines` — see [component-extraction](../../vendor/component-extraction/SKILL.md) and [storybook](../storybook/SKILL.md).

## Tailwind CSS variables

Do not invent new color tokens. Use the variables in [`src/app/globals.css`](../../../apps/web/src/app/globals.css):

| Variable        | Use                                           |
| --------------- | --------------------------------------------- |
| `var(--bg)`     | page background                               |
| `var(--fg)`     | default text                                  |
| `var(--muted)`  | secondary text                                |
| `var(--card)`   | surfaces                                      |
| `var(--border)` | borders (`border-[var(--border)]`)            |
| `var(--accent)` | links, primary buttons (`bg-[var(--accent)]`) |

Light values live on `:root`; dark values on `.dark`.

## API and data

- App routes live in `src/app/`. The catch-all Hono app is `src/app/api/[[...route]]/route.ts` (`/api/v1/…`).
- Auth routes: `src/app/api/auth/[...all]/route.ts`.
- Domain types come from `@testproof/core` and `@testproof/db`. Do not redeclare `Flow`, `Ledger`, or table row shapes.
- User-facing strings: [i18n-management](../i18n-management/SKILL.md).
