'use client';

import { useRouter } from 'next/navigation';
import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { type AppLocale, LOCALE_COOKIE, localeFlags, locales } from '@/i18n/config';

export function LocaleSwitcher(): ReactElement {
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const current = (locales as readonly string[]).includes(i18n.language) ? (i18n.language as AppLocale) : 'en';

    function setLocale(next: AppLocale): void {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        void i18n.changeLanguage(next);
        router.refresh();
    }

    return (
        <label className="inline-flex items-center gap-2 text-sm">
            <span className="sr-only">{t('locale.label')}</span>
            <select
                aria-label={t('locale.label')}
                className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1"
                value={current}
                onChange={(event) => setLocale(event.target.value as AppLocale)}
            >
                {locales.map((locale) => (
                    <option key={locale} value={locale}>
                        {localeFlags[locale]} {locale.toUpperCase()}
                    </option>
                ))}
            </select>
        </label>
    );
}
