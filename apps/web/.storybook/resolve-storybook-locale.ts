import { type AppLocale, locales } from '../src/i18n/config';

export function resolveStorybookLocale(value: unknown): AppLocale {
    if (typeof value === 'string' && (locales as readonly string[]).includes(value)) {
        return value as AppLocale;
    }
    return 'en';
}

export function parseLocaleFromStorybookUrl(search = ''): AppLocale | null {
    const globals = new URLSearchParams(search).get('globals');
    if (!globals) return null;
    const match = globals.match(/(?:^|;)locale:([^;]+)/);
    const candidate = match?.[1];
    if (candidate != null && (locales as readonly string[]).includes(candidate)) {
        return candidate as AppLocale;
    }
    return null;
}

export function resolveStorybookLocaleForDecorator(
    contextLocale: unknown,
    search = typeof window === 'undefined' ? '' : window.location.search,
): AppLocale {
    return parseLocaleFromStorybookUrl(search) ?? resolveStorybookLocale(contextLocale);
}
