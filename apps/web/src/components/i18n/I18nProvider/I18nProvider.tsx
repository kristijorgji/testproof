'use client';

import { type ReactElement, type ReactNode, useLayoutEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n/client';
import { type AppLocale } from '@/i18n/config';

export function I18nProvider({ locale, children }: { locale: AppLocale; children: ReactNode }): ReactElement {
    useLayoutEffect(() => {
        if (i18n.language !== locale) {
            void i18n.changeLanguage(locale);
        }
    }, [locale]);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
