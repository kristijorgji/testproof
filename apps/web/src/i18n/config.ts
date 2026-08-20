import type { InitOptions } from 'i18next';

import { resources } from './resources';

export const locales = ['en', 'de'] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'en';
export const localeFlags: Record<AppLocale, string> = { en: '🇬🇧', de: '🇩🇪' };
export const LOCALE_COOKIE = 'locale';

export function isAppLocale(value: string | undefined): value is AppLocale {
    return value !== undefined && (locales as readonly string[]).includes(value);
}

export function getI18nConfig(overrides: Partial<InitOptions> = {}): InitOptions {
    return {
        resources,
        defaultNS: 'common',
        ns: ['common'],
        supportedLngs: [...locales],
        fallbackLng: defaultLocale,
        interpolation: {
            escapeValue: false,
        },
        ...overrides,
    };
}
