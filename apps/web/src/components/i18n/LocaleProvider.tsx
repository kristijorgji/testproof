'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { messages, type AppLocale } from './messages';

const LocaleContext = createContext<{ locale: AppLocale; t: (key: string) => string }>({
    locale: 'en',
    t: (key) => key,
});

export function LocaleProvider({ locale, children }: { locale: AppLocale; children: ReactNode }) {
    const value = useMemo(
        () => ({
            locale,
            t: (key: string) => messages[locale][key] ?? messages.en[key] ?? key,
        }),
        [locale],
    );
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): (key: string) => string {
    return useContext(LocaleContext).t;
}
