---
name: storybook
description: >-
  Storybook conventions for apps/web. Use when writing or editing
  *.stories.tsx. Covers Pages/ and Flows/ titles, typed Meta, withPageProviders,
  MSW handlers, and @test factories/fixtures.
---

# Storybook

Stories live next to the component: `ComponentName.stories.tsx`. Config is `apps/web/.storybook/` (`@storybook/react-vite`, a11y, `msw-storybook-addon`).

## Titles

| Group     | What belongs there                                                 |
| --------- | ------------------------------------------------------------------ |
| `Pages/…` | Route content components (`Pages/ProjectsPage`, `Pages/FlowsPage`) |
| `Flows/…` | Flow-tree widgets (`Flows/FlowDetail`, `Flows/TargetPicker`)       |

```ts
const meta: Meta<typeof ProjectsPageContent> = {
  title: 'Pages/ProjectsPage',
  component: ProjectsPageContent,
  decorators: [withPageProviders],
};
```

Type the default export as `const meta: Meta<typeof X>`. `satisfies Meta<typeof X>` is acceptable when you need extra inference, but prefer the annotated form above.

## Decorators and MSW

- Page stories use `withPageProviders` (app providers + page chrome). Set `parameters.pathname` when `ProjectNav` needs an active link.
- Widget stories can keep `withAppProviders` (query, theme, i18n) when they do not need page chrome.
- Attach network stubs only when the component fetches:

```ts
parameters: {
    msw: { handlers: [signInEmailHandler(undefined, { status: 401 })] },
},
```

Handlers live under `@test/msw/*`. See [testing](../testing/SKILL.md).

## Data

Import from `@test/factories` and `@test/fixtures`. Do not paste multi-line domain literals into a story.

```ts
import { createProject } from '@test/factories/project';
import { DEMO_LEDGER } from '@test/fixtures/ledger';
```

- Factories (`createX(overrides = {})`) when only a few fields change between variants.
- Fixtures when YAML or a payload must stay byte-stable (diff / publish).

Callbacks: `fn()` from `storybook/test`, never empty `() => {}`.

## Required page variants

Where the UI has a real empty or error state, add it: `Loaded` / `Empty` / `Error`, or mode-specific names (`GitMode`, `FileMode`, `DbMode` for settings). Sign-in `Error` uses `signInEmailHandler` with `status: 401`.
