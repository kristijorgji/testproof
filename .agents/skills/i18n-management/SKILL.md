---
name: i18n-management
description: >-
  Internationalization for apps/web. Use when adding translation keys or
  user-facing strings. Keys live in locales/{en,de}/common.json; both
  locales must be updated together.
---

# i18n Management

**Never hardcode user-facing strings in `apps/web`.** Copy lives in i18next resources. ESLint `i18next/no-literal-string` (`jsx-text-only`, plus `label` / `placeholder` / `alt` / `title` / `aria-label`) is on for app source.

## Files

```text
apps/web/src/i18n/locales/en/common.json
apps/web/src/i18n/locales/de/common.json
```

Locales are `en` (default) and `de`. The only namespace is `common` (`defaultNS: 'common'`). Resources are wired in [`resources.ts`](../../../apps/web/src/i18n/resources.ts).

## Adding a key

1. Add the English string in `en/common.json`.
2. Add the **same key** in `de/common.json` in the same commit.
3. Use it:

```ts
// Client content components and stories
const { t } = useTranslation();
t('projects.title');

// Server page (until the route is split)
const { t } = await getServerTranslation(await getLocaleFromCookie());
t('projects.title');
```

Prefer `useTranslation` in `*PageContent` client components so Storybook gets real strings from `I18nProvider`. Server `page.tsx` files that still render JSX can use `getServerTranslation` from `@/i18n/server`.

## Conventions

- Nest by feature: `nav.*`, `editor.*`, `projects.*`, `auth.*`.
- Update both locale files together. A key that exists in only one locale is a bug.
- Brand name: `app.name` → "Testproof". Do not scatter the product name in other keys.
- Stories and tests may disable `i18next/no-literal-string` (already off for `*.stories.*` and `*.test.*`). Production UI must not.
- Locale cookie is `locale`. `LocaleSwitcher` and `I18nProvider` own switching — do not invent a second store.

## Adding a locale later

Create `locales/<code>/common.json`, add the code to `locales` in `apps/web/src/i18n/config.ts`, import it in `resources.ts`, and add a flag in `localeFlags`.
