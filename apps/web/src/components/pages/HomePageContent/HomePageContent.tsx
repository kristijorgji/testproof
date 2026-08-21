'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle/ThemeToggle';

export function HomePageContent() {
    const { t } = useTranslation();
    return (
        <main className="mx-auto max-w-2xl p-8">
            <div className="mb-6 flex justify-end gap-3">
                <ThemeToggle />
                <LocaleSwitcher />
            </div>
            <h1 className="mb-2 text-3xl font-semibold">{t('app.name')}</h1>
            <p className="mb-6 text-[var(--muted)]">{t('home.tagline')}</p>
            <Link className="rounded bg-[var(--accent)] px-4 py-2 text-white" href="/projects">
                {t('home.openProjects')}
            </Link>
        </main>
    );
}
